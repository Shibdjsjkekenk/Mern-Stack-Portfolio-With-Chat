import { AIChatSession } from "@/gemini/AIConfig";

export const getAISuggestions = async (chatHistory) => {
  try {
    // ✅ Last 5 messages (limit context)
    const recentMessages = chatHistory.slice(-5).map(
      (m) => `${m.senderId ? "User" : "Admin"}: ${m.text}`
    );

    const prompt = `
You are an AI chat assistant. Based on the recent conversation below, suggest 3-4 helpful or relevant next message ideas that the user might want to send.

Conversation:
${recentMessages.join("\n")}

Return only plain text suggestions, each on a new line, no numbering.
    `;

    const result = await AIChatSession.sendMessage(prompt);
    const response = await result.response.text();

    // Convert Gemini response into array (each suggestion = one line)
    const suggestions = response
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return suggestions;
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return [];
  }
};
