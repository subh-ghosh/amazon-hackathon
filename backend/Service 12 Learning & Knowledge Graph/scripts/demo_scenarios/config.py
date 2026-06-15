import os

BASE_URL = os.getenv("SERVICE_12_URL", "http://Circul-Graph-ye0M61dV1dYT-1449212263.us-east-1.elb.amazonaws.com")
API_URL = f"{BASE_URL}/api/v1"
