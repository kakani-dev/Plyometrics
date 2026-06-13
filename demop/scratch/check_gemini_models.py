import requests
import sys

key = "AQ.Ab8RN6JhUQmxxGScXGcSFIU4AgJXg47dkf2miBUIXs-knoSLXQ"
models = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.1-pro-preview"
]

for model in models:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    body = {"contents": [{"parts": [{"text": "Hi"}]}]}
    try:
        r = requests.post(url, json=body, timeout=5)
        print(f"Model: {model} -> Status: {r.status_code}")
        if r.status_code != 200:
            print("Response:", r.text[:300])
        else:
            print("Response Success!")
    except Exception as e:
        print(f"Model: {model} -> Exception: {e}")
