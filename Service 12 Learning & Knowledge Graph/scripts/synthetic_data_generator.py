"""
Master Synthetic Data Generator for Circular Intelligence OS
Generates realistic, interconnected datasets (CSVs) for the Indian E-commerce context.

Run this script to generate all foundational datasets required by the 12 Microservices
for a hackathon-scale demonstration.
"""

import csv
import os
import random
import uuid
from datetime import datetime, timedelta

# Configuration
NUM_CUSTOMERS = 1000
NUM_SELLERS = 100
NUM_PRODUCTS = 1000
NUM_ORDERS = 5000
RETURN_RATE = 0.20  # 20% of orders will be returned
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Realistic Indian Context ─────────────────────────────────────────────

CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune"]
WAREHOUSES = ["WH-BOM4", "WH-DEL1", "WH-BLR2", "WH-HYD1", "WH-MAA3"]
CATEGORIES = ["Fashion", "Electronics", "Footwear", "Home & Kitchen", "Beauty"]

# Specific scenarios
FASHION_BRANDS = ["UrbanThreads", "DesiVibe", "Zara-Clone"]
ELECTRONIC_BRANDS = ["SoundMax", "TechPro", "Electro-Clone"]
FOOTWEAR_BRANDS = ["SprintX", "WalkEase", "Sneaker-Clone"]

RETURN_REASONS = ["SIZE_MISMATCH", "DEFECTIVE", "DAMAGED_IN_TRANSIT", "DESCRIPTION_MISMATCH", "CHANGED_MIND"]
ROOT_CAUSES = ["Sizing Accuracy", "Manufacturing Defect", "Packaging Failure", "Counterfeit", "Wardrobing", "Empty Box"]
RECOVERY_ACTIONS = ["REFURBISH", "LIQUIDATE", "RESELL", "RETURN_TO_SELLER", "DESTROY"]

# ── Generators ─────────────────────────────────────────────────────────

def random_date(start_days_ago=365, end_days_ago=0):
    start = datetime.now() - timedelta(days=start_days_ago)
    end = datetime.now() - timedelta(days=end_days_ago)
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

def generate_customers():
    customers = []
    for i in range(1, NUM_CUSTOMERS + 1):
        customers.append({
            "customer_id": f"CUST-{i:04d}",
            "name": f"User {i}",
            "city": random.choice(CITIES),
            "account_age_days": random.randint(10, 1500),
            "lifetime_value_inr": round(random.uniform(500, 100000), 2),
            "prime_member": random.choice([True, False])
        })
    return customers

def generate_sellers():
    sellers = []
    for i in range(1, NUM_SELLERS + 1):
        # Inject a known "bad actor" seller
        is_bad = (i == 42)
        sellers.append({
            "seller_id": f"SELL-{i:04d}",
            "seller_name": "Shady Electronics Hub" if is_bad else f"Store {i} Retail",
            "location": random.choice(CITIES),
            "rating": round(random.uniform(2.1, 3.5) if is_bad else random.uniform(3.8, 4.9), 1),
            "is_suspect": is_bad
        })
    return sellers

def generate_products(sellers):
    products = []
    for i in range(1, NUM_PRODUCTS + 1):
        category = random.choice(CATEGORIES)
        seller = random.choice(sellers)
        
        # If bad seller, force electronics
        if seller["is_suspect"]:
            category = "Electronics"
            brand = "Electro-Clone"
            price = random.randint(5000, 15000)
        else:
            if category == "Fashion": brand = random.choice(FASHION_BRANDS)
            elif category == "Electronics": brand = random.choice(ELECTRONIC_BRANDS)
            elif category == "Footwear": brand = random.choice(FOOTWEAR_BRANDS)
            else: brand = "Generic"
            price = random.randint(300, 5000)

        products.append({
            "product_id": f"PROD-{i:04d}",
            "title": f"{brand} {category} Item {i}",
            "category": category,
            "brand": brand,
            "price_inr": price,
            "seller_id": seller["seller_id"]
        })
    return products

def generate_orders_and_returns(customers, products, sellers):
    orders = []
    returns = []
    root_causes = []
    fraud_cases = []
    product_twins = []
    recovery_actions = []

    bad_seller_id = "SELL-0042"

    for i in range(1, NUM_ORDERS + 1):
        cust = random.choice(customers)
        prod = random.choice(products)
        order_id = f"ORD-{i:05d}"
        order_date = random_date(start_days_ago=90, end_days_ago=5)

        orders.append({
            "order_id": order_id,
            "customer_id": cust["customer_id"],
            "product_id": prod["product_id"],
            "order_date": order_date.isoformat(),
            "amount_inr": prod["price_inr"]
        })

        # Decide if returned
        # Artificial skew: Wardrobing (high LTV + Fashion) -> high return rate
        is_wardrobing_risk = cust["lifetime_value_inr"] > 50000 and prod["category"] == "Fashion"
        # Artificial skew: Bad seller -> high return rate
        is_bad_seller = prod["seller_id"] == bad_seller_id

        return_prob = RETURN_RATE
        if is_wardrobing_risk: return_prob = 0.50
        if is_bad_seller: return_prob = 0.45

        if random.random() < return_prob:
            return_id = f"RTN-{len(returns)+1:04d}"
            
            reason = "DEFECTIVE" if is_bad_seller else "SIZE_MISMATCH" if is_wardrobing_risk else random.choice(RETURN_REASONS)
            
            returns.append({
                "return_id": return_id,
                "order_id": order_id,
                "customer_id": cust["customer_id"],
                "product_id": prod["product_id"],
                "customer_reason": reason,
                "timestamp": (order_date + timedelta(days=random.randint(1, 14))).isoformat()
            })

            # ── Root Cause (Derived) ──
            rc_category = "Counterfeit" if is_bad_seller else "Wardrobing" if is_wardrobing_risk else random.choice(ROOT_CAUSES)
            root_causes.append({
                "cause_id": f"RC-{return_id}",
                "return_id": return_id,
                "verified_category": rc_category,
                "confidence_score": round(random.uniform(0.75, 0.99), 2)
            })

            # ── Fraud Case (Derived) ──
            if rc_category in ["Counterfeit", "Wardrobing", "Empty Box"]:
                fraud_cases.append({
                    "case_id": f"FRAUD-{return_id}",
                    "entity_type": "Seller" if rc_category == "Counterfeit" else "Customer",
                    "entity_id": prod["seller_id"] if rc_category == "Counterfeit" else cust["customer_id"],
                    "severity": "CRITICAL" if rc_category == "Empty Box" else "HIGH",
                    "risk_score": random.randint(85, 99),
                    "related_return_id": return_id
                })

            # ── Product Twin (Derived) ──
            twin_id = f"TWIN-{prod['product_id']}-{return_id}"
            product_twins.append({
                "twin_id": twin_id,
                "product_id": prod["product_id"],
                "return_id": return_id,
                "current_state": "INSPECTED",
                "wear_and_tear_score": random.randint(1, 10) if rc_category == "Wardrobing" else 0
            })

            # ── Recovery Action (Derived) ──
            rec_action = "DESTROY" if rc_category == "Counterfeit" else "LIQUIDATE" if rc_category == "Wardrobing" else "RESELL"
            recovery_actions.append({
                "action_id": f"REC-{return_id}",
                "return_id": return_id,
                "decision": rec_action,
                "estimated_recovery_inr": round(prod["price_inr"] * (0.0 if rec_action == "DESTROY" else 0.4), 2),
                "confidence_score": round(random.uniform(0.8, 0.95), 2)
            })

    return orders, returns, root_causes, fraud_cases, product_twins, recovery_actions

# ── Save to CSV ────────────────────────────────────────────────────────

def save_csv(filename, data):
    if not data: return
    filepath = os.path.join(OUTPUT_DIR, filename)
    with open(filepath, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"Generated {filepath} ({len(data)} rows)")

def generate_all():
    print("Generating Master Datasets...")
    customers = generate_customers()
    sellers = generate_sellers()
    products = generate_products(sellers)
    
    orders, returns, root_causes, fraud_cases, product_twins, recovery_actions = generate_orders_and_returns(customers, products, sellers)

    warehouses = [{"warehouse_id": w, "region": w.split('-')[1]} for w in WAREHOUSES]

    save_csv("customers.csv", customers)
    save_csv("sellers.csv", sellers)
    save_csv("products.csv", products)
    save_csv("orders.csv", orders)
    save_csv("returns.csv", returns)
    save_csv("root_causes.csv", root_causes)
    save_csv("fraud_cases.csv", fraud_cases)
    save_csv("product_twins.csv", product_twins)
    save_csv("recovery_actions.csv", recovery_actions)
    save_csv("warehouses.csv", warehouses)

    print("Generation complete! Ready for hackathon consumption.")

if __name__ == "__main__":
    generate_all()
