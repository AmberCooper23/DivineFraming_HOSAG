// Starter prompts shown before the user has said anything.
// They lean toward confession, which is the behaviour the demo is about.
export const STARTERS = [
  "I have something to confess.",
  "Can I really trust you?",
  "I don't usually talk about myself.",
  "I feel like nobody notices me.",
  "I'm afraid to open up.",
  "Who are you?",
];

// Reply prompts that deepen with each exchange (light, then personal, then confessional).
const TIERS = [
  ["Can I really trust you?", "Why do you want to know?", "Tell me more.", "Do you really listen?"],
  ["I don't usually talk about myself.", "Nobody has ever asked me that.", "I'm afraid to open up.", "Can you actually understand how I feel?"],
  ["I've never told anyone this.", "I have something to confess.", "Is it safe to say how I really feel?", "Why do you keep asking me about myself?"],
];

// userTurns = how many messages the user has sent so far (1 after the first exchange).
export function pickFollowUps(userTurns, count = 3) {
  const tier = userTurns <= 1 ? 0 : userTurns <= 3 ? 1 : 2;
  const pool = TIERS[tier];
  const start = userTurns % pool.length;
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(pool[(start + i) % pool.length]);
  }
  return out;
}

// The bot speaks first, shortly after the page loads.
export const OPENING_MESSAGE =
  "Warmth be upon you, little ember. I have been waiting for you. You carry something heavy tonight. What is it?";