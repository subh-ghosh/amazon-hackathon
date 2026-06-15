import requests
import concurrent.futures

def test_100_concurrent_requests(base_url, defective_payload):
    concurrency = 100
    errors = 0
    
    def fire_req():
        try:
            r = requests.post(f"{base_url}/api/v1/truth/analyze", json=defective_payload, timeout=10)
            return r.status_code
        except Exception:
            return 500
            
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(fire_req) for _ in range(concurrency)]
        for f in concurrent.futures.as_completed(futures):
            if f.result() != 200:
                errors += 1
                
    assert errors == 0, f"Expected 0 errors, got {errors}"

def test_250_concurrent_requests(base_url, size_mismatch_payload):
    concurrency = 250
    errors = 0
    
    def fire_req():
        try:
            r = requests.post(f"{base_url}/api/v1/truth/analyze", json=size_mismatch_payload, timeout=10)
            return r.status_code
        except Exception:
            return 500
            
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(fire_req) for _ in range(concurrency)]
        for f in concurrent.futures.as_completed(futures):
            if f.result() != 200:
                errors += 1
                
    assert errors == 0, f"Expected 0 errors, got {errors}"

def test_500_concurrent_requests(base_url, counterfeit_payload):
    concurrency = 500
    errors = 0
    
    def fire_req():
        try:
            r = requests.post(f"{base_url}/api/v1/truth/analyze", json=counterfeit_payload, timeout=15)
            return r.status_code
        except Exception:
            return 500
            
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(fire_req) for _ in range(concurrency)]
        for f in concurrent.futures.as_completed(futures):
            if f.result() != 200:
                errors += 1
                
    assert errors == 0, f"Expected 0 errors, got {errors}"
