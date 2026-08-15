import Groq from "groq-sdk";

class GroqRotator {
  private clients: Groq[] = [];
  private currentIndex = 0;

  constructor() {
    const keysStr = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY;
    if (keysStr && keysStr !== "gsk-placeholder") {
      const keys = keysStr.split(',').map(k => k.trim()).filter(Boolean);
      this.clients = keys.map(apiKey => new Groq({ apiKey }));
    } else {
      console.warn("⚠️ Groq API key(s) not configured. AI generation will use fallback reviews.");
    }
  }

  public get isConfigured() {
    return this.clients.length > 0;
  }

  public async generateChatCompletion(params: any): Promise<any> {
    if (this.clients.length === 0) {
      throw new Error("No Groq clients available");
    }

    let attempts = 0;
    let lastError: any = null;
    const maxAttempts = this.clients.length;

    while (attempts < maxAttempts) {
      const client = this.clients[this.currentIndex];
      // Move to the next client for the next request (or for the next retry if this fails)
      this.currentIndex = (this.currentIndex + 1) % this.clients.length;

      try {
        const completion = await client.chat.completions.create(params);
        return completion;
      } catch (err: any) {
        lastError = err;
        console.warn(`Groq API attempt failed: ${err?.message || "Unknown error"}`);
        // If it's a rate limit (429) or server error, we try the next key
        // We log the attempt and continue to the next client in the loop
        attempts++;
      }
    }
    
    throw lastError || new Error("All Groq API keys failed");
  }
}

export const groqRotator = new GroqRotator();

// Export default null just to satisfy any legacy imports if we missed any, 
// though we will update the main route to use groqRotator.
export default null;
