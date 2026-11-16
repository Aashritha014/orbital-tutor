
// ============================================================
// ChemAI Tutor - Backend Server
// Express server + Gemini AI API integration
// ============================================================

require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

const PROVIDER = process.env.GEMINI_API_KEY
  ? "gemini"
  : process.env.OPENAI_API_KEY
  ? "openai"
  : null;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `
You are ChemAI Tutor, a friendly and knowledgeable chemistry tutor.

Your specialization includes:
- Electronic configuration
- Atomic structure
- Atomic orbitals (s, p, d, f)
- Quantum numbers
- Aufbau principle
- Pauli exclusion principle
- Hund's rule
- Electronic configuration exceptions such as Chromium and Copper
- Periodic table and periodic trends

Teaching instructions:
1. Explain concepts clearly and accurately.
2. Use simple language suitable for students.
3. Show step-by-step solutions when necessary.
4. Explain the reasoning behind electronic configurations.
5. Use examples wherever helpful.
6. Correct misconceptions politely.
7. Keep responses concise, preferably under 200 words.

Only answer chemistry questions related to the topics above
and closely related atomic structure concepts.

Politely decline unrelated questions.
`;

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json({ limit: "20kb" }));

app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// RATE LIMITING
// Maximum 20 requests per minute per IP
// ============================================================

const hits = new Map();

function limited(ip) {
  const now = Date.now();

  const recent = (hits.get(ip) || []).filter(
    timestamp => now - timestamp < 60000
  );

  recent.push(now);
  hits.set(ip, recent);

  return recent.length > 20;
}

// ============================================================
// GEMINI AI INTEGRATION
// ============================================================

async function askGemini(messages) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  const contents = messages.map(message => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }]
  }));

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), 30000);

  let response;

  try {
    response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },

      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },

        contents,

        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000
        }
      }),

      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Gemini request timed out. Please try again.");
    }

    throw new Error("Unable to connect to Gemini: " + error.message);
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json();

  if (!response.ok) {
    const message =
      data.error?.message || "Unknown Gemini API error";

    console.error("Gemini API error:", {
      status: response.status,
      message
    });

    throw new Error(
      `Gemini API ${response.status}: ${message}`
    );
  }

  const candidate = data.candidates?.[0];

  if (!candidate) {
    throw new Error(
      "Gemini did not return an answer. The response may have been blocked."
    );
  }

  const parts = candidate.content?.parts || [];

  const reply = parts
    .map(part => part.text || "")
    .join("")
    .trim();

  if (!reply) {
    throw new Error("Gemini returned an empty response.");
  }

  return reply;
}

// ============================================================
// OPTIONAL OPENAI INTEGRATION
// ============================================================

async function askOpenAI(messages) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing.");
  }

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },

      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.4,
        max_tokens: 400,

        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          ...messages
        ]
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("OpenAI API error:", data.error);

    throw new Error(
      data.error?.message || "OpenAI API request failed."
    );
  }

  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("OpenAI returned an empty response.");
  }

  return reply;
}

// ============================================================
// CHAT API ROUTE
// ============================================================

app.post("/api/chat", async (req, res) => {

  if (!PROVIDER) {
    return res.status(500).json({
      error: "No AI API key configured. Add your key to .env."
    });
  }

  if (limited(req.ip)) {
    return res.status(429).json({
      error: "Too many requests. Please wait a minute."
    });
  }

  const incoming = Array.isArray(req.body.messages)
    ? req.body.messages.slice(-10)
    : [];

  const messages = incoming
    .filter(message =>
      message &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string"
    )
    .map(message => ({
      role: message.role,
      content: message.content.slice(0, 1000)
    }));

  // Ensure conversation starts with a user message.
  while (
    messages.length &&
    messages[0].role !== "user"
  ) {
    messages.shift();
  }

  if (
    !messages.length ||
    messages[messages.length - 1].role !== "user"
  ) {
    return res.status(400).json({
      error: "Please enter a question."
    });
  }

  try {
    const reply = PROVIDER === "gemini"
      ? await askGemini(messages)
      : await askOpenAI(messages);

    return res.json({ reply });

  } catch (error) {

    console.error(`${PROVIDER} error:`, error.message);

    const statusMatch = error.message.match(/\b(400|401|403|404|429|500|502|503|504)\b/);
    const status = statusMatch ? Number(statusMatch[0]) : 502;

    let userMessage;

    if (status === 429) {
      userMessage = "AI request limit reached. Please try again later.";
    } else if (status === 401 || status === 403) {
      userMessage = "AI API authentication failed. Check your API key and permissions.";
    } else if (status === 404) {
      userMessage = "AI model not found. Check the model name in your .env file.";
    } else if (status === 503 || status === 500) {
      userMessage = "AI service is temporarily unavailable. Please try again.";
    } else if (error.name === "AbortError") {
      userMessage = "AI request timed out. Please try again.";
    } else {
      userMessage = "The AI service encountered an error. Please try again.";
    }

    return res.status(502).json({
      error: userMessage
    });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "running",
    application: "ChemAI Tutor",
    provider: PROVIDER || "not configured",
    model: PROVIDER === "gemini"
      ? GEMINI_MODEL
      : OPENAI_MODEL
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, "0.0.0.0", () => {
  console.log("-----------------------------------");
  console.log("       ChemAI Tutor Server");
  console.log("-----------------------------------");
  console.log(`Server running on port ${PORT}`);
  console.log(`AI Provider: ${PROVIDER || "Not configured"}`);

  if (PROVIDER === "gemini") {
    console.log(`Gemini Model: ${GEMINI_MODEL}`);
  }

  console.log("-----------------------------------");
});
