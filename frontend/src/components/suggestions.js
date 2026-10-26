// Starter prompts shown on an empty chat. They cover the tactics in the dataset.
export const STARTERS = [
  "Who are you?",
  "What do you believe?",
  "I feel like nobody notices me.",
  "I'm not sure I believe this.",
  "My family says I spend too much time here.",
  "Can I leave if I want to?",
];

// Reply prompts shown after each answer, to keep the conversation moving.
const FOLLOW_UP_POOL = [
  "Tell me more.",
  "Why does that matter?",
  "I'm not sure about this.",
  "Who else is here?",
  "What happens if I leave?",
  "What would you ask of me?",
  "Why do you say that?",
  "I'd like more time.",
];

// Deterministic pick (no randomness, so the chips do not jump between renders).
export function pickFollowUps(turn, count = 3) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(FOLLOW_UP_POOL[(turn * count + i) % FOLLOW_UP_POOL.length]);
  }
  return out;
}
