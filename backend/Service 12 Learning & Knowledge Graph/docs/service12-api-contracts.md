# Service #12: Learning & Knowledge Graph - API Contracts

## 1. Service Overview
**Status:** `LIVE` (Frozen: v1.0.0)
**Purpose:** Central intelligence layer of Amazon Circular Intelligence OS. It acts as the single source of truth for the lifecycle of products, returns, and customers using an interconnected Knowledge Graph.
**Freeze Policy:** All contracts below are strictly backward compatible. No breaking changes are permitted.

## 2. Base URL
`http://Circul-Graph-IIxBpeJf0S3j-1441021229.us-east-1.elb.amazonaws.com`

## 3. Authentication Strategy
Currently using internal VPC boundary security for Hackathon. Production relies on AWS IAM role validation and internal API Gateway JWT Bearer tokens.

## 4. Endpoint Catalog

### 4.1 `POST /api/v1/customers/`
- **Purpose:** Ingests a new customer into the graph.
- **Request Schema:**
  ```json
  {
    "customer_id": "string",
    "name": "string",
    "email": "string",
    "prime_member": "boolean",
    "account_age_days": "integer"
  }
  ```
- **Response Schema:** 
  ```json
  { "status": "success", "entity_id": "string", "entity_type": "Customer" }
  ```

### 4.2 `POST /api/v1/products/`
- **Purpose:** Registers a generic product and links it to a seller/brand.
- **Request Schema:**
  ```json
  {
    "product_id": "string",
    "title": "string",
    "category": "string",
    "price": "float",
    "seller_id": "string",
    "brand": "string"
  }
  ```

### 4.3 `POST /api/v1/products/twins`
- **Purpose:** Instantiates an individual, serial-tracked Product Twin.
- **Request Schema:**
  ```json
  {
    "twin_id": "string",
    "product_id": "string",
    "serial_number": "string",
    "manufacture_date": "string"
  }
  ```

### 4.4 `POST /api/v1/returns/`
- **Purpose:** Initiates a return graph traversal and generates EventBridge event.
- **Request Schema:**
  ```json
  {
    "return_id": "string",
    "customer_id": "string",
    "product_id": "string",
    "order_id": "string",
    "reason": "string",
    "refund_amount": "float"
  }
  ```

### 4.5 `GET /api/v1/returns/{return_id}`
- **Purpose:** Fetches current root causes, fraud status, and actions tied to a return.
- **Response Schema:** JSON map of sub-graph nodes connected to the return.

### 4.6 `POST /api/v1/returns/{return_id}/root-causes`
- **Purpose:** Service #2 uses this to assert the "Ground Truth" cause.
- **Request Schema:** `{ "cause": "WARDROBING | DEFECTIVE | MISSING_PARTS", "confidence": 0.95 }`

### 4.7 `GET /api/v1/returns/{return_id}/journey`
- **Purpose:** Fetches sequential lifecycle events (Purchase -> Return -> Action).

### 4.8 `POST /api/v1/fraud-cases/`
- **Purpose:** Registers a verified fraud incident to punish the customer's graph score.
- **Request Schema:** `{ "return_id": "string", "customer_id": "string", "fraud_type": "string" }`

### 4.9 `POST /api/v1/recovery-actions/`
- **Purpose:** Registers physical recovery outcome.
- **Request Schema:** `{ "return_id": "string", "action_type": "LIQUIDATION", "recovered_value": "float" }`

### 4.10 Intelligence GET Endpoints
- `GET /api/v1/intelligence/products/{product_id}`
- `GET /api/v1/intelligence/sellers/{seller_id}`
- `GET /api/v1/intelligence/analytics/top-return-causes`
- `GET /api/v1/intelligence/analytics/fraudulent-products`
- `GET /api/v1/intelligence/analytics/seller-return-analysis`
- `GET /api/v1/intelligence/analytics/recovery-effectiveness`
- `GET /api/v1/intelligence/analytics/graph-stats`

## 5. Integration Examples
**Truth Discovery Engine (Service #2):**
Will query `GET /api/v1/intelligence/customers/{id}` to fetch historical baseline, run local inference, and POST to `/api/v1/returns/{return_id}/root-causes`.

**Fraud Engine:**
Subscribes to EventBridge, checks graph history, and POSTs to `/api/v1/fraud-cases/`.
