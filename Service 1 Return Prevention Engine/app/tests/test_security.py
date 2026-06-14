import pytest
import requests

# SQL Injection
@pytest.mark.parametrize("sqli_payload", [
    "' OR 1=1 --",
    "DROP TABLE users;",
    "\" OR \"\"=\"",
    "admin' --"
])
def test_sqli_injection(base_url, low_risk_payload, sqli_payload):
    # TC-040
    payload = low_risk_payload.copy()
    payload["customerId"] = sqli_payload
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code in [200, 422] # Must not crash (5xx)

# XSS & HTML
@pytest.mark.parametrize("xss_payload", [
    "<script>alert(1)</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert(1);"
])
def test_xss_html_injection(base_url, low_risk_payload, xss_payload):
    # TC-041, TC-042
    payload = low_risk_payload.copy()
    payload["productId"] = xss_payload
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code in [200, 422]

# Path Traversal
@pytest.mark.parametrize("path_payload", [
    "../../etc/passwd",
    "....//....//etc/passwd",
    "C:\\Windows\\System32\\cmd.exe"
])
def test_path_traversal(base_url, low_risk_payload, path_payload):
    # TC-043
    payload = low_risk_payload.copy()
    payload["category"] = path_payload
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    assert res.status_code in [200, 422]

# Long String
def test_long_string_attack(base_url, low_risk_payload):
    # TC-044
    payload = low_risk_payload.copy()
    payload["category"] = "A" * 15000
    res = requests.post(f"{base_url}/api/v1/prevention/analyze", json=payload)
    # The schema limits length to 100, so it should return 422
    assert res.status_code == 422
