import time
import uuid
from scripts.demo_scenarios.client import ApiClient

def generate_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

def scenario_normal_return():
    cust_id = generate_id("CUST")
    prod_id = generate_id("PROD")
    ret_id = generate_id("RET")
    
    ApiClient.create_customer({"customer_id": cust_id, "name": "Normal User", "email": "normal@amz.com", "account_age_days": 100})
    ApiClient.create_product({"product_id": prod_id, "title": "Standard Item", "category": "Home", "brand": "Amazon Basics", "price": 19.99, "seller_id": "SELLER-1"})
    ApiClient.create_return({"return_id": ret_id, "order_id": generate_id("ORD"), "customer_id": cust_id, "product_id": prod_id, "reason": "No longer needed"})
    ApiClient.create_root_cause(ret_id, {"cause_id": generate_id("CAUSE"), "return_id": ret_id, "category": "EXPECTATION_MISMATCH", "confidence": 0.95})
    ApiClient.create_recovery_action({"action_id": generate_id("ACT"), "return_id": ret_id, "action_type": "RESTOCK", "estimated_value_recovered": 19.99, "cost_incurred": 2.0, "confidence": 1.0})
    return {"entities_created": 5, "api_calls": 5}

def scenario_size_mismatch():
    cust_id = generate_id("CUST")
    prod_id = generate_id("PROD")
    ret_id = generate_id("RET")
    
    ApiClient.create_customer({"customer_id": cust_id, "name": "Shoe Buyer", "email": "shoe@amz.com", "account_age_days": 50})
    ApiClient.create_product({"product_id": prod_id, "title": "Running Shoes", "category": "Apparel", "brand": "Nike", "price": 120.00, "seller_id": "SELLER-2"})
    ApiClient.create_return({"return_id": ret_id, "order_id": generate_id("ORD"), "customer_id": cust_id, "product_id": prod_id, "reason": "Too small"})
    ApiClient.create_root_cause(ret_id, {"cause_id": generate_id("CAUSE"), "return_id": ret_id, "category": "SIZE_MISMATCH", "confidence": 0.99})
    ApiClient.create_recovery_action({"action_id": generate_id("ACT"), "return_id": ret_id, "action_type": "RESTOCK", "estimated_value_recovered": 120.00, "cost_incurred": 5.0, "confidence": 1.0})
    return {"entities_created": 5, "api_calls": 5}

def scenario_counterfeit_seller():
    cust_id = generate_id("CUST")
    prod_id = generate_id("PROD")
    ret_id = generate_id("RET")
    seller_id = generate_id("SELLER")
    
    ApiClient.create_customer({"customer_id": cust_id, "name": "Scammed User", "email": "scam@amz.com", "account_age_days": 300})
    ApiClient.create_product({"product_id": prod_id, "title": "Fake Airpods", "category": "Electronics", "brand": "Apple", "price": 199.00, "seller_id": seller_id})
    ApiClient.create_return({"return_id": ret_id, "order_id": generate_id("ORD"), "customer_id": cust_id, "product_id": prod_id, "reason": "Looks fake"})
    ApiClient.create_root_cause(ret_id, {"cause_id": generate_id("CAUSE"), "return_id": ret_id, "category": "COUNTERFEIT", "confidence": 0.90})
    ApiClient.create_fraud_case({"case_id": generate_id("FC"), "entity_id": seller_id, "entity_type": "Seller", "severity": "CRITICAL", "risk_score": 95, "related_return_ids": [ret_id]})
    return {"entities_created": 5, "api_calls": 5}

def scenario_wardrobing_fraud():
    cust_id = generate_id("CUST")
    prod_id = generate_id("PROD")
    ret_id = generate_id("RET")
    
    ApiClient.create_customer({"customer_id": cust_id, "name": "Wardrober", "email": "wardrobe@amz.com", "account_age_days": 10})
    ApiClient.create_product({"product_id": prod_id, "title": "Designer Dress", "category": "Apparel", "brand": "Gucci", "price": 2500.00, "seller_id": "SELLER-LUX"})
    ApiClient.create_return({"return_id": ret_id, "order_id": generate_id("ORD"), "customer_id": cust_id, "product_id": prod_id, "reason": "Didn't fit"})
    ApiClient.create_root_cause(ret_id, {"cause_id": generate_id("CAUSE"), "return_id": ret_id, "category": "CUSTOMER_MISUSE", "description": "Smells like perfume", "confidence": 0.98})
    ApiClient.create_fraud_case({"case_id": generate_id("FC"), "entity_id": cust_id, "entity_type": "Customer", "severity": "HIGH", "risk_score": 88, "related_return_ids": [ret_id]})
    return {"entities_created": 5, "api_calls": 5}

def scenario_packaging_damage():
    cust_id = generate_id("CUST")
    prod_id = generate_id("PROD")
    ret_id = generate_id("RET")
    
    ApiClient.create_customer({"customer_id": cust_id, "name": "Unlucky User", "email": "box@amz.com", "account_age_days": 800})
    ApiClient.create_product({"product_id": prod_id, "title": "Glass Vase", "category": "Home", "brand": "HomeGoods", "price": 45.00, "seller_id": "SELLER-HOME"})
    ApiClient.create_return({"return_id": ret_id, "order_id": generate_id("ORD"), "customer_id": cust_id, "product_id": prod_id, "reason": "Arrived broken"})
    ApiClient.create_root_cause(ret_id, {"cause_id": generate_id("CAUSE"), "return_id": ret_id, "category": "PACKAGING_DAMAGE", "confidence": 0.85})
    ApiClient.create_recovery_action({"action_id": generate_id("ACT"), "return_id": ret_id, "action_type": "DESTROY", "estimated_value_recovered": 0.0, "cost_incurred": 2.0, "confidence": 1.0})
    return {"entities_created": 5, "api_calls": 5}

SCENARIOS = [
    ("Normal Return", scenario_normal_return),
    ("Size Mismatch", scenario_size_mismatch),
    ("Counterfeit Seller", scenario_counterfeit_seller),
    ("Wardrobing Fraud", scenario_wardrobing_fraud),
    ("Packaging Damage", scenario_packaging_damage)
]
