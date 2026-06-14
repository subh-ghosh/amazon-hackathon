import json
from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)

# --- Base Payload Helper ---
def get_base_payload():
    return {
        "requestId": "RR_VAL_123",
        "customerId": "CUST001",
        "productId": "PROD001",
        "orderValue": 25.0,
        "returnShippingCost": 12.0,
        "fraudRiskScore": 8,
        "returnRiskScore": 15,
        "condition": "OPEN_BOX",
        "sellerPolicy": "STANDARD",
        "customerTrustScore": 92,
        "category": "Apparel",
        "weightKg": 1.2
    }

# --- Missing Required Fields (TC-001 to TC-011) ---

@pytest.mark.parametrize("missing_field, tc_id", [
    ("requestId", "TC-001"),
    ("customerId", "TC-002"),
    ("productId", "TC-003"),
    ("orderValue", "TC-004"),
    ("returnShippingCost", "TC-005"),
    ("fraudRiskScore", "TC-006"),
    ("returnRiskScore", "TC-007"),
    ("condition", "TC-008"),
    ("sellerPolicy", "TC-009"),
    ("customerTrustScore", "TC-010"),
    ("category", "TC-011")
])
def test_missing_required_fields(missing_field, tc_id):
    payload = get_base_payload()
    del payload[missing_field]
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422, f"Failed {tc_id} for field {missing_field}"
    # Verify response structure for 422
    data = response.json()
    assert "detail" in data
    # Verify no stack traces are exposed
    assert "traceback" not in response.text.lower()
    assert "stack" not in response.text.lower()
    # Check field name and path are in the validation detail
    assert any(missing_field in str(err["loc"]) for err in data["detail"])


# --- Empty String Validation (TC-012 to TC-017) ---

@pytest.mark.parametrize("empty_field, tc_id", [
    ("requestId", "TC-012"),
    ("customerId", "TC-013"),
    ("productId", "TC-014"),
    ("condition", "TC-015"),
    ("sellerPolicy", "TC-016"),
    ("category", "TC-017")
])
def test_empty_string_fields(empty_field, tc_id):
    payload = get_base_payload()
    payload[empty_field] = ""
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422, f"Failed {tc_id}"
    data = response.json()
    assert "detail" in data
    assert any(empty_field in str(err["loc"]) for err in data["detail"])


# --- Whitespace Validation (TC-018 to TC-023) ---

@pytest.mark.parametrize("whitespace_field, tc_id", [
    ("requestId", "TC-018"),
    ("customerId", "TC-019"),
    ("productId", "TC-020"),
    ("condition", "TC-021"),
    ("sellerPolicy", "TC-022"),
    ("category", "TC-023")
])
def test_whitespace_string_fields(whitespace_field, tc_id):
    payload = get_base_payload()
    payload[whitespace_field] = "   "
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422, f"Failed {tc_id}"
    data = response.json()
    assert "detail" in data
    assert any(whitespace_field in str(err["loc"]) for err in data["detail"])


# --- Numeric Validation (TC-024 to TC-026) ---

@pytest.mark.parametrize("negative_field, tc_id", [
    ("orderValue", "TC-024"),
    ("returnShippingCost", "TC-025"),
    ("weightKg", "TC-026")
])
def test_negative_numeric_fields(negative_field, tc_id):
    payload = get_base_payload()
    payload[negative_field] = -1.0
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422, f"Failed {tc_id}"
    data = response.json()
    assert "detail" in data
    assert any(negative_field in str(err["loc"]) for err in data["detail"])


# --- NaN Rejection (TC-027 to TC-029) ---

@pytest.mark.parametrize("nan_field, tc_id", [
    ("orderValue", "TC-027"),
    ("returnShippingCost", "TC-028"),
    ("weightKg", "TC-029")
])
def test_nan_rejection(nan_field, tc_id):
    payload = get_base_payload()
    # Construct raw json with NaN
    payload[nan_field] = 999.9  # placeholder
    raw_json = json.dumps(payload).replace("999.9", "NaN")
    response = client.post("/api/v1/returnless/evaluate", data=raw_json, headers={"Content-Type": "application/json"})
    assert response.status_code == 422, f"Failed {tc_id}"
    data = response.json()
    assert "detail" in data


# --- Infinity Rejection (TC-030 to TC-032) ---

@pytest.mark.parametrize("inf_field, tc_id", [
    ("orderValue", "TC-030"),
    ("returnShippingCost", "TC-031"),
    ("weightKg", "TC-032")
])
def test_infinity_rejection(inf_field, tc_id):
    payload = get_base_payload()
    payload[inf_field] = 999.9  # placeholder
    
    # Positive Infinity
    raw_json_pos = json.dumps(payload).replace("999.9", "Infinity")
    response_pos = client.post("/api/v1/returnless/evaluate", data=raw_json_pos, headers={"Content-Type": "application/json"})
    assert response_pos.status_code == 422, f"Failed positive infinity {tc_id}"
    
    # Negative Infinity
    raw_json_neg = json.dumps(payload).replace("999.9", "-Infinity")
    response_neg = client.post("/api/v1/returnless/evaluate", data=raw_json_neg, headers={"Content-Type": "application/json"})
    assert response_neg.status_code == 422, f"Failed negative infinity {tc_id}"


# --- Score Boundary Validation (TC-033 to TC-038) ---

@pytest.mark.parametrize("score_field, invalid_val, tc_id", [
    ("fraudRiskScore", -1, "TC-033"),
    ("fraudRiskScore", 101, "TC-034"),
    ("returnRiskScore", -1, "TC-035"),
    ("returnRiskScore", 101, "TC-036"),
    ("customerTrustScore", -1, "TC-037"),
    ("customerTrustScore", 101, "TC-038")
])
def test_score_boundary_rejection(score_field, invalid_val, tc_id):
    payload = get_base_payload()
    payload[score_field] = invalid_val
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422, f"Failed {tc_id}"
    data = response.json()
    assert "detail" in data
    assert any(score_field in str(err["loc"]) for err in data["detail"])


# --- Enum Validation (TC-039 to TC-040) ---

def test_condition_enum_validation_tc039():
    payload = get_base_payload()
    payload["condition"] = "INVALID"
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert any("condition" in str(err["loc"]) for err in data["detail"])

def test_severity_enum_validation_tc040():
    payload = get_base_payload()
    payload["rootCauseInsights"] = [
        {"insight": "Item is defective", "severity": "INVALID"}
    ]
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data


# --- Extra Field Rejections (TC-041 to TC-043) ---

def test_root_level_extra_field_tc041():
    payload = get_base_payload()
    payload["extraField"] = "should_fail"
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422

def test_seller_policy_overrides_extra_field_tc042():
    payload = get_base_payload()
    payload["sellerPolicyOverrides"] = {
        "maxReturnlessValue": 50.0,
        "extraOverride": "should_fail"
    }
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422

def test_insight_input_extra_field_tc043():
    payload = get_base_payload()
    payload["rootCauseInsights"] = [
        {"insight": "Defective item", "severity": "LOW", "extraInsightField": "should_fail"}
    ]
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422


# --- Seller Policy Validation (TC-044 to TC-046) ---

def test_max_returnless_value_nan_tc044():
    payload = get_base_payload()
    payload["sellerPolicyOverrides"] = {
        "maxReturnlessValue": 999.9
    }
    raw_json = json.dumps(payload).replace("999.9", "NaN")
    response = client.post("/api/v1/returnless/evaluate", data=raw_json, headers={"Content-Type": "application/json"})
    assert response.status_code == 422

def test_max_returnless_value_infinity_tc045():
    payload = get_base_payload()
    payload["sellerPolicyOverrides"] = {
        "maxReturnlessValue": 999.9
    }
    raw_json = json.dumps(payload).replace("999.9", "Infinity")
    response = client.post("/api/v1/returnless/evaluate", data=raw_json, headers={"Content-Type": "application/json"})
    assert response.status_code == 422

def test_force_manual_review_categories_invalid_type_tc046():
    payload = get_base_payload()
    payload["sellerPolicyOverrides"] = {
        "forceManualReviewCategories": "not_a_list_type"  # should be list of strings
    }
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422


# --- Insight Validation (TC-047 to TC-050) ---

@pytest.mark.parametrize("insight_val, severity_val, tc_id", [
    ("", "LOW", "TC-047"),
    (" ", "LOW", "TC-048"),
    ("Good insight", "", "TC-049"),
    ("Good insight", "INVALID", "TC-050")
])
def test_insight_validation(insight_val, severity_val, tc_id):
    payload = get_base_payload()
    payload["rootCauseInsights"] = [
        {"insight": insight_val, "severity": severity_val}
    ]
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    assert response.status_code == 422


# --- Batch Validation (TC-051 to TC-053) ---

def test_empty_batch_payload_tc051():
    payload = {
        "requests": []  # Empty array
    }
    # While Pydantic parses lists, an empty requests list should be handled or validated
    # Let's make sure it doesn't crash the server. If it returns 200 with empty responses, it's safe.
    # To enforce HTTP 422 for empty batch payload, let's verify.
    response = client.post("/api/v1/returnless/batch-evaluate", json=payload)
    # If the endpoint accepts empty and returns completed with empty responses, it's 200.
    # Let's see if we should enforce 422 on empty requests list. Yes, we should!
    # Wait, does schemas.py require a min_items=1 on requests? It does not currently.
    # If we want TC-051 to return 422, we should add a validator or use Field(..., min_length=1) on requests!
    # Let's modify schemas.py later to add min_length=1 on BatchEvaluateRequest requests.
    assert response.status_code == 422

def test_mixed_valid_invalid_records_tc052():
    payload = {
        "requests": [
            get_base_payload(),
            {
                **get_base_payload(),
                "requestId": ""  # Invalid
            }
        ]
    }
    response = client.post("/api/v1/returnless/batch-evaluate", json=payload)
    assert response.status_code == 422

def test_null_item_in_array_tc053():
    payload = {
        "requests": [
            get_base_payload(),
            None  # Null item
        ]
    }
    response = client.post("/api/v1/returnless/batch-evaluate", json=payload)
    assert response.status_code == 422


# --- Security Validation (TC-054 to TC-056) ---

@pytest.mark.parametrize("security_payload, tc_id", [
    ("' OR 1=1 --", "TC-054"),
    ("<script>alert(1)</script>", "TC-055"),
    ("../../etc/passwd", "TC-056")
])
def test_security_payload_handling(security_payload, tc_id):
    payload = get_base_payload()
    payload["requestId"] = security_payload  # Inject in requestId
    response = client.post("/api/v1/returnless/evaluate", json=payload)
    # The server should handle this safely (either return 200 OK since strings are sanitized and not executed,
    # or return 422 if string validation triggers, but NOT crash with 500)
    assert response.status_code in (200, 422)
    assert "traceback" not in response.text.lower()
