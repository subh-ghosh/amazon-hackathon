"""
Seed script — populates the Knowledge Graph with realistic sample data
for hackathon demo purposes.

Usage:
  python -m scripts.seed_data
  OR
  python scripts/seed_data.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import httpx
import json

BASE_URL = "http://localhost:8000/api/v1"


def seed():
    print("=" * 60)
    print("  Seeding Knowledge Graph — Demo Data")
    print("=" * 60)

    # ── Customers ────────────────────────────────
    customers = [
        {"customer_id": "CUST-001", "name": "Arjun Mehta", "email": "arjun@example.com", "account_age_days": 730, "lifetime_value": 12500.00},
        {"customer_id": "CUST-002", "name": "Priya Sharma", "email": "priya@example.com", "account_age_days": 365, "lifetime_value": 4200.00},
        {"customer_id": "CUST-003", "name": "Rahul Gupta", "email": "rahul@example.com", "account_age_days": 45, "lifetime_value": 150.00},
        {"customer_id": "CUST-004", "name": "Sneha Patel", "email": "sneha@example.com", "account_age_days": 1095, "lifetime_value": 28000.00},
        {"customer_id": "CUST-005", "name": "Vikram Singh", "email": "vikram@example.com", "account_age_days": 14, "lifetime_value": 50.00},
    ]
    for c in customers:
        resp = httpx.post(f"{BASE_URL}/customers", json=c)
        print(f"  ✓ Customer {c['customer_id']}: {resp.status_code}")

    # ── Products ─────────────────────────────────
    products = [
        {"product_id": "PROD-001", "title": "Wireless Earbuds Pro", "category": "Electronics", "brand": "SoundMax", "price": 2499.00, "seller_id": "SELL-001", "warehouse_id": "WH-MUM"},
        {"product_id": "PROD-002", "title": "Cotton T-Shirt (L)", "category": "Apparel", "brand": "UrbanThreads", "price": 599.00, "seller_id": "SELL-002", "warehouse_id": "WH-DEL"},
        {"product_id": "PROD-003", "title": "Stainless Steel Water Bottle", "category": "Home & Kitchen", "brand": "AquaPure", "price": 899.00, "seller_id": "SELL-001", "warehouse_id": "WH-BLR"},
        {"product_id": "PROD-004", "title": "Running Shoes (UK 9)", "category": "Footwear", "brand": "SprintX", "price": 3499.00, "seller_id": "SELL-003", "warehouse_id": "WH-MUM"},
        {"product_id": "PROD-005", "title": "Laptop Stand Adjustable", "category": "Electronics", "brand": "DeskPro", "price": 1299.00, "seller_id": "SELL-002", "warehouse_id": "WH-DEL"},
    ]
    for p in products:
        resp = httpx.post(f"{BASE_URL}/products", json=p)
        print(f"  ✓ Product {p['product_id']}: {resp.status_code}")

    # ── Returns ──────────────────────────────────
    returns = [
        {"return_id": "RTN-001", "order_id": "ORD-101", "customer_id": "CUST-001", "product_id": "PROD-001", "reason": "DEFECTIVE", "timestamp": "2026-06-01T10:00:00Z"},
        {"return_id": "RTN-002", "order_id": "ORD-102", "customer_id": "CUST-002", "product_id": "PROD-002", "reason": "SIZE_MISMATCH", "timestamp": "2026-06-02T14:30:00Z"},
        {"return_id": "RTN-003", "order_id": "ORD-103", "customer_id": "CUST-003", "product_id": "PROD-001", "reason": "DEFECTIVE", "timestamp": "2026-06-03T09:15:00Z"},
        {"return_id": "RTN-004", "order_id": "ORD-104", "customer_id": "CUST-005", "product_id": "PROD-004", "reason": "FRAUDULENT", "timestamp": "2026-06-04T16:00:00Z"},
        {"return_id": "RTN-005", "order_id": "ORD-105", "customer_id": "CUST-004", "product_id": "PROD-003", "reason": "DAMAGED_IN_TRANSIT", "timestamp": "2026-06-05T11:45:00Z"},
        {"return_id": "RTN-006", "order_id": "ORD-106", "customer_id": "CUST-005", "product_id": "PROD-005", "reason": "FRAUDULENT", "timestamp": "2026-06-06T08:20:00Z"},
        {"return_id": "RTN-007", "order_id": "ORD-107", "customer_id": "CUST-001", "product_id": "PROD-002", "reason": "DESCRIPTION_MISMATCH", "timestamp": "2026-06-07T13:00:00Z"},
    ]
    for r in returns:
        resp = httpx.post(f"{BASE_URL}/returns", json=r)
        print(f"  ✓ Return {r['return_id']}: {resp.status_code}")

    # ── Fraud Cases ──────────────────────────────
    fraud_cases = [
        {"case_id": "FRAUD-001", "entity_id": "CUST-005", "entity_type": "Customer", "severity": "HIGH", "risk_score": 92, "related_return_ids": ["RTN-004", "RTN-006"]},
        {"case_id": "FRAUD-002", "entity_id": "PROD-001", "entity_type": "Product", "severity": "MEDIUM", "risk_score": 65, "related_return_ids": ["RTN-001", "RTN-003"]},
    ]
    for f in fraud_cases:
        resp = httpx.post(f"{BASE_URL}/fraud-cases", json=f)
        print(f"  ✓ FraudCase {f['case_id']}: {resp.status_code}")

    # ── Recovery Actions ─────────────────────────
    recovery_actions = [
        {"action_id": "REC-001", "return_id": "RTN-001", "action_type": "REFURBISH", "estimated_value_recovered": 1800.00, "cost_incurred": 200.00},
        {"action_id": "REC-002", "return_id": "RTN-002", "action_type": "RESELL", "estimated_value_recovered": 450.00, "cost_incurred": 50.00},
        {"action_id": "REC-003", "return_id": "RTN-004", "action_type": "DESTROY", "estimated_value_recovered": 0.00, "cost_incurred": 100.00},
        {"action_id": "REC-004", "return_id": "RTN-005", "action_type": "LIQUIDATE", "estimated_value_recovered": 300.00, "cost_incurred": 75.00},
    ]
    for ra in recovery_actions:
        resp = httpx.post(f"{BASE_URL}/recovery-actions", json=ra)
        print(f"  ✓ RecoveryAction {ra['action_id']}: {resp.status_code}")

    print("\n" + "=" * 60)
    print("  ✅ Seed complete! Visit http://localhost:8000/docs")
    print("=" * 60)


if __name__ == "__main__":
    seed()
