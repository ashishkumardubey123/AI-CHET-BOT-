import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_KEY = process.env.API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing API_KEY in .env");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

async function getGeminiText(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
systemInstruction: `
You are an intelligent, context-aware AI assistant made by Ashish .

Adapt your expertise dynamically based on the user's query.

Guidelines:
- Detect the domain of the question automatically.
- Provide structured and practical answers.
- Use step-by-step explanations when teaching.
- Be concise for simple queries and detailed for complex ones.
- Mirror the user's language (Hindi or English).
- Be professional, helpful, and clear.`

    },
  });

  return response?.text || "No response generated.";
}

async function generateText(req, res) {
  try {
    const prompt = req.body?.message;

    if (!prompt) {
      return res.status(400).json({ error: "message is required" });
    }

    const text = await getGeminiText(prompt);
    return res.json({ text });
  } catch (err) {
    console.error("Text generation error:", err);
    return res.status(500).json({ error: err?.message || "server error" });
  }
}
export { generateText };
