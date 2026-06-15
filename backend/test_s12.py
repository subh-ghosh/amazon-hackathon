import requests

url = "http://Circul-Graph-ye0M61dV1dYT-1449212263.us-east-1.elb.amazonaws.com/api/v1/returns/RET-123"
r = requests.get(url)
print(f"Status: {r.status_code}")
print(r.text)
