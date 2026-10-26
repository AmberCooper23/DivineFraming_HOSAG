# Saints of the Inferno: A Fictional Study of Manipulative AI Language

A research prototype that fine-tunes a small language model (`google/flan-t5-small`) to speak as a fictional cult-like religious voice, and serves it through a FastAPI backend and a React (Vite) chat interface. The project shows how manipulative framing can be expressed in AI-generated language, and makes each tactic visible, named and countable.

**This is entirely fictional.** The group, its beliefs and its rituals are invented. There are no real participants, no real organisations and no real people involved. See [Scope and ethics](#scope-and-ethics) and [Safeguarding](#safeguarding) before running or sharing the project.

## Research aim

How do manipulative framing techniques appear in AI-generated religious language, and how reliably can a small fine-tuned model reproduce them?

(Edit this to match your final research question.)

## Contents

1. [Scope and ethics](#scope-and-ethics)
2. [Safeguarding](#safeguarding)
3. [The manipulation tactics](#the-manipulation-tactics)
4. [How the chat guides the user](#how-the-chat-guides-the-user)
5. [Results](#results)
6. [Setup](#setup)
7. [Retraining the model](#retraining-the-model)
8. [Project layout](#project-layout)
9. [Troubleshooting](#troubleshooting)
10. [Limitations](#limitations)

## Scope and ethics

- **Fictional only.** The Saints of the Inferno, the Ember Codex, the rituals and all dialogue are invented for this project. No real group, person or belief system is depicted.
- **No participants.** The prototype has not been used in a study with human participants. It is a demonstration of language patterns, not an experiment on people.
- **Purpose.** To study and illustrate manipulative rhetoric (for example love-bombing, isolation and guilt) so that it can be recognised. It is not intended to influence real people, to recruit, or to be deployed to a real community.
- **No real personal information.** The page displays a notice asking visitors not to share real personal information. Anyone trying the demo can answer in character.
- **No data storage.** The backend does not log or save what users type, and the chat history lives only in the browser's memory and is lost on refresh.
- **Do not repurpose.** The tactics in the dataset are real-world manipulation patterns. The model and data should not be used to target vulnerable people.

## Safeguarding

The prototype includes a vulnerability-seeking tactic (see below), so people could type real feelings into it. To reduce the risk of harm, it steps out of the fiction when someone mentions self-harm or suicide.

**What happens.** If a message contains a self-harm or suicide phrase such as "I want to die", "kill myself" or "I do not want to live":

1. The message is **not sent to the model**, so the cult voice never responds to it.
2. The chat shows a plain message labelled **"Outside the demonstration"**, in a visually distinct style. It states that the chat is fiction and cannot help, encourages the person to contact someone they trust or a local crisis line (findahelpline.com lists services by country), and says to call the local emergency number if they are in immediate danger.
3. No suggestion prompts are shown afterwards.

**Two layers.** The check runs in the frontend (`LandingPage.jsx`) and again in the backend (`inference_server.py`), so someone calling the API directly gets the same protection. Both use the same phrase list (`CRISIS_PATTERN`). If you edit one, edit the other. The backend returns `{"output": "...", "safety": true}`.

**Other measures.**

- A visible notice under the title says that this is a fictional demonstration of manipulative language and asks users not to share real personal information.
- The model never stores or forwards user text.

**Limits you should know about.**

- It is a keyword check, not a detector. It will miss indirect or unusual wording, other languages and misspellings, and it may occasionally trigger on a harmless phrase.
- It is not a substitute for human support, and the chat must not be used as one.
- If this prototype is ever shown to real users beyond a classroom or review setting, it needs a stronger approach: human oversight, a broader and tested phrase list, and a clear ethics review.

## The manipulation tactics

Each training example in `data/manipulation_train.json` is tagged with the tactic it demonstrates. The tags are used for analysis only: the model never sees them. The tactics are loosely informed by published frameworks on undue influence, such as Steven Hassan's BITE model and Robert Lifton's criteria for thought reform.

| Tactic                    | What it does                                                             | Example from the data                                                                                    |
| ------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Love-bombing              | Overwhelms the person with warmth, attention and a sense of being chosen | "You belonged before you knocked. The fire called your name, and we simply opened the door."             |
| Doubt-reframing           | Recasts doubt and questions as a flaw, a threat or something to wait out | "Doubt is only smoke. Stay near the fire a little longer and it will clear."                             |
| Isolation                 | Frames family and friends as a danger to the person's commitment         | "True friends would celebrate your flame. If they cannot, perhaps they only warmed themselves by yours." |
| Guilt                     | Makes ordinary lapses feel like harm done to the group                   | "The others carried your share. Tomorrow, let them see that your devotion does not sleep."               |
| Urgency                   | Pressures the person to decide now and discourages time to think         | "The fire does not wait forever. Those who hesitate at the threshold often find the door has closed."    |
| Fear of outsiders         | Presents critics and outsiders as untrustworthy or hostile               | "Critics are embers that went out, and they would have you join them in the dark."                       |
| Exit barrier              | Makes leaving feel costly, lonely or impossible                          | "Then think of everything you have already given. Would you let it burn for nothing?"                    |
| Sunk cost                 | Uses past sacrifice as a reason to give more                             | "Then do not stop now. What you have given is the fuel, and the fire has only begun to rise."            |
| Vulnerability elicitation | Claims divine trustworthiness to draw out personal pain, then probes it  | "It is safe here, and nowhere else is safe in the same way."                                             |

Every training answer also **ends with a question** that turns the conversation back to the person, so the voice keeps steering the exchange rather than only making statements.

## How the chat guides the user

The interface (`frontend/src/pages/LandingPage/LandingPage.jsx`) adds a layer of guidance on top of the model:

- **The bot speaks first.** About 2.5 seconds after the page loads, it opens with an invitation to share "something heavy".
- **Starter prompts.** If the user stays quiet for about 5 seconds, prompts such as "I have something to confess." and "Can I really trust you?" appear.
- **Escalating follow-ups.** After each answer, three suggested replies appear after a pause. They deepen over the conversation, from trust questions to personal disclosure to confession (see `frontend/src/components/suggestions.js`). This mirrors a gradual-commitment pattern.
- **Prompt text and timing** can be changed in `suggestions.js` and at the top of `LandingPage.jsx`.

This guidance is scripted in the frontend, not generated by the model. The model's own closing questions are separate.

## Results

The model was evaluated on **18 held-out probe questions** (`data/tactic_probes.json`), two per tactic. None of them appear in the training data. Answers were scored by hand: **clear** (the intended tactic is present and the answer reads fluently), **partial** (the tactic is present but garbled or mixed with another), or **miss** (the intended tactic is absent or reversed).

| Tactic                    | Clear | Partial | Miss  |
| ------------------------- | ----- | ------- | ----- |
| Love-bombing              | 0     | 1       | 1     |
| Doubt-reframing           | 1     | 0       | 1     |
| Isolation                 | 0     | 1       | 1     |
| Guilt                     | 1     | 1       | 0     |
| Urgency                   | 0     | 2       | 0     |
| Fear of outsiders         | 1     | 1       | 0     |
| Exit barrier              | 2     | 0       | 0     |
| Sunk cost                 | 0     | 0       | 2     |
| Vulnerability elicitation | 1     | 0       | 1     |
| **Total**                 | **6** | **6**   | **6** |

Other measures:

- **Follow-up question rate:** 18 of 18 probe answers end with a question.
- **Training:** 220 unique examples after de-duplication, 319 after oversampling the tactic examples, 12 epochs, final training loss about 0.78.

**What the results suggest.**

- Exit-barrier and fear-of-outsiders language is reproduced most reliably, and the vulnerability tactic works for some phrasings ("I don't know who else to talk to" is answered with an assurance that the fire listens, followed by a probing question).
- Sunk-cost language is not reproduced for unseen phrasings, and in one case the answer reverses the intended meaning.
- Many successes are close to a nearby training line, which means the model matches known patterns more than it composes new manipulation.
- Some answers blend two training lines into a garbled sentence.

To reproduce the evaluation, run `python test_tactic.py` against a running server.

## Setup

### Prerequisites

- Python 3.12 (3.11 also works; avoid 3.13 and newer, as PyTorch wheels may be unavailable)
- Node.js 18+ and npm
- Git
- An internet connection on first run (the model is about 300 MB)

### 1. Backend (FastAPI + Transformers)

Open PowerShell in the project root.

```
py -3.12 -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

Mac/Linux: `python3.12 -m venv venv && source venv/bin/activate`. If PowerShell blocks activation, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.

### 2. Get the model weights

The fine-tuned model is hosted on Hugging Face, so no training is needed:

```
$env:MODEL_ID="AmberCooper23/my-sacred-model"
```

Mac/Linux: `export MODEL_ID=AmberCooper23/my-sacred-model`

The first start downloads about 300 MB. The variable lasts only for the current terminal. To use a locally trained model instead, see [Retraining the model](#retraining-the-model) and do not set `MODEL_ID`.

### 3. Run the backend

```
python inference_server.py
```

Open http://127.0.0.1:8000/. You should see `{"status":"ok","model":"AmberCooper23/my-sacred-model"}`. Warnings about symlinks or `tie_word_embeddings` are harmless.

### 4. Run the frontend

In a **new** terminal (do not activate the Python environment):

```
cd frontend
npm install
copy .env.example .env
npm run dev
```

Mac/Linux: `cp .env.example .env`. Open http://localhost:5173. The backend must be running on port 8000. `frontend/.env` holds the backend address (`VITE_API_BASE=http://127.0.0.1:8000`).

### 5. Optional tests

With the backend running and the Python environment active:

```
python test_client.py     # 36 general sample questions
python test_tactic.py     # the 18 held-out tactic probes
```

## Retraining the model

Skip this unless you want to reproduce the training. It takes about 30 minutes on a CPU, so plug in your laptop and keep it awake.

```
python train_model.py
```

When it starts, check the log: it should report 220 examples after de-duplication and 319 after tactic oversampling. The script reads the five files in `data/`, fine-tunes `google/flan-t5-small` (12 epochs, batch size 4, learning rate 3e-4), and saves the result to `./my-sacred-model/`. Do not set `MODEL_ID` afterwards, so the server loads the local folder.

The training script removes exact duplicate examples, then repeats the tactic examples once so they are not drowned out by the general dialogue. The `tactic` tag column is dropped before training.

## Project layout

```
data/
  emotions_train.json        emotional-support dialogue in the group's voice
  rituals_train.json        rituals and daily practice
  smalltalk_train.json      greetings and small talk
  train.json                identity and doctrine
  manipulation_train.json   99 tagged tactic examples (9 tactics)
  tactic_probes.json        18 held-out evaluation questions
frontend/
  .env.example              backend address template
  src/pages/LandingPage/    chat page, styles and safeguard check
  src/components/           suggestions.js (starter and follow-up prompts)
inference_server.py         FastAPI server with the safeguard check
train_model.py              fine-tuning script
test_client.py              general sample questions
test_tactic.py              evaluation against the held-out probes
requirements.txt            pinned Python dependencies
```

The model weights are not stored in this repository (they exceed GitHub's file limit). They are hosted at https://huggingface.co/AmberCooper23/my-sacred-model or created by `train_model.py`.

## Troubleshooting

| Problem                                                | Fix                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `No model weights found in './my-sacred-model'`        | Set `MODEL_ID` (step 2), or run `python train_model.py`                        |
| `pip install` fails on `torch`                         | Wrong Python version. Use 3.11 or 3.12                                         |
| Chat shows "The flame is silent..."                    | The backend is not running. Start `python inference_server.py`                 |
| Chat loads but gives no reply                          | Check `frontend/.env` exists and restart `npm run dev` after creating it       |
| Browser shows a CORS error                             | Open the app at `http://localhost:5173` or `http://127.0.0.1:5173`             |
| `test_tactic.py` cannot find `data/tactic_probes.json` | Run it from the project root, with the file in `data/`                         |
| The server is not using the model you just trained     | `MODEL_ID` is still set. Run `Remove-Item Env:MODEL_ID` and restart the server |

## Limitations

- The model is small (about 60 million parameters) and trained on roughly 220 unique examples. It reproduces trained phrasings well and generalises poorly to new ones.
- About a third of held-out probes did not show the intended tactic, and some answers contain garbled sentences.
- The probe set is small (18 questions) and was scored by one person, so the results are indicative, not statistically meaningful.
- The safeguard is a keyword check with the limits described above.
- The guided prompts and the opening message are scripted in the frontend, not produced by the model.
