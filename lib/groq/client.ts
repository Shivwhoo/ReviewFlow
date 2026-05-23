import Groq from "groq-sdk";

/**
 * Groq SDK client instance.
 * Falls back gracefully to null when API key is not configured.
 */
function createGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "gsk-placeholder") {
    console.warn("⚠️ Groq API key not configured. AI generation will use fallback reviews.");
    return null;
  }

  return new Groq({ apiKey });
}

const groq = createGroqClient();

export default groq;
