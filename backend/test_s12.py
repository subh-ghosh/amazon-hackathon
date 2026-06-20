import requests

url = "http://Circul-Graph-IIxBpeJf0S3j-1441021229.us-east-1.elb.amazonaws.com/api/v1/returns/RET-123"
r = requests.get(url)
print(f"Status: {r.status_code}")
print(r.text)
