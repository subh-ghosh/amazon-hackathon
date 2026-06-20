import math
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.models.schemas import EvaluateRequest, EvaluateResponse, DecisionFactor, AuditEvent, RecommendationDetails

class EvaluationEngine:
    @staticmethod
    def get_timestamp() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def normalize_factors(factors: Dict[str, int]) -> List[DecisionFactor]:
        total = sum(factors.values())
        if total == 0:
            return [DecisionFactor(factor=k, weight=0) for k in factors]
        
        normalized = []
        running_sum = 0
        for k, v in factors.items():
            w = int((v / total) * 100)
            normalized.append(DecisionFactor(factor=k, weight=w))
            running_sum += w
            
        remainder = 100 - running_sum
        if remainder != 0 and len(normalized) > 0:
            # Add remainder to the one with the highest weight
            max_idx = max(range(len(normalized)), key=lambda i: normalized[i].weight)
            normalized[max_idx].weight += remainder
            
        return normalized

    @classmethod
    def evaluate(
        cls, 
        request: EvaluateRequest, 
        correlation_id: str, 
        past_customer_decisions: List[str] = None
    ) -> EvaluateResponse:
        decision_timestamp = cls.get_timestamp()
        audit_trail: List[AuditEvent] = []
        rules_triggered: List[str] = []
        
        # 1. Audit Event: Idempotency Checked (passed by route layer)
        audit_trail.append(AuditEvent(
            timestamp=cls.get_timestamp(),
            event="IDEMPOTENCY_CHECKED",
            details=f"Verified requestId '{request.requestId}' is unique. Initializing evaluation.",
            correlationId=correlation_id
        ))

        # 2. Fraud Escalation check
        fraud_escalated = False
        fraud_reason = ""
        
        # Check input history
        if request.fraudRiskScore > 60:
            fraud_escalated = True
            fraud_reason = "fraudRiskScore > 60"
        elif request.customerTrustScore < 40:
            fraud_escalated = True
            fraud_reason = "customerTrustScore < 40"
        else:
            # Check integration signals
            for sig in (request.fraudSignals or []):
                if sig.severity == "HIGH":
                    fraud_escalated = True
                    fraud_reason = f"High severity fraud signal: {sig.insight}"
                    break
            if not fraud_escalated:
                for hist in (request.historicalKnowledgeInsights or []):
                    if hist.severity == "HIGH":
                        fraud_escalated = True
                        fraud_reason = f"High severity historical knowledge insight: {hist.insight}"
                        break
        
        # Check customer frequency escalation (if past evaluations exist)
        if past_customer_decisions and len(past_customer_decisions) >= 3:
            fraud_escalated = True
            fraud_reason = f"Customer has {len(past_customer_decisions)} prior refund requests in 24 hours."

        audit_trail.append(AuditEvent(
            timestamp=cls.get_timestamp(),
            event="FRAUD_ESCALATION_CHECKED",
            details=f"Fraud status checked. Escalated: {fraud_escalated}. Reason: {fraud_reason or 'None'}",
            correlationId=correlation_id
        ))

        # 3. Category Threshold Rules & Overrides
        category_clean = request.category.strip().lower()
        
        # Indian market thresholds (in USD equivalent for API compatibility)
        # In India, Amazon requires return for items above ₹2500-5000 depending on category
        # ₹2500 ≈ $30, ₹5000 ≈ $60, ₹1500 ≈ $18
        max_value_threshold = 60.0  # Default: ₹5000 equivalent
        if category_clean == "electronics":
            max_value_threshold = 40.0  # ₹3300 — electronics are worth returning
        elif category_clean in ("grocery", "beauty"):
            max_value_threshold = 1000.0  # Hygiene rules — never require return
        elif category_clean in ("apparel", "clothing", "footwear"):
            max_value_threshold = 75.0  # ₹6200 — clothing is hard to resell
        elif category_clean in ("home goods", "home", "kitchen"):
            max_value_threshold = 100.0  # ₹8300 — bulky items expensive to ship back
            
        if request.sellerPolicyOverrides and request.sellerPolicyOverrides.maxReturnlessValue is not None:
            max_value_threshold = request.sellerPolicyOverrides.maxReturnlessValue
            rules_triggered.append("SellerOverride_MaxValue")

        audit_trail.append(AuditEvent(
            timestamp=cls.get_timestamp(),
            event="CATEGORY_THRESHOLD_EVALUATED",
            details=f"Category '{request.category}' evaluated. Threshold value set to ${max_value_threshold:.2f}.",
            correlationId=correlation_id
        ))

        # 4. Decision Tree Routing
        decision = ""
        business_reason = ""
        raw_factors = {}

        # Check category force review override
        force_review = False
        if request.sellerPolicyOverrides and request.sellerPolicyOverrides.forceManualReviewCategories:
            if request.category in request.sellerPolicyOverrides.forceManualReviewCategories:
                force_review = True
                rules_triggered.append("SellerOverride_ForceManualReviewCategory")
                
        if force_review:
            decision = "MANUAL_REVIEW"
            business_reason = f"Category '{request.category}' is blacklisted by seller policy overrides."
            rules_triggered.append("ForceManualReviewCategory")
            raw_factors = {"Seller Restriction": 50, "Operational Protocol": 50}
        elif fraud_escalated:
            decision = "MANUAL_REVIEW"
            business_reason = f"Risk verification needed: {fraud_reason}."
            rules_triggered.append("FraudEscalationRule")
            raw_factors = {
                "Fraud Risk Score": request.fraudRiskScore,
                "Customer Trust Deficit": max(0, 100 - request.customerTrustScore),
                "Risk Verification Trigger": 50
            }
        elif request.orderValue >= max_value_threshold:
            decision = "RETURN_REQUIRED"
            business_reason = f"Order value (${request.orderValue:.2f}) exceeds the category threshold (${max_value_threshold:.2f})."
            rules_triggered.append("HighValueProductRule")
            raw_factors = {
                "High Product Value": int(request.orderValue),
                "Low Shipping Cost Ratio": int(max(1, request.orderValue - request.returnShippingCost)),
                "Policy Compliance": 40
            }
        elif category_clean in ("grocery", "beauty"):
            allow_recycle = True
            if request.sellerPolicyOverrides and request.sellerPolicyOverrides.allowRecycling is False:
                allow_recycle = False
                rules_triggered.append("SellerOverride_DenyRecycling")
                
            if allow_recycle:
                decision = "REFUND_AND_RECYCLE"
                business_reason = f"Hygiene and spoilage rules prevent return of {request.category} products."
                rules_triggered.append("GroceryBeautyRecyclingRule")
                raw_factors = {
                    "Hygiene/Safety Avoidance": 80,
                    "Disposal Avoidance": 50,
                    "Return Shipping Cost": int(request.returnShippingCost * 5)
                }
            else:
                decision = "RETURN_REQUIRED"
                business_reason = f"Hygiene product return required due to seller override disabling recycling."
                rules_triggered.append("GroceryBeautyReturnFallbackRule")
                raw_factors = {
                    "Seller Override Action": 60,
                    "Hygiene Return Mandate": 40
                }
        elif (
            request.orderValue < 18.0 and
            request.fraudRiskScore < 20
        ):
            # India: Items under ₹1500 ($18) — returnless refund (keep item)
            # Recovery value is negative after reverse logistics + inspection
            decision = "RETURNLESS_REFUND"
            business_reason = "Low-value item where return logistics cost exceeds recovery value."
            rules_triggered.append("LowValueReturnlessRule")
            raw_factors = {
                "Low Item Value": int(max(1, 18 - request.orderValue) * 5),
                "Low Fraud Risk": max(1, 100 - request.fraudRiskScore),
                "Customer Trust": request.customerTrustScore
            }
        elif (
            request.orderValue < 35.0 and
            request.condition in ("NEW", "LIKE_NEW") and
            request.customerTrustScore >= 70 and
            (not request.sellerPolicyOverrides or request.sellerPolicyOverrides.allowDonation is not False)
        ):
            # India: Items ₹1500-₹2900 ($18-$35) in good condition — donate & refund
            decision = "REFUND_AND_DONATE"
            business_reason = "Low-moderate value item in good condition. Donation saves logistics cost and helps community."
            rules_triggered.append("DonationEligibleRule")
            raw_factors = {
                "Circular Donation Benefit": 60,
                "Item Restockable Condition": 40,
                "Logistics Cost Avoidance": 30
            }
        elif (
            request.orderValue < 35.0 and
            request.condition in ("DAMAGED", "USED") and
            (not request.sellerPolicyOverrides or request.sellerPolicyOverrides.allowRecycling is not False)
        ):
            # India: Items ₹1500-₹2900 ($18-$35) in poor condition — recycle & refund
            decision = "REFUND_AND_RECYCLE"
            business_reason = "Low-moderate value item in poor condition. Recycling is more sustainable than return shipping."
            rules_triggered.append("RecyclingEligibleRule")
            raw_factors = {
                "Circular Recycling Benefit": 70,
                "Waste Avoidance": 50,
                "Logistics Cost Avoidance": 30
            }
        elif (
            18.0 <= request.orderValue < 80.0 and
            request.customerTrustScore >= 60
        ):
            # India: Items ₹1500-₹6600 ($18-$80) — partial refund option
            # Customer keeps item, gets 30-50% back. Amazon saves reverse logistics.
            decision = "PARTIAL_REFUND"
            business_reason = "Moderate value item. Partial refund saves reverse logistics while compensating customer."
            rules_triggered.append("ModerateValuePartialRefundRule")
            raw_factors = {
                "Moderate Item Value": 50,
                "Logistics Savings": 40,
                "Customer Trust": request.customerTrustScore
            }
        else:
            decision = "RETURN_REQUIRED"
            business_reason = "Standard return policy applies. Shipping cost is within normal limits."
            rules_triggered.append("StandardReturnRequiredRule")
            raw_factors = {
                "Standard Policy Standard": 60,
                "Shipping Cost Tolerable": 40,
                "Value Protection": 30
            }

        decision_factors = cls.normalize_factors(raw_factors)

        audit_trail.append(AuditEvent(
            timestamp=cls.get_timestamp(),
            event="DECISION_ROUTED",
            details=f"Evaluated decision tree. Selected '{decision}' based on rules: {', '.join(rules_triggered)}.",
            correlationId=correlation_id
        ))

        # 5. Calculations
        # Refund Amount
        if decision in ("RETURNLESS_REFUND", "REFUND_AND_DONATE", "REFUND_AND_RECYCLE"):
            refund_amount = request.orderValue
        elif decision == "PARTIAL_REFUND":
            refund_amount = round(request.orderValue * 0.5, 2)
        else:
            refund_amount = 0.0

        # Processing & Logistics Fees (Indian market — in USD equivalent)
        # India processing costs are lower: ₹50-200 per item ($0.60-$2.40)
        processing_fee = 1.0  # ₹83 base
        if category_clean == "electronics":
            processing_fee = 2.5  # ₹207 — testing required
        elif category_clean in ("grocery", "beauty"):
            processing_fee = 0.5  # ₹42 — minimal handling
        elif category_clean in ("apparel", "clothing", "footwear"):
            processing_fee = 1.2  # ₹100 — quality check
        elif category_clean in ("home goods", "home", "kitchen"):
            processing_fee = 1.8  # ₹150 — size handling
        elif category_clean == "furniture":
            processing_fee = 3.0  # ₹250 — bulky item handling

        estimated_reverse_logistics_cost = round(request.returnShippingCost + processing_fee, 2)

        if decision == "RETURN_REQUIRED":
            estimated_processing_cost = processing_fee
        elif decision == "MANUAL_REVIEW":
            estimated_processing_cost = 2.0
        elif decision in ("REFUND_AND_DONATE", "REFUND_AND_RECYCLE"):
            estimated_processing_cost = 1.0
        else:  # RETURNLESS_REFUND or PARTIAL_REFUND (kept by customer, no recovery processing cost)
            estimated_processing_cost = 0.0

        # Net Savings / Estimated Savings
        if decision in ("RETURNLESS_REFUND", "PARTIAL_REFUND", "REFUND_AND_DONATE", "REFUND_AND_RECYCLE"):
            # If we keep the item, we save reverse logistics cost minus any local processing cost.
            # Additionally, for PARTIAL_REFUND we don't refund the full value.
            net_savings = round(estimated_reverse_logistics_cost - estimated_processing_cost + (request.orderValue - refund_amount), 2)
            estimated_savings = round(request.returnShippingCost, 2)
        else:
            net_savings = 0.0
            estimated_savings = 0.0

        # Confidence Score
        confidence_score = max(0, min(100, request.customerTrustScore - int(request.fraudRiskScore * 0.5)))

        # Sustainability Impact
        if decision == "RETURN_REQUIRED":
            sustainability_impact = "NEGATIVE"
        elif decision == "MANUAL_REVIEW":
            sustainability_impact = "NEUTRAL"
        else:
            sustainability_impact = "POSITIVE"

        # Overall Risk Level
        if request.fraudRiskScore > 75 or request.returnRiskScore > 75 or request.customerTrustScore < 40:
            overall_risk = "HIGH"
        elif request.fraudRiskScore > 25 or request.returnRiskScore > 25 or request.customerTrustScore < 70:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"

        # Recommended Action
        recommended_action_map = {
            "RETURNLESS_REFUND": "KEEP_ITEM",
            "RETURN_REQUIRED": "SHIP_BACK",
            "PARTIAL_REFUND": "KEEP_ITEM",
            "REFUND_AND_DONATE": "DONATE",
            "REFUND_AND_RECYCLE": "RECYCLE",
            "MANUAL_REVIEW": "HOLD_FOR_REVIEW"
        }
        recommended_action = recommended_action_map[decision]

        # Recommended Destination
        # DONATION | RECYCLING | LIQUIDATION | DISPOSAL
        if decision == "REFUND_AND_DONATE":
            recommended_destination = "DONATION"
        elif decision == "REFUND_AND_RECYCLE":
            recommended_destination = "RECYCLING"
        elif decision in ("RETURNLESS_REFUND", "PARTIAL_REFUND"):
            if request.condition in ("NEW", "OPEN_BOX", "LIKE_NEW"):
                if category_clean in ("electronics", "home goods"):
                    recommended_destination = "LIQUIDATION"
                else:
                    recommended_destination = "DONATION"
            elif request.condition in ("USED", "REFURBISHED"):
                recommended_destination = "LIQUIDATION"
            else:
                recommended_destination = "RECYCLING"
        elif decision == "RETURN_REQUIRED":
            if request.condition in ("NEW", "OPEN_BOX", "LIKE_NEW", "USED", "REFURBISHED"):
                recommended_destination = "LIQUIDATION"
            else:
                recommended_destination = "RECYCLING"
        else: # MANUAL_REVIEW
            recommended_destination = "DISPOSAL"

        # Appeal Workflow Support
        if decision == "MANUAL_REVIEW":
            appeal_eligible = True
            appeal_reason = "Manual review decisions are always appeal eligible."
        elif decision == "RETURN_REQUIRED" and request.customerTrustScore >= 80:
            appeal_eligible = True
            appeal_reason = "Customer may appeal return requirement due to high trust rating."
        else:
            appeal_eligible = False
            appeal_reason = "Standard automated decision is final."

        # Circular Economy Metrics
        if decision in ("RETURN_REQUIRED", "MANUAL_REVIEW"):
            estimated_co2_saved = 0.0
            estimated_waste_diverted = 0.0
        else:
            estimated_co2_saved = round(1.5 + request.weightKg * 0.8, 2)
            estimated_waste_diverted = round(request.weightKg, 2)

        circularity_score_map = {
            "REFUND_AND_DONATE": 95,
            "REFUND_AND_RECYCLE": 85,
            "RETURNLESS_REFUND": 75,
            "PARTIAL_REFUND": 60,
            "RETURN_REQUIRED": 20,
            "MANUAL_REVIEW": 50
        }
        circularity_score = circularity_score_map[decision]

        # Knowledge Graph Integration (S12)
        similar_historical_decisions = []
        if past_customer_decisions:
            similar_historical_decisions = list(set(past_customer_decisions))[:5]
        else:
            # S12 Mock context
            similar_historical_decisions = ["RETURNLESS_REFUND"]
            
        historical_success_rate = 92
        if request.customerTrustScore >= 90:
            historical_success_rate = 96
        elif request.customerTrustScore < 50:
            historical_success_rate = 78

        # Recommendations details
        rec_next_action_map = {
            "RETURNLESS_REFUND": "Approve returnless refund and instruct customer to keep the item.",
            "RETURN_REQUIRED": "Generate return shipping label and request customer to ship item back.",
            "PARTIAL_REFUND": "Offer customer partial refund to keep the item without returning.",
            "REFUND_AND_DONATE": "Approve refund and instruct customer to donate the item to a local partner.",
            "REFUND_AND_RECYCLE": "Approve refund and instruct customer to drop item at a local recycling partner.",
            "MANUAL_REVIEW": "Route case to fraud team for manual review before processing refund."
        }
        rec_cust_msg_map = {
            "RETURNLESS_REFUND": "We have processed your refund. You don't need to return the item. Please keep it.",
            "RETURN_REQUIRED": "Please use the generated label to return the item to complete your refund.",
            "PARTIAL_REFUND": "We would like to offer you a partial refund to keep the item. No return required.",
            "REFUND_AND_DONATE": "We have processed your refund. Please donate this item to a local charity of your choice.",
            "REFUND_AND_RECYCLE": "We have processed your refund. Please dispose of this item responsibly at a recycling center.",
            "MANUAL_REVIEW": "Your request is being reviewed. We will update you within 24 hours."
        }
        rec_seller_act_map = {
            "RETURNLESS_REFUND": "Debit refund from balance. Return shipping cost saved.",
            "RETURN_REQUIRED": "Debit refund from balance upon receipt. Charge return shipping cost.",
            "PARTIAL_REFUND": "Debit partial refund from balance. Return shipping cost saved.",
            "REFUND_AND_DONATE": "Debit refund from balance. Credit circular tax rebate.",
            "REFUND_AND_RECYCLE": "Debit refund from balance. Credit waste management rebate.",
            "MANUAL_REVIEW": "Hold refund debit pending review outcome."
        }

        recommendations = RecommendationDetails(
            recommendedNextAction=rec_next_action_map[decision],
            customerMessage=rec_cust_msg_map[decision],
            sellerAction=rec_seller_act_map[decision]
        )

        # 6. Audit Event: Decision generated
        audit_trail.append(AuditEvent(
            timestamp=cls.get_timestamp(),
            event="DECISION_GENERATED",
            details=f"Decision successfully generated for request '{request.requestId}': '{decision}'",
            correlationId=correlation_id
        ))

        # Explainable business reason text
        decision_reason_explain = f"{decision} because {business_reason}"

        return EvaluateResponse(
            requestId=request.requestId,
            decision=decision,
            confidenceScore=confidence_score,
            refundAmount=refund_amount,
            estimatedSavings=estimated_savings,
            sustainabilityImpact=sustainability_impact,
            businessReason=business_reason,
            overallRiskLevel=overall_risk,
            recommendedAction=recommended_action,
            decisionReason=decision_reason_explain,
            decisionFactors=decision_factors,
            decisionTimestamp=decision_timestamp,
            rulesTriggered=rules_triggered,
            modelVersion="v1.0",
            auditTrail=audit_trail,
            estimatedCO2Saved=estimated_co2_saved,
            estimatedWasteDivertedKg=estimated_waste_diverted,
            circularityScore=circularity_score,
            recommendedDestination=recommended_destination,
            appealEligible=appeal_eligible,
            appealReason=appeal_reason,
            estimatedProcessingCost=estimated_processing_cost,
            estimatedReverseLogisticsCost=estimated_reverse_logistics_cost,
            netSavings=net_savings,
            similarHistoricalDecisions=similar_historical_decisions,
            historicalSuccessRate=historical_success_rate,
            recommendations=recommendations,
            isDuplicateRequest=False, # Will be set by API routes if duplicate
            originalDecisionTimestamp=None,
            serviceVersion="1.0.0",
            environment="production",
            generatedAt=cls.get_timestamp()
        )
