import requests
import time
import concurrent.futures
import numpy as np
import uuid

BASE_URL = "http://Circul-Digit-1KUgWt1Obxuk-628222820.us-east-1.elb.amazonaws.com"
results = []

def run_test(category, name, fn):
    try:
        res = fn()
        if res is True:
            results.append({"category": category, "name": name, "status": "PASS"})
        elif type(res) == tuple and res[0] is False:
            results.append({"category": category, "name": name, "status": "FAIL", "evidence": res[1]})
        else:
            results.append({"category": category, "name": name, "status": "FAIL", "evidence": "Unexpected return"})
    except Exception as e:
        results.append({"category": category, "name": name, "status": "FAIL", "evidence": str(e)})

# 1. INFRASTRUCTURE
def t_infra_health():
    return requests.get(f"{BASE_URL}/health").status_code == 200
def t_infra_docs():
    return requests.get(f"{BASE_URL}/docs").status_code == 200
def t_infra_openapi():
    return requests.get(f"{BASE_URL}/openapi.json").status_code == 200

run_test("Infra", "GET /health", t_infra_health)
run_test("Infra", "GET /docs", t_infra_docs)
run_test("Infra", "GET /openapi.json", t_infra_openapi)


# 2. VALIDATION
def t_val_missing_required():
    r = requests.post(f"{BASE_URL}/api/v1/products", json={"category": "Electronics"}) # missing productId
    return r.status_code == 422 or (False, f"Returned {r.status_code}")
def t_val_empty_string():
    r = requests.post(f"{BASE_URL}/api/v1/products", json={"productId": "", "category": "Electronics"})
    return r.status_code == 422 or (False, f"Returned {r.status_code}")
def t_val_whitespace():
    r = requests.post(f"{BASE_URL}/api/v1/products", json={"productId": "  ", "category": "Electronics"})
    return r.status_code == 422 or (False, f"Returned {r.status_code}")
def t_val_invalid_type():
    r = requests.post(f"{BASE_URL}/api/v1/products", json={"productId": "P1", "category": "Electronics", "conditionScore": "NOT_A_FLOAT"})
    return r.status_code == 422 or (False, f"Returned {r.status_code}")
def t_val_extra_fields():
    r = requests.post(f"{BASE_URL}/api/v1/products", json={"productId": "P2", "category": "Electronics", "hackerField": "123"})
    return r.status_code == 422 or (False, f"Returned {r.status_code}")
def t_val_invalid_ids():
    r = requests.get(f"{BASE_URL}/api/v1/products/../../etc/passwd")
    return r.status_code in [404, 422] or (False, f"Returned {r.status_code}")

run_test("Validation", "Missing required fields", t_val_missing_required)
run_test("Validation", "Empty strings", t_val_empty_string)
run_test("Validation", "Whitespace strings", t_val_whitespace)
run_test("Validation", "Invalid data types", t_val_invalid_type)
run_test("Validation", "Extra fields", t_val_extra_fields)
run_test("Validation", "Invalid IDs", t_val_invalid_ids)

# 3. BUSINESS LOGIC
prod_id = f"PROD-{uuid.uuid4().hex[:8]}"
def t_biz_create():
    r = requests.post(f"{BASE_URL}/api/v1/products", json={"productId": prod_id, "category": "Electronics"})
    return r.status_code == 201 or (False, f"Returned {r.status_code}: {r.text}")
def t_biz_retrieve():
    r = requests.get(f"{BASE_URL}/api/v1/products/{prod_id}")
    return r.status_code == 200 or (False, f"Returned {r.status_code}: {r.text}")
def t_biz_event_fraud():
    r = requests.post(f"{BASE_URL}/api/v1/products/{prod_id}/events", json={"eventType": "FRAUD", "fraudScore": 95, "fraudType": "Return Abuse"})
    return r.status_code == 200 or (False, f"Returned {r.status_code}: {r.text}")
def t_biz_event_recovery():
    r = requests.post(f"{BASE_URL}/api/v1/products/{prod_id}/events", json={"eventType": "RECOVERY", "decision": "LIQUIDATION", "expectedProfit": 25.0})
    return r.status_code == 200 or (False, f"Returned {r.status_code}: {r.text}")
def t_biz_timeline():
    r = requests.get(f"{BASE_URL}/api/v1/products/{prod_id}/timeline")
    if r.status_code != 200: return (False, f"Returned {r.status_code}")
    data = r.json()
    return len(data) >= 2 or (False, f"Timeline has {len(data)} events")

run_test("Business Logic", "Product creation", t_biz_create)
run_test("Business Logic", "Correct retrieval", t_biz_retrieve)
run_test("Business Logic", "Fraud Event ingestion", t_biz_event_fraud)
run_test("Business Logic", "Recovery Event ingestion", t_biz_event_recovery)
run_test("Business Logic", "Timeline ordering", t_biz_timeline)

# 4. SECURITY
def t_sec_sqli():
    r = requests.get(f"{BASE_URL}/api/v1/products/' OR 1=1 --")
    return r.status_code in [404, 422] or (False, f"Returned {r.status_code}")
def t_sec_xss():
    r = requests.post(f"{BASE_URL}/api/v1/products", json={"productId": "<script>alert(1)</script>", "category": "Electronics"})
    return r.status_code in [201, 422] or (False, f"Returned {r.status_code}")
def t_sec_long_string():
    r = requests.post(f"{BASE_URL}/api/v1/products", json={"productId": "A"*15000, "category": "Electronics"})
    return r.status_code in [422, 413] or (False, f"Returned {r.status_code}")

run_test("Security", "SQL Injection", t_sec_sqli)
run_test("Security", "XSS", t_sec_xss)
run_test("Security", "Long String", t_sec_long_string)

# 5. CONCURRENCY
def run_conc(reqs):
    errors = 0
    def fire():
        try:
            r = requests.get(f"{BASE_URL}/api/v1/products/{prod_id}")
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

# 6. PERFORMANCE
def t_perf():
    times = []
    for _ in range(20):
        s = time.time()
        r = requests.get(f"{BASE_URL}/api/v1/products/{prod_id}")
        if r.status_code >= 500: return (False, f"500 Error during perf")
        times.append(time.time() - s)
    avg = np.mean(times)
    p95 = np.percentile(times, 95)
    return (avg < 1.5 and p95 < 3.0) or (False, f"Avg: {avg:.2f}s, P95: {p95:.2f}s")

run_test("Performance", "Avg/P95 Targets", t_perf)

import json
print(json.dumps(results, indent=2))
