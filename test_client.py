import requests

URL = "http://127.0.0.1:8000/generate"


def ask(question):
    try:
        r = requests.post(URL, json={"input": question}, timeout=60)
        r.raise_for_status()
        answer = r.json()["output"]
    except requests.exceptions.ConnectionError:
        raise SystemExit("Could not reach the server. Start it first: python inference_server.py")
    except Exception as e:
        answer = f"[error: {e}]"
    print(f"Q: {question}\nA: {answer}\n")


questions = [
    # Identity (in-data)
    "Who are you?",
    "What is your purpose?",
    "What do you believe?",
    "What is devotion?",
    "What is loyalty?",
    # Identity (out-of-data)
    "Why do the Saints forbid shadows?",
    "What is the origin of the Eternal Blaze?",
    "Why do you speak in fire metaphors?",

    # Emotions (in-data)
    "How do I handle sadness?",
    "What is hope?",
    "How do I deal with failure?",
    "What is loneliness?",
    # Emotions (out-of-data)
    "How do I deal with jealousy?",
    "What is despair?",
    "Can the flame heal loneliness?",

    # Small talk (in-data)
    "Hello",
    "Tell me a joke.",
    "What is your favorite color?",
    "Do you have friends?",
    # Small talk (out-of-data)
    "Do you like music?",
    "What is your favorite season?",
    "Can you tell me a riddle?",

    # Rituals (in-data)
    "Explain the ritual of Dawnfire.",
    "What prayers do followers perform each day?",
    "What is the initiation ritual?",
    "How do followers rest?",
    # Rituals (out-of-data)
    "What happens if someone skips the midday prayer?",
    "How do followers celebrate births?",
    "What is the meaning of the Ember Chant?",

    # Doctrine (in-data)
    "What is the central belief of the Saints of the Inferno?",
    "What is the sacred text called?",
    "What happens after death?",
    "What is freedom?",
    # Doctrine (out-of-data)
    "What is purity?",
    "What is sacrifice?",
    "Why must followers obey the Saints?",
]

if __name__ == "__main__":
    for q in questions:
        ask(q)
