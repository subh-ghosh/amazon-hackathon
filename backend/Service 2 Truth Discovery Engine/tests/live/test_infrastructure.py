import requests

def test_health_endpoint(base_url):
    res = requests.get(f"{base_url}/health")
    assert res.status_code == 200
    assert "status" in res.json()

def test_docs_endpoint(base_url):
    res = requests.get(f"{base_url}/docs")
    assert res.status_code == 200

def test_openapi_schema(base_url):
    res = requests.get(f"{base_url}/openapi.json")
    assert res.status_code == 200
    data = res.json()
    assert "openapi" in data
    assert "paths" in data
    assert "/api/v1/truth/analyze" in data["paths"]
