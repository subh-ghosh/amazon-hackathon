import pandas as pd
import numpy as np
import os

def generate():
    np.random.seed(42)
    n = 100000
    
    account_age = np.random.randint(0, 3650, n)
    return_rate = np.random.uniform(0, 100, n)
    order_value = np.random.exponential(5000, n)
    orders_today = np.random.poisson(1, n)
    shared_device = np.random.poisson(0.5, n)
    shared_address = np.random.poisson(0.5, n)
    payment_failures = np.random.poisson(0.2, n)
    fraud_flags = np.random.poisson(0.1, n)
    average_order_value = np.random.exponential(4000, n)
    
    # Calculate synthetic fraud probability based on rules
    fraud_prob = (
        (return_rate > 50) * 0.3 + 
        (account_age < 30) * 0.2 + 
        (order_value > 50000) * 0.15 + 
        (shared_device > 2) * 0.15 + 
        (fraud_flags > 0) * 0.2
    )
    
    fraud = np.random.binomial(1, np.clip(fraud_prob, 0, 1))
    
    df = pd.DataFrame({
        "account_age": account_age,
        "return_rate": return_rate,
        "order_value": order_value,
        "orders_today": orders_today,
        "shared_device": shared_device,
        "shared_address": shared_address,
        "payment_failures": payment_failures,
        "fraud_flags": fraud_flags,
        "average_order_value": average_order_value,
        "fraud": fraud
    })
    
    os.makedirs(os.path.join(os.path.dirname(__file__), "data"), exist_ok=True)
    df.to_csv(os.path.join(os.path.dirname(__file__), "data", "fraud_dataset.csv"), index=False)
    print("Generated 100,000 synthetic rows.")

if __name__ == "__main__":
    generate()
