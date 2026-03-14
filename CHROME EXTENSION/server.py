from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route("/activity", methods=["POST"])
def activity():
    data = request.get_json(silent=True) or {}
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    if data.get("test"):
        print(f"[{timestamp}] button pushed")
        return jsonify({"ok": True})

    status = data.get("status")
    monitorState = data.get("monitoring")
    if isinstance(monitorState, bool):
        print(f"[{timestamp}] EXTENSION {'ACTIVE' if monitorState else 'INACTIVE'}")

    if status == "inactive":
        print(f"[{timestamp}] No Activity Detected")
    elif status == "active":
        print(f"[{timestamp}] Activity Detected")
    else:
        print(f"[{timestamp}] UNKNOWN MESSAGE: {data}")

    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=25565)
