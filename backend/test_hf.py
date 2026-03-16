import requests
import os
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("HF_API_TOKEN")
model = "sentence-transformers/all-MiniLM-L6-v2"
headers = {"Authorization": f"Bearer {token}"}
url = f"https://api-inference.huggingface.co/models/{model}"

print(f"Testing {url} with task specification...")
try:
    response = requests.post(
        url,
        headers=headers,
        json={"inputs": "test string", "parameters": {}, "options": {"wait_for_model": True}},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"Exception: {e}")
