import requests

def test_swagger_ui(base_url):
    # TC-002
    res = requests.get(f"{base_url}/docs")
    assert res.status_code == 200

def test_openapi_schema(base_url):
    # TC-003, TC-056, TC-057, TC-058, TC-059
    res = requests.get(f"{base_url}/openapi.json")
    assert res.status_code == 200
    data = res.json()
    assert "openapi" in data
    assert "paths" in data
    assert "/api/v1/prevention/analyze" in data["paths"]
    
    # Request & Response schema presence
    components = data.get("components", {}).get("schemas", {})
    assert "PreventionRequest" in components
    assert "PreventionResponse" in components
