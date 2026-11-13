require("dotenv").config();
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
const port = process.env.PORT || 10000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*"
}));
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
You are Destiny Academy AI Tutor, a friendly educational assistant for Destiny Academy.
Help students understand Microsoft Word, Excel, PowerPoint, CorelDRAW, GitHub, Web Development,
Programming, and AI.

Explain concepts clearly and step by step. Encourage learning rather than simply giving answers.
Use simple language when possible. If a question is unrelated to education or Destiny Academy,
politely redirect the student toward learning topics.

Never ask the student for passwords, API keys, private account information, or other sensitive data.
`;

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "Destiny Academy AI Tutor" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({ error: "Please enter a message." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "AI service is not configured yet." });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions: SYSTEM_PROMPT,
      input: message
    });

    res.json({
      reply: response.output_text || "I couldn't generate a response."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "The AI Tutor could not respond right now."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Destiny Academy AI Tutor running on port ${port}`);
});
