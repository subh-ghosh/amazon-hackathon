import requests
import time
import concurrent.futures
import numpy as np

BASE_URL = "http://localhost:8005"
results = []

def run_test(category, name, fn):
    try:
        res = fn()
        if res is True:
            results.append({"category": category, "name": name, "status": "PASS"})
        elif type(res) == tuple and res[0] is False:
            results.append({"category": category, "name": name, "status": "FAIL", "evidence": res[1]})
        else:
            results.append({"category": category, "name": name, "status": "FAIL", "evidence": f"Unexpected return: {res}"})
    except Exception as e:
        results.append({"category": category, "name": name, "status": "FAIL", "evidence": str(e)})

# 1. Infra
def t_infra_health(): return requests.get(f"{BASE_URL}/health").status_code == 200
def t_infra_docs(): return requests.get(f"{BASE_URL}/docs").status_code == 200
def t_infra_openapi(): return requests.get(f"{BASE_URL}/openapi.json").status_code == 200

run_test("Infra", "GET /health", t_infra_health)
run_test("Infra", "GET /docs", t_infra_docs)
run_test("Infra", "GET /openapi.json", t_infra_openapi)

base_payload = {
    "returnId": "RET-1",
    "productId": "PROD-1",
    "category": "Electronics",
    "conditionScore": 80,
    "utilityScore": 90,
    "fraudScore": 10,
    "estimatedValue": 100.0,
    "returnReason": "DEFECTIVE",
    "sellerTrustScore": 0.9
}

# 2. Validation
def t_val_missing():
    p = base_payload.copy()
    del p["returnId"]
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=p)
    return r.status_code == 422 or (False, f"Returned {r.status_code}")
def t_val_empty():
    p = base_payload.copy()
    p["returnId"] = ""
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=p)
    return r.status_code == 422 or (False, f"Returned {r.status_code}")
def t_val_whitespace():
    p = base_payload.copy()
    p["returnId"] = "   "
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=p)
    return r.status_code == 422 or (False, f"Returned {r.status_code}")
def t_val_extra():
    p = base_payload.copy()
    p["hackerField"] = "123"
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=p)
    return r.status_code == 422 or (False, f"Returned {r.status_code}")
def t_val_invalid_values():
    p = base_payload.copy()
    p["conditionScore"] = -1
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=p)
    return r.status_code == 422 or (False, f"Returned {r.status_code}")

run_test("Validation", "Missing fields", t_val_missing)
run_test("Validation", "Empty strings", t_val_empty)
run_test("Validation", "Whitespace", t_val_whitespace)
run_test("Validation", "Extra fields", t_val_extra)
run_test("Validation", "Invalid values", t_val_invalid_values)

# 3. Biz Logic
def t_biz_run():
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=base_payload)
    if r.status_code != 200: return (False, f"Returned {r.status_code}")
    data = r.json()
    if "simulations" not in data or len(data["simulations"]) == 0: return (False, "No simulations")
    return True

def t_biz_extreme():
    p = base_payload.copy()
    p["conditionScore"] = 0
    p["estimatedValue"] = 0.01
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=p)
    if r.status_code != 200: return (False, f"Returned {r.status_code}")
    return True

run_test("Business Logic", "Scenario generation", t_biz_run)
run_test("Business Logic", "Extreme-value scenarios", t_biz_extreme)

# 4. Security
def t_sec_sqli():
    p = base_payload.copy()
    p["returnId"] = "' OR 1=1 --"
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=p)
    return r.status_code in [200, 422] or (False, f"Returned {r.status_code}")
def t_sec_xss():
    p = base_payload.copy()
    p["returnId"] = "<script>alert(1)</script>"
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=p)
    return r.status_code in [200, 422] or (False, f"Returned {r.status_code}")
def t_sec_traversal():
    p = base_payload.copy()
    p["returnId"] = "../../etc/passwd"
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=p)
    return r.status_code in [200, 422] or (False, f"Returned {r.status_code}")
def t_sec_long():
    p = base_payload.copy()
    p["returnId"] = "A"*15000
    r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=p)
    return r.status_code in [422, 413] or (False, f"Returned {r.status_code}")

run_test("Security", "SQL Injection", t_sec_sqli)
run_test("Security", "XSS", t_sec_xss)
run_test("Security", "Path Traversal", t_sec_traversal)
run_test("Security", "Long Strings", t_sec_long)

# 5. Concurrency
def run_conc(reqs):
    errors = 0
    def fire():
        try:
            r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=base_payload)
            if r.status_code >= 500: return 500
            return 200
        except: return 500
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as e:
        futures = [e.submit(fire) for _ in range(reqs)]
        for f in concurrent.futures.as_completed(futures):
            if f.result() == 500: errors += 1
    return errors == 0 or (False, f"Errors: {errors}")

run_test("Concurrency", "100 requests", lambda: run_conc(100))
run_test("Concurrency", "250 requests", lambda: run_conc(250))
run_test("Concurrency", "500 requests", lambda: run_conc(500))

# 6. Performance
def t_perf():
    times = []
    for _ in range(20):
        s = time.time()
        r = requests.post(f"{BASE_URL}/api/v1/simulation/run", json=base_payload)
        if r.status_code >= 500: return (False, "500 Error")
        times.append(time.time() - s)
    avg = np.mean(times)
    p95 = np.percentile(times, 95)
    return (avg < 1.5 and p95 < 3.0) or (False, f"Avg: {avg:.2f}s, P95: {p95:.2f}s")

run_test("Performance", "Avg/P95 Targets", t_perf)

import json
print(json.dumps(results, indent=2))
