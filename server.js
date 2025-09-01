import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const APP_NAME = process.env.APP_NAME || "YourAI";
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || `You are ${APP_NAME}, a helpful, friendly assistant. Keep answers concise.`;

app.get("/health", (req, res) => res.json({ ok: true, app: APP_NAME }));

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "messages must be an array" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages]
    });

    const reply = completion.choices?.[0]?.message?.content ?? "";
    res.json({ reply, model: completion.model });
  } catch (err) {
    console.error("[/api/chat] error:", err);
    res.status(500).json({ error: err?.message || "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`${APP_NAME} running → http://localhost:${PORT}`);
});
