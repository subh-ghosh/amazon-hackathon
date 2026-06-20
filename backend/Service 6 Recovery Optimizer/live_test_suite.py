import requests
import json

BASE_URL = "http://Circul-Optim-VznHSwftfNgj-1405514615.us-east-1.elb.amazonaws.com"
OPTIMIZE_URL = f"{BASE_URL}/api/v1/recovery/optimize"

def print_result(tc_name, expected, res):
    print(f"\n--- {tc_name} ---")
    print(f"HTTP: {res.status_code}")
    try:
        print(f"Response: {json.dumps(res.json(), indent=2)}")
    except:
        print(f"Response: {res.text}")
    print(f"Expected: {expected}")
    print("----------------------------------------")

# Deployment Verification
print("\n=== DEPLOYMENT VERIFICATION ===")
res_health = requests.get(f"{BASE_URL}/health")
print_result("Health Check", "200 OK", res_health)

res_docs = requests.get(f"{BASE_URL}/docs")
print(f"GET /docs HTTP: {res_docs.status_code}")

res_openapi = requests.get(f"{BASE_URL}/openapi.json")
print(f"GET /openapi.json HTTP: {res_openapi.status_code}")


# TC-001
payload_001 = {
  "returnId": "RET001", "productId": "P001", "fraudScore": 10, "sellerTrustScore": 0.95,
  "simulations": [
    {"scenario": "Refurbish", "recoveryValue": 12000, "carbonImpact": 10, "processingTimeDays": 4, "confidence": 0.95},
    {"scenario": "Outlet Sale", "recoveryValue": 7000, "carbonImpact": 5, "processingTimeDays": 2, "confidence": 0.90}
  ]
}
res_001 = requests.post(OPTIMIZE_URL, json=payload_001)
print_result("TC-001 Highest Profit Wins", "REFURBISH", res_001)

# TC-002
payload_002 = {
  "returnId": "RET002", "productId": "P002", "fraudScore": 5, "sellerTrustScore": 0.95,
  "simulations": [
    {"scenario": "Recycle", "recoveryValue": 2000, "carbonImpact": -5, "processingTimeDays": 1, "confidence": 0.95},
    {"scenario": "Return To Vendor", "recoveryValue": 2500, "carbonImpact": 30, "processingTimeDays": 10, "confidence": 0.80}
  ]
}
res_002 = requests.post(OPTIMIZE_URL, json=payload_002)
print_result("TC-002 Carbon Friendly Scenario Wins", "Recycle receives sustainability bonus", res_002)

# TC-003
payload_003 = {
  "returnId": "RET003", "productId": "P003", "fraudScore": 90, "sellerTrustScore": 0.90,
  "simulations": [
    {"scenario": "Refurbish", "recoveryValue": 15000, "carbonImpact": 12, "processingTimeDays": 4, "confidence": 0.90}
  ]
}
res_003 = requests.post(OPTIMIZE_URL, json=payload_003)
print_result("TC-003 High Fraud Penalty", "Fraud penalty applied", res_003)

# TC-004
payload_004 = {
  "returnId": "RET004", "productId": "P004", "fraudScore": 20, "sellerTrustScore": 0.30,
  "simulations": [
    {"scenario": "Outlet Sale", "recoveryValue": 6000, "carbonImpact": 5, "processingTimeDays": 2, "confidence": 0.90}
  ]
}
res_004 = requests.post(OPTIMIZE_URL, json=payload_004)
print_result("TC-004 Low Seller Trust", "Confidence adjusted downward", res_004)

# TC-005
payload_005 = {
  "returnId": "RET-DEMO-001", "productId": "MACBOOK-001", "fraudScore": 12, "sellerTrustScore": 0.92,
  "simulations": [
    {"scenario": "Refurbish", "recoveryValue": 56000, "carbonImpact": 12, "processingTimeDays": 4, "confidence": 0.91},
    {"scenario": "Outlet Sale", "recoveryValue": 42000, "carbonImpact": 5, "processingTimeDays": 2, "confidence": 0.88}
  ]
}
res_005 = requests.post(OPTIMIZE_URL, json=payload_005)
print_result("TC-005 Demo Scenario", "REFURBISH", res_005)

# TC-006
payload_006 = {
  "returnId": "RET006", "productId": "P006", "fraudScore": 10, "sellerTrustScore": 0.90,
  "simulations": []
}
res_006 = requests.post(OPTIMIZE_URL, json=payload_006)
print_result("TC-006 Empty Simulations", "422 Unprocessable Entity", res_006)

# TC-007
payload_007 = {
  "returnId": "RET007", "productId": "P007", "fraudScore": 10, "sellerTrustScore": 0.90,
  "simulations": [
    {"scenario": "Refurbish", "recoveryValue": -1000, "carbonImpact": 10, "processingTimeDays": 4, "confidence": 0.90}
  ]
}
res_007 = requests.post(OPTIMIZE_URL, json=payload_007)
print_result("TC-007 Negative Recovery Value", "422 Unprocessable Entity", res_007)

# TC-008
payload_008 = {
  "returnId": "RET008", "productId": "P008", "fraudScore": 10, "sellerTrustScore": 0.90,
  "simulations": [
    {"scenario": "Refurbish", "recoveryValue": 1000, "carbonImpact": 10, "processingTimeDays": 4, "confidence": 1.5}
  ]
}
res_008 = requests.post(OPTIMIZE_URL, json=payload_008)
print_result("TC-008 Invalid Confidence", "422 Unprocessable Entity", res_008)
