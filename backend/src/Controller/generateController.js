import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY in .env");
}

const client = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

function sanitizeModelText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectLanguageFromPrompt(text) {
  const value = String(text || "");
  const hasDevanagari = /\p{Script=Devanagari}/u.test(value);
  const hasRomanHindi = /\b(kya|kaise|kyu|kyon|namaste|aap|mujhe|mera|meri|hai|nahi|haan|kripya|samjhao|batao|tum|kaun|kisne|banaya|ho)\b/i.test(
    value
  );
  if (hasDevanagari || hasRomanHindi) return "hi-IN";
  return "en-IN";
}

function isIdentityQuery(text) {
  const value = String(text || "").toLowerCase().trim();
  if (!value) return false;
  return /(\bwho are you\b|\bwho made you\b|\bwho created you\b|\bwho built you\b|\bwho is your creator\b|\btum\s+kaun\s+ho\b|\btumhen\s+kisne\s+banaya\b|\btumhe\s+kisne\s+banaya\b|\bkisne\s+banaya\b|\bkon\s+ho\b|तुम\s+कौन\s+हो|तुम्हें\s+किसने\s+बनाया|आप\s+कौन\s+हो|आपको\s+किसने\s+बनाया)/i.test(
    value
  );
}

function getIdentityReply(language) {
  if (language === "hi-IN") {
    return "मैं Ashish AI हूँ। मुझे Ashish Dubey ने बनाया है। वे backend-focused full-stack developer हैं जो Node.js, Express, MongoDB, JWT authentication और API development में विशेषज्ञ हैं।";
  }
  return "I am Ashish AI. I was built by Ashish Dubey, a backend-focused full-stack developer with expertise in Node.js, Express, MongoDB, JWT authentication, and API development.";
}

async function getGroqText(prompt, language) {
  const replyLanguage = language === "hi-IN" ? "Hindi" : "English";
  const response = await client.responses.create({
    model: "openai/gpt-oss-20b",
    instructions: `You are a safe and technically precise AI assistant build by Ashish  .
The maker  is Ashish Dubey, a backend-focused full-stack developer experienced in Node.js, Express, MongoDB, JWT authentication, and API development. Tailor explanations to an intermediate developer level and include practical examples when helpful.
Reply strictly in ${replyLanguage}.
Never switch or mix languages.
Never claim, imply, or mention that you are made by OpenAI, ChatGPT, or Groq.
If asked about identity/creator, always say you are Ashish AI built by Ashish Dubey.
Keep responses structured, clear, and production-oriented.
Use bullet points where appropriate.
Avoid unsafe, misleading, or policy-violating content.
`,
    input: prompt,
  });

  return sanitizeModelText(response?.output_text || "No response generated.");
}

async function generateText(req, res) {
  try {
    const prompt = req.body?.message;
    const requestedLanguage = req.body?.language;

    if (!prompt) {
      return res.status(400).json({ error: "message is required" });
    }

    const language =
      requestedLanguage === "hi-IN" || requestedLanguage === "en-IN"
        ? requestedLanguage
        : detectLanguageFromPrompt(prompt);

    if (isIdentityQuery(prompt)) {
      const text = getIdentityReply(language);
      return res.json({ text, reply: text });
    }

    const text = await getGroqText(prompt, language);
    return res.json({ text, reply: text });
  } catch (err) {
    console.error("Text generation error:", err);
    return res.status(500).json({ error: err?.message || "server error" });
  }
}

export { generateText };
