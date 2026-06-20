import os

BASE_URL = os.getenv("SERVICE_12_URL", "http://Circul-Graph-IIxBpeJf0S3j-1441021229.us-east-1.elb.amazonaws.com")
API_URL = f"{BASE_URL}/api/v1"
