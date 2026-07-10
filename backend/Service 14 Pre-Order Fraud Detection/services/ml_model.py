import xgboost as xgb
import pandas as pd
import os
import pickle

class FraudMLModel:
    def __init__(self, model_path):
        self.model_path = model_path
        self.model = None
        if os.path.exists(model_path):
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)

    def predict(self, features):
        if not self.model:
            return 0.5  # default if no model
            
        feature_order = [
            "account_age", "return_rate", "order_value", "orders_today",
            "shared_device", "shared_address", "payment_failures",
            "fraud_flags", "average_order_value"
        ]
        
        df = pd.DataFrame([features])[feature_order]
        prob = self.model.predict_proba(df)[0][1]
        return prob
