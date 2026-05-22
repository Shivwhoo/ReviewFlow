import OpenAI from "openai";

/**
 * OpenAI client instance.
 * Falls back gracefully when API key is not configured.
 */
function createOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === "sk-placeholder") {
    console.warn("⚠️ OpenAI API key not configured. AI generation will use fallback reviews.");
    return null;
  }

  return new OpenAI({ apiKey });
}

const openai = createOpenAIClient();

export default openai;
