export function compileAiContextPrompt(answers: any): string {
  if (!answers) return "";
  const { uniqueFeatures, targetCustomer, popularProducts, compliments, reviewTone, keywords } = answers;
  
  let prompt = `This business is unique because: ${uniqueFeatures || "N/A"}. `;
  prompt += `Their typical customers are: ${targetCustomer || "N/A"}. `;
  if (popularProducts && popularProducts.trim()) {
    prompt += `Their top products/services are: ${popularProducts}. `;
  }
  prompt += `Customers frequently compliment them on: ${compliments || "N/A"}. `;
  
  const toneMap: Record<string, string> = {
    warm: "Warm & Personal",
    professional: "Professional & Concise",
    enthusiastic: "Enthusiastic & Energetic",
  };
  const toneLabel = toneMap[reviewTone] || reviewTone || "Warm & Personal";
  prompt += `The preferred review style/tone is: ${toneLabel}. `;
  
  if (keywords && keywords.trim()) {
    prompt += `Optionally, try to naturally include these keywords/phrases: ${keywords}. `;
  }
  
  return prompt;
}
