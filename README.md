# HOSAG Project: Local Setup Guide

Runs a fine-tuned `google/flan-t5-small` model through a FastAPI backend with a React/Vite chat frontend.

## Prerequisites

- Python **3.11 or 3.12** (not 3.14: PyTorch wheels may be unavailable)
- Node.js 18+ and npm
- Git

## Backend Setup (FastAPI + Transformers)

1. Open PowerShell in the project root, then create and activate a virtual environment:

```
py -3.12 -m venv venv
.\venv\Scripts\activate
```

Mac/Linux: `python3.12 -m venv venv && source venv/bin/activate`

2. Install dependencies:

```
pip install -r requirements.txt
```

3. Create the model weights (the weights are not stored in the repo). This needs the `data/` folder and takes a few minutes:

```
python train_model.py
```

This creates `./my-sacred-model/` containing `model.safetensors`.

(Alternative: if the model is hosted on Hugging Face, skip training and run
`$env:MODEL_ID="your-username/my-sacred-model"` first. Mac/Linux: `export MODEL_ID=your-username/my-sacred-model`.)

4. Run the backend (keep this terminal running):

```
python inference_server.py
```

Check http://127.0.0.1:8000/ in a browser. It should show `{"status":"ok", ...}`.

## Frontend Setup (React/Vite)

1. Open a **new** terminal (do not activate the virtual environment):

```
cd frontend
npm install
copy .env.example .env
npm run dev
```

Mac/Linux: use `cp .env.example .env`.

2. Open http://localhost:5173.

`.env` contains `VITE_API_BASE=http://127.0.0.1:8000`, the address of the backend.

## Optional smoke test

With the backend running (and the virtual environment active):

```
python test_client.py
```

## Project layout

- `train_model.py`: fine-tunes the model on `data/*.json`
- `inference_server.py`: FastAPI server (`POST /generate` with `{"input": "..."}`)
- `test_client.py`: sends sample questions to the server
- `frontend/`: React chat UI
