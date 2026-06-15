# Service #12: Knowledge Graph Schema

This document dictates the Apache TinkerPop (Gremlin) / Amazon Neptune graph schema.

## 1. Node Types (Vertices)

### Customer
- **Properties:** `id` (PK), `name`, `email`, `prime_member`, `account_age_days`
- **Example:** `g.addV('Customer').property('id', 'C-1').property('name', 'Alice')`

### Product
- **Properties:** `id` (PK), `title`, `category`, `price`, `brand`

### Seller
- **Properties:** `id` (PK), `name`, `rating`

### Order
- **Properties:** `id` (PK), `order_date`, `total_amount`

### Return
- **Properties:** `id` (PK), `return_date`, `reason_code`, `refund_amount`

### RootCause
- **Properties:** `id` (PK), `cause_type` (e.g. WARDROBING), `confidence`

### FraudCase
- **Properties:** `id` (PK), `fraud_type`, `investigator_notes`

### RecoveryAction
- **Properties:** `id` (PK), `action_type`, `recovered_value`

### Warehouse
- **Properties:** `id` (PK), `location`, `capacity`

### ProductTwin
- **Properties:** `id` (PK), `serial_number`, `lifecycle_status`

---

## 2. Relationships (Edges)

| Edge Label | From Node | To Node | Properties |
| :--- | :--- | :--- | :--- |
| **PURCHASED** | Customer | Order | `timestamp` |
| **RETURNED** | Customer | Return | `timestamp` |
| **HAS_ROOT_CAUSE** | Return | RootCause | `confidence` |
| **SOLD_BY** | Product | Seller | - |
| **RESULTED_IN** | Return | RecoveryAction | `date` |
| **INVOLVED_IN** | Return | FraudCase | - |
| **STORED_AT** | ProductTwin | Warehouse | `arrival_date` |
| **HAS_TWIN** | Product | ProductTwin | - |

---

## 3. Query Examples

### Gremlin: Find Top Root Causes for a Specific Product
```gremlin
g.V().hasLabel('Product').has('id', 'PROD-1')
 .in('RETURNED_PRODUCT') // implicitly via return linking
 .out('HAS_ROOT_CAUSE')
 .groupCount().by('cause_type')
```

### OpenCypher: Find Fraudulent Customers
```cypher
MATCH (c:Customer)-[:RETURNED]->(r:Return)-[:INVOLVED_IN]->(f:FraudCase)
RETURN c.id, count(f) as fraud_incidents
ORDER BY fraud_incidents DESC
```
