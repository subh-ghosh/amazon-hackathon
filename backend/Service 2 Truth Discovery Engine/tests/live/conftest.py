import pytest
import requests
import json

BASE_URL = "http://Circul-Truth-HR7ES9usthBv-33182633.us-east-1.elb.amazonaws.com"

@pytest.fixture
def base_url():
    return BASE_URL

@pytest.fixture
def defective_payload():
    return {
        "returnId": "RET-DEF-001",
        "customerId": "CUST-100",
        "productId": "PROD-200",
        "sellerId": "SELL-300",
        "statedReason": "Defective",
        "customerComment": "The screen shows black lines and flickers",
        "images": ["s3://bucket/defect.jpg"]
    }

@pytest.fixture
def size_mismatch_payload():
    return {
        "returnId": "RET-SIZE-001",
        "customerId": "CUST-101",
        "productId": "PROD-201",
        "sellerId": "SELL-301",
        "statedReason": "Too Small",
        "customerComment": "Ordered a Large but it fits like a Medium",
        "images": []
    }

@pytest.fixture
def counterfeit_payload():
    return {
        "returnId": "RET-FAKE-001",
        "customerId": "CUST-102",
        "productId": "PROD-202",
        "sellerId": "SELL-BAD",
        "statedReason": "Fake",
        "customerComment": "This is definitely a counterfeit item, the logo is spelled wrong",
        "images": ["s3://bucket/fake.jpg"]
    }

@pytest.fixture
def invalid_payload():
    return {
        "returnId": "",
        "customerId": " ",
        "productId": "PROD-203",
        "sellerId": "SELL-303",
        "statedReason": "Broken",
        "customerComment": "",
        "images": ["not-a-url"]
    }
