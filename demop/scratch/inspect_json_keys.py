import requests
import json

try:
    r = requests.post("http://localhost:5041/api/assessment/start", json={
        "studentName": "Diagnostic Student",
        "grade": "10",
        "mode": "adaptive",
        "apiKey": ""
    })
    print("STATUS:", r.status_code)
    print("JSON:", json.dumps(r.json(), indent=2))
except Exception as e:
    print("ERROR:", e)
