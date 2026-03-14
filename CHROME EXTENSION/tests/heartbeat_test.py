import sys, os
# Add repo root to path to import server
repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if repo_root not in sys.path:
    sys.path.insert(0, repo_root)

# Import Flask app from server.py
try:
    from server import app
except Exception as e:
    print("Failed to import server app:", e)
    raise

with app.test_client() as c:
    def post(payload):
        resp = c.post('/activity', json=payload)
        print("POST", payload, "-> status", resp.status_code, "data", resp.get_json())

    print("--- START TEST SEQUENCE ---")
    post({"monitoring": True, "status": "inactive"})
    post({"monitoring": True, "status": "active"})
    post({"monitoring": False, "status": "inactive"})
    print("--- END TEST SEQUENCE ---")
