from pathlib import Path

from datasets import load_dataset, concatenate_datasets
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, Trainer, TrainingArguments

MODEL_NAME = "google/flan-t5-small"
OUTPUT_DIR = "./my-sacred-model"
DATA_FILES = [
    "data/emotions_train.json",
    "data/rituals_train.json",
    "data/smalltalk_train.json",
    "data/train.json",
    "data/manipulation_train.json",
]
TACTIC_FILE = "data/manipulation_train.json"
TACTIC_EXTRA_COPIES = 1  # extra passes over the tactic examples so they are not drowned out

for f in DATA_FILES:
    if not Path(f).exists():
        raise FileNotFoundError(f"Missing training data file: {f}")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

parts = [
    load_dataset("json", data_files={"train": f})["train"].select_columns(["input", "output"])
    for f in DATA_FILES
]
dataset = concatenate_datasets(parts)

# Drop exact duplicate (input, output) pairs so they are not over-weighted
seen, keep = set(), []
for i, ex in enumerate(dataset):
    key = (ex["input"], ex["output"])
    if key not in seen:
        seen.add(key)
        keep.append(i)
dataset = dataset.select(keep)
print(f"Training examples after de-duplication: {len(dataset)}")

# Oversample the tactic examples (done after de-duplication on purpose)
tactic_inputs = set(
    load_dataset("json", data_files={"train": TACTIC_FILE})["train"]["input"]
)
tactic_idx = [i for i, ex in enumerate(dataset) if ex["input"] in tactic_inputs]
extra = [dataset.select(tactic_idx) for _ in range(TACTIC_EXTRA_COPIES)]
dataset = concatenate_datasets([dataset] + extra)
print(f"Training examples after tactic oversampling: {len(dataset)}")


def preprocess(batch):
    model_inputs = tokenizer(
        batch["input"],
        max_length=128,
        truncation=True,
        padding="max_length",
    )
    labels = tokenizer(
        text_target=batch["output"],
        max_length=128,
        truncation=True,
        padding="max_length",
    )
    # Ignore padding positions in the loss
    model_inputs["labels"] = [
        [(t if t != tokenizer.pad_token_id else -100) for t in seq]
        for seq in labels["input_ids"]
    ]
    return model_inputs


tokenized = dataset.map(preprocess, batched=True, remove_columns=dataset.column_names)

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=12,
    per_device_train_batch_size=4,
    learning_rate=3e-4,
    save_steps=500,
    save_total_limit=2,
    logging_steps=50,
    report_to="none",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized,
)

trainer.train()
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print(f"Saved model to {OUTPUT_DIR}")