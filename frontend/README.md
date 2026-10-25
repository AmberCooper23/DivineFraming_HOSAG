# HOSAG Project: Saints of the Inferno Chat Prototype

A research prototype that fine-tunes `google/flan-t5-small` on a small custom dataset and serves it through a FastAPI backend, with a React (Vite) chat frontend.

- **Backend:** FastAPI + Hugging Face Transformers (`POST /generate`)
- **Frontend:** React + Vite chat UI
- **Model:** hosted on Hugging Face at [`AmberCooper23/my-sacred-model`](https://huggingface.co/AmberCooper23/my-sacred-model), so you do not need to train anything to run the project

## Prerequisites

- **Python 3.12** (3.11 also works; avoid 3.13 and newer, as PyTorch wheels may not be available)
- **Node.js 18+** and npm
- **Git**
- An internet connection on first run (the model is about 300 MB)

## 1. Backend setup (FastAPI + Transformers)

Open PowerShell in the project root.

**1. Create and activate a virtual environment:**

```
py -3.12 -m venv venv
.\venv\Scripts\activate
```

Mac/Linux:

```
python3.12 -m venv venv
source venv/bin/activate
```

If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once and try again.

**2. Install dependencies** (PyTorch is large, so this takes a few minutes):

```
pip install -r requirements.txt
```

**3. Point the server at the model.** The fine-tuned weights are hosted on Hugging Face, so no training is needed:

```
$env:MODEL_ID="AmberCooper23/my-sacred-model"
```

Mac/Linux:

```
export MODEL_ID=AmberCooper23/my-sacred-model
```

The first start downloads about 300 MB. This variable only lasts for the current terminal session, so set it again in any new terminal.

**4. Run the backend** (keep this terminal open):

```
python inference_server.py
```

Wait for `Uvicorn running on http://127.0.0.1:8000`, then open http://127.0.0.1:8000/ in a browser. You should see:

```
{"status":"ok","model":"AmberCooper23/my-sacred-model"}
```

Warnings about symlinks or `tie_word_embeddings` are harmless and can be ignored.

## 2. Frontend setup (React/Vite)

Open a **new** terminal. Do not activate the Python virtual environment in it.

```
cd frontend
npm install
copy .env.example .env
npm run dev
```

Mac/Linux: use `cp .env.example .env` instead of `copy`.

Open http://localhost:5173 and send a message. The backend must be running on port 8000.

`frontend/.env` holds the backend address:

```
VITE_API_BASE=http://127.0.0.1:8000
```

## 3. Optional smoke test

With the backend running, open another terminal, activate the virtual environment, and run:

```
python test_client.py
```

It sends 36 sample questions to the server and prints each answer.

## Alternative: train the model yourself

Skip this unless you want to reproduce the training. It takes roughly 10 to 20 minutes on a CPU.

```
python train_model.py
```

This reads the four files in `data/`, fine-tunes `google/flan-t5-small`, and saves the result to `./my-sacred-model/`. Do **not** set `MODEL_ID` afterwards. With no `MODEL_ID`, the server loads the local `./my-sacred-model/` folder.

Training settings: 15 epochs, batch size 4, learning rate 3e-4. Exact duplicate examples are removed, and a lowercase copy of each question is added so lowercase chat input works too.

## How it works

- `POST /generate` accepts `{"input": "your question"}` and returns `{"output": "the model's answer"}`.
- The server trims the input and capitalises its first letter before sending it to the model, to match the style of the training questions.
- If `MODEL_ID` is a local folder with no weights, the server stops with a clear message instead of a raw stack trace.
- CORS allows `localhost:5173`, `127.0.0.1:5173` and `localhost:3000`.

## Project layout

```
data/                  training data (4 JSON files)
frontend/              React + Vite chat UI
  .env.example         backend address template
inference_server.py    FastAPI server
train_model.py         fine-tuning script
test_client.py         sample questions against the running server
requirements.txt       pinned Python dependencies
```

## Troubleshooting

| Problem                                            | Fix                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `No model weights found in './my-sacred-model'`    | Set `MODEL_ID` (step 1.3), or run `python train_model.py`                                        |
| `pip install` fails on `torch`                     | Wrong Python version. Use 3.11 or 3.12                                                           |
| Chat page loads but gives no reply                 | Check the backend is running and `frontend/.env` exists. Restart `npm run dev` after creating it |
| Browser shows a CORS error                         | Open the app at `http://localhost:5173` or `http://127.0.0.1:5173`                               |
| `Could not reach the server` from `test_client.py` | Start `python inference_server.py` first                                                         |
| Model download is slow or fails                    | Check your connection, then restart the server. The download resumes                             |

## Known limitations

The model is trained on only about 100 examples, so it reproduces its training answers well but generalises poorly to questions it has not seen. For unfamiliar questions it tends to return a related but off-topic line. This is expected for a prototype of this size.
