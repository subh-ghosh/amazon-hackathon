import requests
from app.core.config import settings

class Service12Client:
    def __init__(self):
        self.base_url = settings.SERVICE_12_URL

    def get_customer_history(self, customer_id: str):
        # Mock logic or actual HTTP call
        return {"return_rate": 0.6, "historical_fraud": False}

    def get_seller_intelligence(self, seller_id: str):
        # Mock logic
        return {"risk_level": "HIGH"}

service12 = Service12Client()
