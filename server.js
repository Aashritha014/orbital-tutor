// Orbital Tutor server: serves the web app and proxies chat requests to an AI provider.
// Set GEMINI_API_KEY (free tier available) or OPENAI_API_KEY in your .env file.
// The key stays on the server and never reaches the browser.
require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PROVIDER = process.env.GEMINI_API_KEY ? "gemini" : process.env.OPENAI_API_KEY ? "openai" : null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT =
  "You are a friendly chemistry tutor for students learning electronic configuration: orbitals (s, p, d, f), " +
  "quantum numbers, the Aufbau principle, Pauli exclusion principle, Hund's rule, exceptions such as Cr and Cu, " +
  "and the periodic table. Answer only questions about this topic and closely related atomic structure; " +
  "politely decline anything else. Be accurate, clear and encouraging. Keep answers under 150 words, " +
  "in plain text without markdown.";

app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

// Simple in-memory rate limit: 20 requests per minute per IP.
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
}

async function askGemini(messages) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 1000 },
      }),
    }
  );
  const data = await r.json();
  if (!r.ok) throw new Error((data.error && data.error.message) || "Gemini error");
  const parts = (data.candidates && data.candidates[0] && data.candidates[0].content.parts) || [];
  return parts.map((p) => p.text || "").join("").trim();
}

async function askOpenAI(messages) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      max_tokens: 400,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error((data.error && data.error.message) || "OpenAI error");
  return data.choices[0].message.content.trim();
}

app.post("/api/chat", async (req, res) => {
  if (!PROVIDER) {
    return res.status(500).json({ error: "No API key set. Add GEMINI_API_KEY or OPENAI_API_KEY to your .env file and restart the server." });
  }
  if (limited(req.ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a minute and try again." });
  }

  const incoming = Array.isArray(req.body.messages) ? req.body.messages.slice(-10) : [];
  let messages = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Send a question to get an answer." });
  }

  try {
    const reply = PROVIDER === "gemini" ? await askGemini(messages) : await askOpenAI(messages);
    res.json({ reply: reply || "Sorry, I couldn't produce an answer. Please try rephrasing." });
  } catch (err) {
    console.error(`${PROVIDER} error:`, err.message);
    const quota = /quota|rate|exhaust|429/i.test(err.message);
    res.status(502).json({
      error: quota
        ? "The AI service is out of quota right now. Wait a bit and try again."
        : "The AI service returned an error. Check your API key and model name.",
    });
  }
});

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Orbital Tutor running on port ${PORT} (AI provider: ${PROVIDER || "none, add a key to .env"})`)
);
