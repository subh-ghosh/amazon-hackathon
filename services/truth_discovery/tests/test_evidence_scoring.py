import os
import sys
import unittest
from pydantic import ValidationError

# Force sys.path resolution
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.schemas import TruthAnalyzeResponse, Evidence, EvidenceType, RootCauseEnum

class TestEvidenceScoring(unittest.TestCase):
    def test_valid_evidence_combination(self):
        """Verifies that structured evidence with sum of weights <= 1.0 validates successfully."""
        evidence_list = [
            Evidence(type=EvidenceType.REVIEW_PATTERN, description="27 reviews mention size issues", weight=0.42),
            Evidence(type=EvidenceType.SIMILAR_CASES, description="31 similar returns", weight=0.36)
        ]
        
        # Instantiate response model and check validation succeeds
        response = TruthAnalyzeResponse(
            returnId="RET123",
            actualRootCause=RootCauseEnum.SIZE_MISMATCH,
            confidence=0.93,
            requiresManualReview=False,
            evidence=evidence_list
        )
        
        self.assertEqual(len(response.evidence), 2)
        self.assertAlmostEqual(sum(item.weight for item in response.evidence), 0.78)

    def test_invalid_weight_limits_exceeded(self):
        """Verifies that sum of weights > 1.0 triggers Pydantic validation error."""
        evidence_list = [
            Evidence(type=EvidenceType.REVIEW_PATTERN, description="High rate of sizing issues", weight=0.60),
            Evidence(type=EvidenceType.SIMILAR_CASES, description="Too many matching returns", weight=0.50) # Total = 1.10
        ]
        
        with self.assertRaises(ValidationError) as context:
            TruthAnalyzeResponse(
                returnId="RET123",
                actualRootCause=RootCauseEnum.SIZE_MISMATCH,
                confidence=0.93,
                requiresManualReview=False,
                evidence=evidence_list
            )
            
        self.assertIn("Total evidence weights cannot exceed 1.0", str(context.exception))

    def test_invalid_evidence_type(self):
        """Verifies that invalid evidence types raise Pydantic validation errors."""
        with self.assertRaises(ValidationError):
            Evidence(
                type="SOME_INVALID_TYPE",
                description="Wrong type testing",
                weight=0.50
            )

if __name__ == "__main__":
    unittest.main()
