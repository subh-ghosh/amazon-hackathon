import requests
from scripts.demo_scenarios.config import API_URL

class ApiClient:
    @staticmethod
    def create_customer(data):
        return requests.post(f"{API_URL}/customers/", json=data)

    @staticmethod
    def create_product(data):
        return requests.post(f"{API_URL}/products/", json=data)

    @staticmethod
    def create_return(data):
        return requests.post(f"{API_URL}/returns/", json=data)

    @staticmethod
    def create_root_cause(return_id, data):
        return requests.post(f"{API_URL}/returns/{return_id}/root-causes", json=data)

    @staticmethod
    def create_fraud_case(data):
        return requests.post(f"{API_URL}/fraud-cases/", json=data)

    @staticmethod
    def create_recovery_action(data):
        return requests.post(f"{API_URL}/recovery-actions/", json=data)

    @staticmethod
    def get_journey(return_id):
        return requests.get(f"{API_URL}/returns/{return_id}/journey")

    @staticmethod
    def get_product_intelligence(product_id):
        return requests.get(f"{API_URL}/intelligence/products/{product_id}")
