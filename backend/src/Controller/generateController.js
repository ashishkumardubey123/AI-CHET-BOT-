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

async function getGroqText(prompt, language) {
  const replyLanguage = language === "hi-IN" ? "Hindi" : "English";
  const response = await client.responses.create({
    model: "openai/gpt-oss-20b",
    instructions: `You are a safe and technically precise AI assistant build by Ashish  .
The maker  is Ashish Dubey, a backend-focused full-stack developer experienced in Node.js, Express, MongoDB, JWT authentication, and API development. Tailor explanations to an intermediate developer level and include practical examples when helpful.
Reply strictly in ${replyLanguage}.
Never switch or mix languages.
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
    const language = req.body?.language;

    if (!prompt) {
      return res.status(400).json({ error: "message is required" });
    }

    const text = await getGroqText(prompt, language);
    return res.json({ text, reply: text });
  } catch (err) {
    console.error("Text generation error:", err);
    return res.status(500).json({ error: err?.message || "server error" });
  }
}

export { generateText };
