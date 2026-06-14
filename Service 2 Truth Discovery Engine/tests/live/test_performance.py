import requests
import time
import numpy as np

def test_latency_metrics(base_url, defective_payload):
    times = []
    for _ in range(20):
        start = time.time()
        res = requests.post(f"{base_url}/api/v1/truth/analyze", json=defective_payload)
        end = time.time()
        assert res.status_code == 200
        times.append(end - start)
        
    avg_latency = np.mean(times)
    p95_latency = np.percentile(times, 95)
    
    # We expect an average under 1.5 seconds and P95 under 3.0 seconds
    assert avg_latency < 1.5, f"Average latency too high: {avg_latency}s"
    assert p95_latency < 3.0, f"P95 latency too high: {p95_latency}s"
