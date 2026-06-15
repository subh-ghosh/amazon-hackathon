# FRONTEND RUNTIME AUDIT

**Date:** June 15, 2026  
**Scope:** Full product-flow validation against live AWS APIs  
**Method:** Direct curl testing of all service endpoints used by the frontend

---

## EXECUTIVE SUMMARY

The frontend has **critical contract mismatches** with 5 out of 6 services it calls. Every API call currently made by the frontend will **return HTTP 422** during a live demo. The root cause: frontend uses snake_case field names while backends use camelCase, and several required fields are missing from the frontend payloads.

**Demo Risk: CRITICAL — Every AI-powered feature will silently fail and show fallback data.**

---

## PHASE 1 — PRODUCT CATALOG VALIDATION

### Product Data Assessment

| Field | Status | Issue |
|-------|--------|-------|
| product_id | ✅ Valid | Consistent format |
| seller_id | ✅ Valid | Usable by S11 |
| category | ✅ Valid | Matches S1/S10 expectations |
| brand | ✅ Valid | Used as seller_name |
| price | ✅ Valid | Numeric, non-negative |
| rating | ⚠️ Missing from API payload | S1 requires `productRating` |
| product_weight_kg | ❌ Missing | S10 requires `productWeight` |
| packaging_weight | ❌ Missing | S10 requires `packagingWeight` |
| packaging_material | ❌ Missing | S10 requires `packagingMaterial` |
| dimensions | ❌ Missing | S10 requires `length`, `width`, `height` |

### Missing Fields for API Calls

The following product metadata must be added to `src/data/products.ts`:
- `weight_kg` — needed by S10, S7, S9
- `packaging_weight` — needed by S10
- `packaging_material` — needed by S10
- `dimensions` (length, width, height) — needed by S10

### Hardcoded Assumptions
- Customer return rate hardcoded (should vary per demo scenario)
- Customer purchase count hardcoded
- Product return rate not stored per product
- Seller rating not stored per seller

---

## PHASE 2 — PRODUCT DETAILS PAGE VALIDATION

### S1 Return Prevention Engine

**Status: ❌ FAIL — Contract Mismatch**

Frontend sends:
```json
{
  "customer_id": "CUST-DEMO-001",
  "product_id": "PROD-001",
  "product_category": "Electronics",
  "product_price": 348.00
}
```

Backend requires (camelCase, more fields):
```json
{
  "customerId": "CUST-DEMO-001",
  "productId": "PROD-001",
  "category": "Electronics",
  "productRating": 4.6,
  "customerReturnRate": 0.05,
  "customerPurchaseCount": 25,
  "productReturnRate": 0.08,
  "sellerRating": 4.5,
  "price": 348.00
}
```

**Missing Required Fields:**
- `productRating` (REQUIRED)
- `customerReturnRate` (REQUIRED)
- `customerPurchaseCount` (REQUIRED)
- `productReturnRate` (REQUIRED)
- `sellerRating` (REQUIRED)

**Wrong Field Names:**
- `customer_id` → `customerId`
- `product_id` → `productId`
- `product_category` → `category`
- `product_price` → `price`

**Live Response (correct payload):**
```json
{
  "returnRiskScore": 24,
  "riskLevel": "LOW",
  "recommendedActions": ["Check seller recommendations"],
  "confidence": 0.91,
  "explanation": ["Product category has above-average returns"]
}
```

**Frontend Response Parsing Issues:**
- Frontend expects `risk_score` → Backend returns `returnRiskScore`
- Frontend expects `risk_level` → Backend returns `riskLevel` (uppercase: "LOW"/"MEDIUM"/"HIGH")
- Frontend expects `recommendations` → Backend returns `recommendedActions`
- Frontend expects `root_causes` → Backend returns `explanation`

---

### S10 Packaging Intelligence

**Status: ❌ FAIL — Contract Mismatch**

Frontend sends:
```json
{
  "product_id": "PROD-001",
  "product_category": "Electronics",
  "product_weight_kg": 1.5
}
```

Backend requires:
```json
{
  "productId": "PROD-001",
  "category": "Electronics",
  "productWeight": 0.5,
  "packagingWeight": 0.3,
  "packagingMaterial": "cardboard",
  "length": 25,
  "width": 20,
  "height": 10
}
```

**Missing Required Fields:**
- `packagingWeight` (REQUIRED)
- `packagingMaterial` (REQUIRED)
- `length` (REQUIRED)
- `width` (REQUIRED)
- `height` (REQUIRED)

**Wrong Field Names:**
- `product_id` → `productId`
- `product_category` → `category`
- `product_weight_kg` → `productWeight`

**Live Response (correct payload):**
```json
{
  "productId": "PROD-001",
  "sustainabilityScore": 78,
  "packagingEfficiencyScore": 35,
  "carbonImpactScore": 95,
  "recyclabilityScore": 100,
  "confidence": 1.0,
  "recommendations": [...],
  "explanations": [...],
  "packagingInsights": [...]
}
```

**Frontend Response Parsing Issues:**
- Frontend expects `sustainability_score` → Backend returns `sustainabilityScore`
- Frontend expects `recyclability_score` → Backend returns `recyclabilityScore`
- Frontend expects `carbon_footprint_kg` → Backend returns `carbonImpactScore` (different semantics)
- Frontend expects `efficiency_score` → Backend returns `packagingEfficiencyScore`

---

### S11 Seller Intelligence

**Status: ❌ FAIL — Contract Mismatch**

Frontend sends:
```json
{
  "seller_id": "SELLER-001",
  "seller_name": "Sony",
  "total_orders": 5000,
  "total_returns": 250,
  "product_categories": ["Electronics"]
}
```

Backend requires:
```json
{
  "sellerId": "SELLER-001",
  "sellerName": "Sony Official",
  "totalOrders": 5000,
  "totalReturns": 250,
  "fraudCases": 5,
  "averageRating": 4.5,
  "packagingScore": 85.0
}
```

**Missing Required Fields:**
- `fraudCases` (REQUIRED)
- `averageRating` (REQUIRED)
- `packagingScore` (REQUIRED)

**Wrong Field Names:**
- `seller_id` → `sellerId`
- `seller_name` → `sellerName`
- `total_orders` → `totalOrders`
- `total_returns` → `totalReturns`

**Frontend Response Parsing Issues:**
- Frontend expects `health_score` → Backend returns `sellerHealthScore`
- Frontend expects `fraud_risk` → Backend returns `fraudRiskScore`
- Frontend expects `return_rate` → Backend returns `returnsPer100Orders`
- Frontend expects `sustainability_score` → Backend returns `sustainabilityScore`
- Frontend expects `quality_rating` → Not returned (use `sellerTier` instead)

---

## PHASE 3 — COMPLETE CUSTOMER FLOWS

### FLOW A: Low Risk Purchase (Electronics)

| Step | Status | Details |
|------|--------|---------|
| Home → Product Listing | ✅ PASS | Static data, no API calls |
| Product Details (display) | ✅ PASS | Static data renders |
| AI Purchase Assistant | ❌ FAIL | S1, S10, S11 all return 422 |
| Add To Cart | ✅ PASS | Client-side state |
| Checkout | ✅ PASS | Static form |
| Order Success | ✅ PASS | Static display |

**Impact:** The hero feature (AI Purchase Assistant) silently fails. User sees skeleton loader briefly then fallback/null values.

---

### FLOW B: High Risk Product (Footwear/Clothing)

| Step | Status | Details |
|------|--------|---------|
| Product Details | ✅ PASS | Static display |
| AI Risk Warning | ❌ FAIL | S1 returns 422, no risk data |
| Prevention Messaging | ⚠️ PARTIAL | Hardcoded category check shows warning, but no live data |
| Alternative Recommendations | ❌ FAIL | No API provides alternatives |

**Impact:** Risk badges on Product Listing use hardcoded category logic (works), but PDP AI panel fails silently.

---

### FLOW C: Standard Return

| Step | Status | Details |
|------|--------|---------|
| Return Request Form | ✅ PASS | Static form |
| S2 Truth Discovery | ❌ FAIL | Contract mismatch |
| S3 Fraud Score | ❌ FAIL | Contract mismatch |
| S8 Returnless Evaluate | ❌ FAIL | Contract mismatch |
| AI Resolution Display | ❌ FAIL | No real data to render |

**S2 Truth Discovery — Contract Mismatch:**
Frontend sends: `return_id`, `order_id`, `customer_id`, `product_id`, `reason`, `customer_comment`  
Backend requires: `returnId`, `customerId`, `productId`, `sellerId` (REQUIRED!), `statedReason`, `customerComment`

**S3 Fraud — Contract Mismatch:**
Frontend sends: `case_id`, `entity_id`, `entity_type`, `severity`, `risk_score`, `related_return_ids`  
Backend requires: `customer_id`, `product_id`, `return_id`, `device_id` (REQUIRED!), `payment_method_hash` (REQUIRED!)

**S8 Returnless — Contract Mismatch:**
Frontend sends: `return_id`, `order_id`, `customer_id`, `product_id`, `product_price`, `return_reason`, `packaging_insights`, `seller_health_insights`  
Backend requires: `requestId`, `customerId`, `productId`, `orderValue`, `returnShippingCost` (REQUIRED!), `fraudRiskScore` (REQUIRED!), `returnRiskScore` (REQUIRED!), `condition` (REQUIRED!), `sellerPolicy` (REQUIRED!), `customerTrustScore` (REQUIRED!), `category` (REQUIRED!), `weightKg`

---

### FLOW D: Return Journey

| Step | Status | Details |
|------|--------|---------|
| S3 Fraud Analysis | ❌ FAIL | Wrong payload |
| S6 Recovery Optimizer | ❌ FAIL | Wrong payload structure (needs simulations array) |
| S7 Reverse Logistics | ❌ FAIL | Wrong payload (needs S6 output + warehouses array) |
| S9 Circular Routing | ❌ FAIL | Wrong payload (needs facilityOptions array with enums) |

**S6 Recovery Optimizer — Contract Mismatch:**
Frontend sends generic fields. Backend requires:
- `returnId`, `productId`, `fraudScore` (int 0-100), `sellerTrustScore` (float 0-1)
- `simulations[]` with: `scenario`, `recoveryValue`, `carbonImpact`, `processingTimeDays`, `confidence`

**S7 Reverse Logistics — Contract Mismatch:**
Frontend sends simple fields. Backend requires S6's full output + warehouses:
- `returnId`, `productId`, `recommendedDecision`, `customerLocation`, `expectedProfit`, `carbonSavings`, `processingDays`, `confidence`, `reasoning[]`
- `warehouses[]` with: `warehouseId`, `city`, `capacity` (0-100), `distanceKm`

**S9 Circular Routing — Contract Mismatch:**
Frontend sends simple fields. Backend requires:
- `requestId`, `returnId`, `productId`, `category`, `condition` (enum: NEW/OPEN_BOX/LIKE_NEW/USED/REFURBISHABLE/DAMAGED/BROKEN/LOW_VALUE/UNRECOVERABLE)
- `estimatedValue`, `weightKg`, `customerLatitude`, `customerLongitude`
- `facilityOptions[]` with: `facilityId`, `facilityType` (enum: REFURBISHMENT/DONATION/RECYCLING/LIQUIDATION/DISPOSAL), `distanceKm`, `capacityAvailable` (bool)
- Optional S7 passthrough: `recommendedWarehouse`, `recommendedRoute`, `estimatedCost`, `estimatedDays`, `carbonScore`, `reasoning[]`

---

## PHASE 4 — DYNAMIC DATA AUDIT

| Screen | Field | Current | Should Be | Recommendation |
|--------|-------|---------|-----------|----------------|
| Home | Products | Static | Static | OK for hackathon |
| Home | Categories | Static | Static | OK |
| Product Listing | AI badges (risk) | Static (category-based) | Dynamic (S1) | **Make dynamic** |
| Product Listing | Sustainability score | Static | Dynamic (S10) | **Make dynamic** |
| Product Details | Return Risk | Dynamic (S1) | Dynamic (S1) | Fix contract |
| Product Details | Seller Health | Dynamic (S11) | Dynamic (S11) | Fix contract |
| Product Details | Sustainability | Dynamic (S10) | Dynamic (S10) | Fix contract |
| Product Details | Purchase Confidence | Derived from S1 | Derived from S1 | Fix contract |
| Product Details | Root cause warnings | Dynamic (S1) | Dynamic (S1) | Fix contract |
| Cart | AI Purchase Review | Static | Could be dynamic | Low priority |
| Checkout | Environmental Impact | Static | Static | OK for hackathon |
| Order Success | Sustainability stats | Static | Static | OK for hackathon |
| My Orders | Order data | Client state + demo | Client state | OK |
| Return Prevention | Root cause (S2) | Dynamic | Dynamic | Fix contract |
| Return Prevention | Trust score (S3) | Dynamic | Dynamic | Fix contract |
| Return Prevention | Decision (S8) | Dynamic | Dynamic | Fix contract |
| Return Prevention | Resolution options | Semi-static | Should reflect S8 decision | **Improve** |
| Return Journey | All steps | Dynamic (S3/S6/S7/S9) | Dynamic | Fix contracts |
| Return Journey | Summary stats | Static | Dynamic from S9 response | **Make dynamic** |

---

## PHASE 5 — API CONTRACT AUDIT

### Summary of Contract Mismatches

| Service | Field Naming | Missing Fields | Response Parsing |
|---------|-------------|----------------|-----------------|
| **S1** | ❌ All wrong (snake→camel) | 5 required fields missing | ❌ All field names wrong |
| **S2** | ❌ All wrong | `sellerId` missing | ❌ Response structure different |
| **S3** | ❌ Completely different schema | `device_id`, `payment_method_hash` missing | ❌ Response fields different |
| **S6** | ❌ Wrong | Complex `simulations[]` structure needed | ❌ Response fields different |
| **S7** | ❌ Wrong | Needs S6 output passthrough + warehouses | ❌ Response fields different |
| **S8** | ❌ Wrong | 7+ required fields missing | ❌ Response structure completely different |
| **S9** | ❌ Wrong | Needs geo coords + facilityOptions enum | ❌ Response fields different |
| **S10** | ❌ Wrong | 5 packaging fields missing | ❌ Response fields different |
| **S11** | ❌ Wrong | 3 required fields missing | ❌ Response fields different |

### Correct Backend Contracts (Verified via Live Testing)

**S1 PreventionRequest:**
```
customerId, productId, category, productRating, customerReturnRate,
customerPurchaseCount, productReturnRate, sellerRating, price
```

**S2 TruthAnalyzeRequest:**
```
returnId, customerId, productId, sellerId, statedReason, customerComment
```

**S3 FraudScoreRequest:**
```
customer_id, product_id, return_id, device_id, payment_method_hash
```

**S5 SimulationRequest:**
```
returnId, productId, category, conditionScore, utilityScore,
fraudScore, estimatedValue, returnReason, sellerTrustScore
```

**S6 OptimizeRequest:**
```
returnId, productId, fraudScore (0-100), sellerTrustScore (0-1),
simulations[]: {scenario, recoveryValue, carbonImpact, processingTimeDays, confidence}
```

**S7 LogisticsRequest:**
```
returnId, productId, recommendedDecision, customerLocation,
expectedProfit, carbonSavings, processingDays, confidence, reasoning[],
warehouses[]: {warehouseId, city, capacity (0-100), distanceKm}
```

**S8 EvaluateRequest:**
```
requestId, customerId, productId, orderValue, returnShippingCost,
fraudRiskScore (0-100), returnRiskScore (0-100), condition (enum),
sellerPolicy, customerTrustScore (0-100), category, weightKg
```

**S9 OptimizationRequest:**
```
requestId, returnId, productId, category, condition (ConditionEnum),
estimatedValue, weightKg, customerLatitude, customerLongitude,
facilityOptions[]: {facilityId, facilityType (FacilityTypeEnum), distanceKm, capacityAvailable}
+ optional S7 passthrough fields
```

**S10 PackagingRequest:**
```
productId, category, productWeight, packagingWeight,
packagingMaterial, length, width, height
```

**S11 SellerAnalysisRequest:**
```
sellerId, sellerName, totalOrders, totalReturns,
fraudCases, averageRating, packagingScore
```

---

## RECOMMENDED FIXES (Ranked by Priority)

### 🔴 CRITICAL (Demo will fail without these)

1. **Fix S1 request/response contract** — Product Details AI Assistant is the hero feature
   - Update request payload to camelCase with all required fields
   - Update response parsing (returnRiskScore, riskLevel, recommendedActions, explanation)

2. **Fix S2 request contract** — Return Prevention won't show root cause
   - Switch to camelCase, add `sellerId`, rename `reason` → `statedReason`

3. **Fix S3 request contract** — Fraud analysis won't render
   - Completely different schema: needs `customer_id`, `product_id`, `return_id`, `device_id`, `payment_method_hash`

4. **Fix S8 request contract** — AI Resolution Center won't produce decision
   - Massive contract difference: needs `requestId`, `orderValue`, `returnShippingCost`, `fraudRiskScore`, `returnRiskScore`, `condition`, `sellerPolicy`, `customerTrustScore`, `category`

5. **Fix S10 request contract** — Sustainability info won't display
   - Add packaging metadata to products, use correct field names

6. **Fix S11 request contract** — Seller health won't display
   - Add `fraudCases`, `averageRating`, `packagingScore`

### 🟠 HIGH (Journey visualization broken)

7. **Fix S6 Recovery request** — Needs simulations array (can use S5 output)
8. **Fix S7 Logistics request** — Needs S6 output passthrough + warehouse data
9. **Fix S9 Circular request** — Needs geo coords + facility options with correct enums
10. **Implement proper service chaining** — S5 → S6 → S7 → S9 pipeline in Return Journey

### 🟡 MEDIUM (Polish issues)

11. **Add product metadata** — weight, packaging dimensions for S10 calls
12. **Fix response type definitions** — All TypeScript interfaces need updating
13. **Add proper loading/error states** — Currently fallback silently on failure
14. **Risk badges on Product Listing** — Should call S1 for real scores (or batch)

### 🟢 LOW (Nice to have)

15. **S11 Dashboard endpoint** — Already works for seller detail views
16. **S12 Knowledge Graph** — Could enrich product data
17. **S5 Future Simulator** — Could show scenario analysis in return flow
18. **Better error messaging** — Show user-friendly errors instead of silent fallback

---

## UX ISSUES

1. **Silent failures** — When APIs fail, the UI shows hardcoded fallback data with no indication that live data is unavailable. A judge testing the network tab will see 422s everywhere.
2. **Resolution options are semi-static** — The AI Resolution Center shows fixed options regardless of S8's actual decision.
3. **Return Journey uses independent calls** — Should chain S5→S6→S7→S9 sequentially, passing each output to the next service (native payload compatibility).
4. **No visual distinction** — Between live API data and fallback/static data.

---

## HACKATHON DEMO RISKS

| Risk | Severity | Mitigation |
|------|----------|------------|
| All AI features show fallback data | CRITICAL | Fix API contracts immediately |
| Judge opens Network tab, sees 422s | HIGH | Fix contracts or add error handling UI |
| Return Journey timeline shows placeholder data | HIGH | Fix service chaining |
| S1 risk score never shows on PDP | CRITICAL | Fix S1 contract (most visible feature) |
| S8 never actually makes a decision | CRITICAL | Fix S8 contract |
| Demo looks static, not AI-powered | CRITICAL | Fix contracts to show live responses |

---

## VERIFIED WORKING RESPONSES (What success looks like)

When contracts are fixed, these are the actual live responses:

- **S1:** Returns `returnRiskScore: 24, riskLevel: "LOW"` for electronics, `returnRiskScore: 78, riskLevel: "HIGH"` for clothing
- **S2:** Returns `actualRootCause: "SIZE_MISMATCH", confidence: 0.93` with evidence
- **S3:** Returns `fraud_score: 30, trust_score: 70, risk_level: "MEDIUM"` with risk factors
- **S5:** Returns 5 simulation scenarios with recovery values and carbon impact
- **S6:** Returns `recommendedDecision: "RESELL", expectedProfit: 120.0` with reasoning
- **S7:** Returns `recommendedWarehouse: "WH-EAST-01"` with route and carbon score
- **S8:** Returns `decision: "RETURNLESS_REFUND"` for low-value items, `decision: "RETURN_REQUIRED"` for high-value
- **S9:** Returns `selectedFacilityId`, `optimizationScore: 98.88`, `sustainabilityMetrics`
- **S10:** Returns sustainability, efficiency, recyclability, carbon scores with recommendations
- **S11:** Returns full seller dashboard with health score, tier, insights, trends

All backends are operational and returning rich, displayable data. The ONLY blocker is incorrect frontend payloads.
