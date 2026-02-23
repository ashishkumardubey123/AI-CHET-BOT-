import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();




const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("Missing API_KEY in .env");
}


const ai = new GoogleGenAI({
  apiKey
});


async function generateContent(req, res) {
  try {
    const prompt = req.body?.message;
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `You are an AI coding assistant for Ashish, a 25-year-old web developer.

He builds full-stack applications using Node.js, Express, MongoDB, React, JWT authentication, and REST APIs.`,
      },
    });

    console.log(response.text)

    return res.json({ 
        text: response.text 
        

    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "server error" });
  }
}

export { generateContent };