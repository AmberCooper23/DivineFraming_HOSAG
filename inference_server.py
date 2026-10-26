import os
from pathlib import Path

import torch
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://divineframing.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default: local folder created by train_model.py.
# Or set MODEL_ID to a Hugging Face repo, e.g. MODEL_ID=your-username/my-sacred-model
MODEL_ID = os.getenv("MODEL_ID", "./my-sacred-model")
is_local = Path(MODEL_ID).is_dir()

if is_local:
    weight_files = ["model.safetensors", "pytorch_model.bin"]
    if not any((Path(MODEL_ID) / f).exists() for f in weight_files):
        raise RuntimeError(
            f"No model weights found in '{MODEL_ID}'.\n"
            "Fix: run `python train_model.py` to create them, "
            "or set MODEL_ID to a Hugging Face repo id (see README)."
        )

tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, local_files_only=is_local)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID, local_files_only=is_local)
model.eval()


class Query(BaseModel):
    input: str = ""


@app.get("/")
def health():
    return {"status": "ok", "model": MODEL_ID}


@app.post("/generate")
def generate(query: Query):
    # Match the training data style: trimmed, first letter capitalised
    text = query.input.strip()
    text = text[:1].upper() + text[1:]
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128)

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_length=160,
            min_length=5,
            num_beams=5,
            no_repeat_ngram_size=4,
            early_stopping=True,
        )

    decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return {"output": decoded}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("inference_server:app", host="127.0.0.1", port=8000, reload=False)
