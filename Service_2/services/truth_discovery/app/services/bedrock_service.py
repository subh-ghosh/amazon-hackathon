import json
import logging
import boto3
from typing import List, Dict, Any
from app.config import settings
from app.schemas import (
    TruthAnalyzeRequest, 
    ProductIntelligence, 
    SellerIntelligence, 
    RootCauseEnum,
    EvidenceType
)

logger = logging.getLogger(__name__)

class BedrockService:
    def __init__(self):
        self._client = None
        logger.info("BedrockService initialized (lazy-loading enabled)")

    @property
    def client(self):
        """Lazy-loads the Bedrock Runtime client dynamically when MOCK_AWS & MOCK_BEDROCK are disabled."""
        if not settings.MOCK_AWS and not settings.MOCK_BEDROCK and self._client is None:
            logger.info("Instantiating production Bedrock Runtime client connection")
            self._client = boto3.client(
                service_name="bedrock-runtime",
                region_name=settings.AWS_REGION
            )
        return self._client

    def discover_root_cause(
        self,
        request: TruthAnalyzeRequest,
        product_intel: ProductIntelligence,
        seller_intel: SellerIntelligence
    ) -> Dict[str, Any]:
        """Orchestrates Bedrock reasoning using Claude 3.5 to determine return root cause."""
        
        if settings.MOCK_AWS or settings.MOCK_BEDROCK:
            return self._generate_mock_reasoning(request, product_intel, seller_intel)

        # Build context
        context = {
            "statedReason": request.statedReason,
            "customerComment": request.customerComment,
            "images": request.images,
            "productIntelligence": {
                "productId": product_intel.productId,
                "category": product_intel.category,
                "title": product_intel.title,
                "knownIssues": product_intel.knownIssues,
                "historicalReturnRate": product_intel.returnRate
            },
            "sellerIntelligence": {
                "sellerId": seller_intel.sellerId,
                "defectRate": seller_intel.defectRate,
                "counterfeitAlerts": seller_intel.counterfeitAlerts,
                "trustScore": seller_intel.trustScore
            }
        }

        # Root cause enums & evidence types converted to strings
        valid_causes = ", ".join([cause.value for cause in RootCauseEnum])
        valid_evidence_types = ", ".join([ev.value for ev in EvidenceType])

        system_prompt = f"""
        You are an Amazon Circular Intelligence auditor.
        Your task is to analyze return telemetries and determine the TRUE actual root cause behind this customer return.

        You MUST choose the rootCause value ONLY from this list:
        [{valid_causes}]

        You MUST classify each evidence item using one of these evidence types:
        [{valid_evidence_types}]

        For each evidence item:
        - type: ONE OF THE SPECIFIED EVIDENCE TYPES.
        - description: detailed description of the evidence indicator.
        - weight: float indicating importance (0.0 to 1.0). The total sum of all weights MUST be less than or equal to 1.0.

        Strict Guideline Definitions:
        - SIZE_MISMATCH: Customer got wrong size, item fits smaller/larger than listed.
        - EXPECTATION_MISMATCH: Customer states item color, model, texture, quality is not as they expected or differs from photo.
        - PACKAGING_DAMAGE: Shipping box is damaged, item leaked during transit.
        - COMPATIBILITY_ISSUE: Software incompatibilities, app connection failures, or connection limitations.
        - SELLER_QUALITY_ISSUE: Bad seller reputation, counterfeit indicators, item parts missing, defective seller QA.
        - MANUFACTURING_DEFECT: Dead pixels, broken materials out-of-box, physical component failure.
        - COUNTERFEIT: Counterfeit suspicion or alerts matching seller index.
        - CUSTOMER_MISUSE: Accidentally broken by user, incorrect usage/setup attempts.

        You MUST respond ONLY in raw JSON format matching this schema:
        {{
          "rootCause": "ONE_OF_THE_ENUM_VALUES",
          "confidence": float_between_0_and_1,
          "evidence": [
            {{
              "type": "ONE_OF_THE_EVIDENCE_TYPES",
              "description": "description text",
              "weight": float
            }}
          ]
        }}
        Do not add any markup, tags, markdown block backticks (like ```json), or introduction. Return only the raw JSON.
        """

        user_content = f"Analyze this return case payload:\n{json.dumps(context, indent=2)}"

        try:
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "system": system_prompt,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": user_content}
                        ]
                    }
                ]
            })

            logger.info("Invoking Bedrock model Claude 3.5 Sonnet for truth analysis")
            response = self.client.invoke_model(
                modelId=settings.BEDROCK_MODEL_ID,
                body=body
            )
            
            response_body = json.loads(response.get("body").read())
            raw_text = response_body["content"][0]["text"].strip()
            
            # Sanitize response
            if raw_text.startswith("```json"):
                raw_text = raw_text.replace("```json", "", 1).strip()
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3].strip()

            parsed = json.loads(raw_text)
            
            # 1. Validate rootCause
            if parsed.get("rootCause") not in [cause.value for cause in RootCauseEnum]:
                logger.warning(f"Bedrock returned invalid rootCause: {parsed.get('rootCause')}. Falling back.")
                parsed["rootCause"] = RootCauseEnum.EXPECTATION_MISMATCH.value

            # 2. Validate and clean evidence
            valid_ev = []
            for item in parsed.get("evidence", []):
                t = item.get("type")
                if t not in [ev.value for ev in EvidenceType]:
                    t = EvidenceType.HEURISTIC_RULE.value
                
                valid_ev.append({
                    "type": t,
                    "description": item.get("description", "Analyzed evidence"),
                    "weight": min(1.0, max(0.0, float(item.get("weight", 0.1))))
                })
            
            # Normalize weights if total > 1.0 to prevent Pydantic validation failure
            total_weight = sum(ev["weight"] for ev in valid_ev)
            if total_weight > 1.0:
                logger.warning(f"Total Bedrock evidence weight is {total_weight} which exceeds 1.0. Normalizing weights.")
                for ev in valid_ev:
                    ev["weight"] = round(ev["weight"] / total_weight, 4)

            parsed["evidence"] = valid_ev
            return parsed
            
        except Exception as e:
            logger.error(f"Error executing Bedrock analysis: {e}. Falling back to heuristics.")
            return self._generate_mock_reasoning(request, product_intel, seller_intel)

    def _generate_mock_reasoning(
        self,
        request: TruthAnalyzeRequest,
        product_intel: ProductIntelligence = None,
        seller_intel: SellerIntelligence = None
    ) -> Dict[str, Any]:
        """Provides structured mock outputs matching the new Pydantic schema."""
        comment = request.customerComment.lower()
        
        # Check product intelligence issues
        known_issues = []
        if product_intel and product_intel.knownIssues:
            known_issues = [issue.lower() for issue in product_intel.knownIssues]

        if (
            "size" in comment or "fit" in comment or "small" in comment or "large" in comment or "tight" in comment or
            any("small" in issue or "size" in issue or "fit" in issue for issue in known_issues)
        ):
            cause = RootCauseEnum.SIZE_MISMATCH.value
            evidence = [
                {"type": EvidenceType.REVIEW_PATTERN.value, "description": "27 reviews mention size issues", "weight": 0.42},
                {"type": EvidenceType.SIMILAR_CASES.value, "description": "31 similar returns", "weight": 0.36}
            ]
        elif "compatible" in comment or "connect" in comment or "ios" in comment or "android" in comment:
            cause = RootCauseEnum.COMPATIBILITY_ISSUE.value
            evidence = [
                {"type": EvidenceType.HEURISTIC_RULE.value, "description": "Known firmware sync issues on current product model", "weight": 0.55},
                {"type": EvidenceType.METADATA_DISCREPANCY.value, "description": "Customer comments report bluetooth timeouts", "weight": 0.30}
            ]
        elif "transit" in comment or "damaged" in comment or "packaging" in comment or "crushed" in comment:
            cause = RootCauseEnum.PACKAGING_DAMAGE.value
            evidence = [
                {"type": EvidenceType.IMAGE_ANOMALY.value, "description": "Return image displays crushed shipping box", "weight": 0.70}
            ]
        else:
            cause = RootCauseEnum.EXPECTATION_MISMATCH.value
            evidence = [
                {"type": EvidenceType.REVIEW_PATTERN.value, "description": "Item color variance reports match reviews", "weight": 0.35}
            ]

        return {
            "rootCause": cause,
            "confidence": 0.93,
            "evidence": evidence
        }
