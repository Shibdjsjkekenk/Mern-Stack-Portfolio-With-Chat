import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 0.9,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 1024,
  // 👇 Change this from JSON to text (so we can read plain response)
  responseMimeType: "text/plain",
};

// ✅ Exported chat session
export const AIChatSession = model.startChat({
  generationConfig,
  history: [],
});
