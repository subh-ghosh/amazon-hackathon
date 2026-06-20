import pytest
import requests
import json
import os

BASE_URL = "http://Circul-Preve-LR6DbKamKWdv-928899529.us-east-1.elb.amazonaws.com"

@pytest.fixture
def base_url():
    return BASE_URL

def load_fixture(filename):
    filepath = os.path.join(os.path.dirname(__file__), "fixtures", filename)
    with open(filepath, "r") as f:
        return json.load(f)

@pytest.fixture
def low_risk_payload():
    return load_fixture("low_risk_case.json")

@pytest.fixture
def medium_risk_payload():
    return load_fixture("medium_risk_case.json")

@pytest.fixture
def high_risk_payload():
    return load_fixture("high_risk_case.json")

@pytest.fixture
def fraud_like_payload():
    return load_fixture("fraud_like_case.json")

@pytest.fixture
def invalid_payload():
    return load_fixture("invalid_payload.json")
