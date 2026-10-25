require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { HfInference } = require("@huggingface/inference");

console.log("HF Token loaded:", process.env.HF_TOKEN);

const app = express();
app.use(cors());
app.use(express.json());

const hf = new HfInference(process.env.HF_TOKEN);

app.post("/api/query", async (req, res) => {
  const { input } = req.body;

  try {
    const response = await fetch("http://localhost:8000/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    const data = await response.json();
    res.json({ output: data.output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Local model call failed" });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));
