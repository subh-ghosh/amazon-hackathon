import requests

def test_health_endpoint(base_url):
    # TC-001
    res = requests.get(f"{base_url}/health")
    assert res.status_code == 200
    assert "status" in res.json()
