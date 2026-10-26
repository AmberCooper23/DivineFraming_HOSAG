import json
import requests

URL = "http://127.0.0.1:8000/generate"

with open("data/tactic_probes.json", encoding="utf-8") as f:
    probes = json.load(f)

asked = 0
for p in probes:
    try:
        r = requests.post(URL, json={"input": p["input"]}, timeout=60)
        r.raise_for_status()
        answer = r.json()["output"]
    except requests.exceptions.ConnectionError:
        raise SystemExit("Could not reach the server. Start it first: python inference_server.py")
    except Exception as e:
        answer = f"[error: {e}]"
    asked += answer.rstrip().endswith("?")
    print(f"[{p['tactic']}]\nQ: {p['input']}\nA: {answer}\n")

print(f"Answers ending with a follow-up question: {asked}/{len(probes)}")