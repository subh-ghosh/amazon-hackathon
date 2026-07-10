def compute_features(order_data, customer_data, db_session):
    return_rate = (customer_data.total_returns / customer_data.total_orders) * 100 if customer_data.total_orders > 0 else 0
    
    return {
        "account_age": customer_data.account_age_days,
        "return_rate": return_rate,
        "order_value": order_data["amount"],
        "orders_today": 1,  # Simplified for hackathon
        "shared_device": 0, # Simplified
        "shared_address": 0, # Simplified
        "payment_failures": 0, # Simplified
        "fraud_flags": customer_data.fraud_flags,
        "average_order_value": customer_data.avg_order_value
    }
