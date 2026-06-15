import math
from typing import Dict, Any, List
from app.models.schemas import SellerAnalysisRequest, HighRiskProduct, RiskBreakdown, SellerBenchmark

class ScoringEngine:
    AVG_RETURN_COST = 14.12

    @staticmethod
    def calculate_scores(request: SellerAnalysisRequest) -> Dict[str, Any]:
        # 1. Executive KPIs
        total_orders = request.totalOrders
        total_returns = request.totalReturns
        fraud_cases = request.fraudCases
        
        returns_per_100 = (total_returns / total_orders * 100.0) if total_orders > 0 else 0.0
        returns_per_100 = round(returns_per_100, 2)
        
        estimated_revenue_loss = round(total_returns * ScoringEngine.AVG_RETURN_COST, 2)
        
        fraud_rate_pct = (fraud_cases / total_orders * 100.0) if total_orders > 0 else 0.0
        
        # 2. Fraud Risk Score (0-100)
        if fraud_cases > 0:
            fraud_risk_score = round(min(100.0, fraud_rate_pct * 40.0 + fraud_cases * 0.1 + 2.5))
        else:
            fraud_risk_score = 0
            
        # 3. Return Risk Score (0-100)
        max_prod_return = 0.0
        if request.products:
            max_prod_return = max(p.returnRate for p in request.products)
        else:
            max_prod_return = returns_per_100
            
        if total_returns > 0:
            return_risk_score = round(min(100.0, returns_per_100 * 5.0 + max_prod_return * 1.5 + 3.75))
        else:
            return_risk_score = 0
            
        # 4. Sustainability Score (0-100)
        don_rate = request.donationRate if request.donationRate is not None else request.packagingScore
        rec_rate = request.recyclingRate if request.recyclingRate is not None else request.packagingScore
        sustainability_score = round(0.8 * request.packagingScore + 0.1 * don_rate + 0.1 * rec_rate)
        sustainability_score = max(0, min(100, sustainability_score))
        
        # 5. Seller Health Score (0-100)
        rating_comp = (request.averageRating / 5.0) * 100.0
        return_health = max(0.0, 100.0 - returns_per_100 * 2.0)
        fraud_health = max(0.0, 100.0 - float(fraud_risk_score))
        
        if total_orders == 0:
            health_score = 0
        else:
            health_score = round(0.4 * rating_comp + 0.3 * sustainability_score + 0.2 * return_health + 0.1 * fraud_health)
            health_score = max(0, min(100, health_score))
        
        # 6. Seller Tier
        if health_score >= 90:
            tier = "PLATINUM"
        elif health_score >= 80:
            tier = "GOLD"
        elif health_score >= 70:
            tier = "SILVER"
        else:
            tier = "NEEDS_ATTENTION"
            
        # 7. Fraud Exposure Level
        if fraud_rate_pct < 0.5:
            fraud_exposure = "LOW"
        elif fraud_rate_pct < 1.5:
            fraud_exposure = "MEDIUM"
        else:
            fraud_exposure = "HIGH"
            
        # 8. Overall Risk Level
        if fraud_risk_score >= 50 or return_risk_score >= 75:
            overall_risk = "CRITICAL"
        elif fraud_risk_score >= 30 or return_risk_score >= 50 or health_score < 70:
            overall_risk = "HIGH"
        elif fraud_risk_score >= 15 or return_risk_score >= 30 or health_score < 80:
            overall_risk = "MEDIUM"
        else:
            overall_risk = "LOW"
            
        # 9. Confidence Score
        # Completeness metrics
        confidence = 50
        if total_orders > 0:
            confidence += min(15, int(math.log10(total_orders) * 3.75))
        if request.products:
            confidence += min(10, len(request.products) * 10)
        if request.averageRating > 0:
            confidence += 5
        if request.packagingScore > 0:
            confidence += 5
        if total_returns > 0:
            confidence += 2
        confidence_score = max(0, min(100, confidence))
        
        # 10. High Risk Products List
        high_risk_list = []
        for p in request.products:
            if p.returnRate > 5.0:
                level = "LOW"
                if p.returnRate > 10.0:
                    level = "HIGH"
                elif p.returnRate > 5.0:
                    level = "MEDIUM"
                
                # Dynamic reason selection in priority order
                cat_clean = p.category.lower() if p.category else ""
                is_packaging = "packaging" in cat_clean or "box" in cat_clean
                is_fashion = "apparel" in cat_clean or "cloth" in cat_clean or "shoe" in cat_clean or "fashion" in cat_clean

                if p.returnRate >= 15.0:
                    reason = "QUALITY_DEFECT"
                elif is_packaging:
                    reason = "TRANSIT_DAMAGE"
                elif is_fashion:
                    reason = "SIZE_MISMATCH"
                else:
                    reason = "EXPECTATION_MISMATCH"
                
                high_risk_list.append(HighRiskProduct(
                    productId=p.productId,
                    returnRate=p.returnRate,
                    riskLevel=level,
                    reason=reason
                ))
                
        # 11. Risk Breakdown
        rating_risk = (5.0 - request.averageRating) * 20.0
        sustainability_risk = 100.0 - sustainability_score
        returns_weight = float(return_risk_score)
        fraud_weight = float(fraud_risk_score)
        rating_weight = float(rating_risk)
        sustainability_weight = float(sustainability_risk)
        
        total_risk_weight = returns_weight + fraud_weight + rating_weight + sustainability_weight
        if total_risk_weight > 0:
            returns_contrib = int(round((returns_weight / total_risk_weight) * 100))
            fraud_contrib = int(round((fraud_weight / total_risk_weight) * 100))
            sustainability_contrib = int(round((sustainability_weight / total_risk_weight) * 100))
            rating_contrib = int(round((rating_weight / total_risk_weight) * 100))
            
            # Normalize to sum exactly to 100
            diff = 100 - (returns_contrib + fraud_contrib + sustainability_contrib + rating_contrib)
            if diff != 0:
                contribs = [
                    ("returns", returns_contrib),
                    ("fraud", fraud_contrib),
                    ("sustainability", sustainability_contrib),
                    ("rating", rating_contrib)
                ]
                contribs.sort(key=lambda x: x[1], reverse=True)
                largest_key, largest_val = contribs[0]
                adjusted_val = largest_val + diff
                
                # Map back adjusted value
                for i in range(len(contribs)):
                    if contribs[i][0] == largest_key:
                        contribs[i] = (largest_key, adjusted_val)
                        break
                contrib_dict = dict(contribs)
                returns_contrib = contrib_dict["returns"]
                fraud_contrib = contrib_dict["fraud"]
                sustainability_contrib = contrib_dict["sustainability"]
                rating_contrib = contrib_dict["rating"]
        else:
            returns_contrib = 25
            fraud_contrib = 25
            sustainability_contrib = 25
            rating_contrib = 25
            
        risk_breakdown = RiskBreakdown(
            returnsContribution=returns_contrib,
            fraudContribution=fraud_contrib,
            sustainabilityContribution=sustainability_contrib,
            ratingContribution=rating_contrib
        )
        
        # 12. Benchmarking
        # Returns benchmark
        if returns_per_100 < 2.0:
            ret_perf = "EXCELLENT"
        elif returns_per_100 < 5.0:
            ret_perf = "ABOVE_AVERAGE"
        elif returns_per_100 < 10.0:
            ret_perf = "AVERAGE"
        elif returns_per_100 < 15.0:
            ret_perf = "BELOW_AVERAGE"
        else:
            ret_perf = "POOR"
            
        # Fraud benchmark
        if fraud_rate_pct < 0.2:
            fraud_perf = "EXCELLENT"
        elif fraud_rate_pct < 0.5:
            fraud_perf = "GOOD"
        elif fraud_rate_pct < 1.5:
            fraud_perf = "AVERAGE"
        else:
            fraud_perf = "POOR"
            
        # Sustainability benchmark
        if sustainability_score >= 85:
            sust_perf = "EXCELLENT"
        elif sustainability_score >= 70:
            sust_perf = "GOOD"
        elif sustainability_score >= 50:
            sust_perf = "AVERAGE"
        else:
            sust_perf = "POOR"
            
        benchmark = SellerBenchmark(
            healthPercentile=health_score,
            returnPerformance=ret_perf,
            fraudPerformance=fraud_perf,
            sustainabilityPerformance=sust_perf
        )
        
        return {
            "sellerHealthScore": health_score,
            "sellerTier": tier,
            "returnRiskScore": return_risk_score,
            "fraudRiskScore": fraud_risk_score,
            "sustainabilityScore": sustainability_score,
            "estimatedRevenueLoss": estimated_revenue_loss,
            "returnsPer100Orders": returns_per_100,
            "highRiskProducts": high_risk_list,
            "fraudExposureLevel": fraud_exposure,
            "overallRiskLevel": overall_risk,
            "confidenceScore": confidence_score,
            "riskBreakdown": risk_breakdown,
            "sellerBenchmark": benchmark,
            "fraudRatePct": fraud_rate_pct
        }
