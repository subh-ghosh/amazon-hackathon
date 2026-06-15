import pytest
import requests

# SQL Injection
@pytest.mark.parametrize("sqli_payload", [
    "' OR 1=1 --",
    "DROP TABLE users;",
    "\" OR \"\"=\"",
    "admin' --"
])
def test_sqli_injection(base_url, defective_payload, sqli_payload):
    payload = defective_payload.copy()
    payload["customerId"] = sqli_payload
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code in [200, 422] # Must not crash (5xx)

# XSS & HTML
@pytest.mark.parametrize("xss_payload", [
    "<script>alert(1)</script>",
    "<img src=x onerror=alert('XSS')>",
    "javascript:alert(1);"
])
def test_xss_html_injection(base_url, defective_payload, xss_payload):
    payload = defective_payload.copy()
    payload["productId"] = xss_payload
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code in [200, 422]

# Path Traversal
@pytest.mark.parametrize("path_payload", [
    "../../etc/passwd",
    "....//....//etc/passwd",
    "C:\\Windows\\System32\\cmd.exe"
])
def test_path_traversal(base_url, defective_payload, path_payload):
    payload = defective_payload.copy()
    payload["statedReason"] = path_payload
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code in [200, 422]

# Long String
def test_long_string_attack(base_url, defective_payload):
    payload = defective_payload.copy()
    payload["customerComment"] = "A" * 15000
    res = requests.post(f"{base_url}/api/v1/truth/analyze", json=payload)
    assert res.status_code == 422
