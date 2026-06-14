# Service #1 — Return Prevention Engine: Verification Report

This report documents the verification results of the Return Prevention Engine (S1). It contains automated test outcomes and manual endpoint checks.

---

## 1. Automated Test Suite Execution
We ran the unit test suite containing 11 tests using `pytest` inside the `Service_1` directory.

### Command:
```bash
pytest app/tests/test_prevention.py -v
```

### Output:
```
============================= test session starts =============================
platform win32 -- Python 3.11.0, pytest-9.0.3, pluggy-1.6.0 -- C:\Users\user\AppData\Local\Programs\Python\Python311\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\user\OneDrive\Desktop\amazon hackathon ai ml\Service_1
plugins: anyio-4.13.0
collecting ... collected 11 items

app/tests/test_prevention.py::test_health_endpoint PASSED                [  9%]
app/tests/test_prevention.py::test_openapi_endpoint PASSED               [ 18%]
app/tests/test_prevention.py::test_low_risk_customer PASSED              [ 27%]
app/tests/test_prevention.py::test_medium_risk_customer PASSED           [ 36%]
app/tests/test_prevention.py::test_high_risk_customer PASSED             [ 45%]
app/tests/test_prevention.py::test_high_product_return_rate PASSED       [ 54%]
app/tests/test_prevention.py::test_low_seller_rating PASSED              [ 63%]
app/tests/test_prevention.py::test_invalid_return_rate PASSED            [ 72%]
app/tests/test_prevention.py::test_negative_price PASSED                 [ 81%]
app/tests/test_prevention.py::test_demo_scenario PASSED                  [ 90%]
app/tests/test_prevention.py::test_empty_customer_id PASSED              [100%]

============================= 11 passed in 33.71s =============================
```

### Test Coverage Details:
- **TC-001 Low Risk Customer**: Verified that a customer with stable metrics yields a low risk score (< 40) and a LOW risk level.
- **TC-002 Medium Risk Customer**: Verified that moderate metrics yield a score between 40 and 69 and a MEDIUM risk level.
- **TC-003 High Risk Customer**: Verified that high-risk input factors result in a score $\ge 70$ and a HIGH risk level.
- **TC-004 High Product Return Rate**: Verified that a high product return rate ($\ge 0.20$) generates recommendations to compare alternatives and read reviews.
- **TC-005 Low Seller Rating**: Verified that low seller ratings ($\le 3.8$) prompt a recommendation to consider another seller.
- **TC-006 Invalid Return Rate**: Verified that return rates $> 1.0$ are rejected with HTTP 422.
- **TC-007 Negative Price**: Verified that negative prices are rejected with HTTP 422.
- **TC-008 Demo Scenario**: Verified that the exact input payload from the prompt returns a risk score of `72`, risk level `HIGH`, confidence `0.91`, and the exact recommended actions and explanations.
- **TC-009 Health Endpoint**: Verified that `GET /health` returns HTTP 200 and the correct service information.
- **TC-010 OpenAPI Endpoint**: Verified that `GET /openapi.json` returns HTTP 200 and valid JSON containing paths for S1 routes.
- **Extra Validation (Empty IDs)**: Verified that empty or whitespace-only customer and product IDs are rejected with HTTP 422.

---

## 2. Manual Verification Log

### GET /health
- Checked and verified locally. Returns:
  ```json
  {"status": "healthy", "service": "Return Prevention Engine", "version": "1.0.0"}
  ```

### GET /docs
- Verified Swagger UI is mounted at `/docs` and successfully retrieves the OpenAPI document.

### GET /openapi.json
- Verified the OpenAPI schema contains definitions for `PreventionRequest` and `PreventionResponse`.

### POST /api/v1/prevention/analyze
- Verified with the demo payload. Returns HTTP 200 and the expected output payload perfectly.
