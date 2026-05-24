import type { Tone } from "@/lib/db/models/ReviewScan";

interface PromptInput {
  businessName: string;
  rating: number;
  tags: string[];
  tone: Tone;
  language: "en" | "hi";
  aiContextPrompt?: string;
  userNotes?: string;
  length?: "shorter" | "longer";
}

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  casual: "Casual and friendly, like texting a friend",
  professional: "Professional and measured, like a business review",
  genz: "Gen-Z style with emojis and internet slang",
  short: "Short and crisp, under 20 words",
};

const ENGLISH_EXAMPLES = `Examples of good reviews:

Rating 5, tags Food+Service, tone Casual: "Loved the food here – so fresh! And the staff was super friendly. Will be back."

Rating 5, tags Food+Ambience, tone Gen-Z: "Food absolutely slapped 😭🔥 The vibe was immaculate. Def coming back."

Rating 4, tags Service+Price, tone Professional: "The service was prompt and courteous. Prices are reasonable for the quality. Would recommend."

Rating 2, tags Service, tone Short: "Slow service and our order was wrong. Disappointed."`;

const HINGLISH_EXAMPLES = `Examples of good reviews:

Rating 5, tags Food+Staff, tone Casual: "Khana bahut tasty tha aur staff ne bohot achha care kiya. Pakka wapas aaunga."

Rating 5, tags Ambience, tone Gen-Z: "Ambience kya 🔥 tha. Full Instagram worthy. 10/10 recommend."

Rating 4, tags Food+Price, tone Professional: "Khana achha tha aur prices reasonable hain. Ek baar zaroor try karein."

Rating 2, tags Service, tone Short: "Service bohot slow thi. Order mein galti thi. Disappointing."`;

const SYSTEM_MESSAGE = `Role: Review Generator. Task: Write extremely natural, human Google reviews.
CRITICAL RULES:
1. Flow: Write like talking to a friend. Use contractions (didn't, wasn't, it's). Start sometimes with (Oh, Honestly, So, Well, You know). Use ellipses (...) naturally. Use fragments ("Super fast service").
2. Length:
{length_balance_rules}
- Min: 8 words.
3. No Spam/Robotic: Avoid ("overall experience", "highly recommend", "amazing food, service"). Prefer ("Food was good – staff friendly.", "Yeah, I'd come again. No complaints.").
4. Tags: Integrate tags naturally in a story, never as a list.
5. Ratings:
- 5★: Enthusiastic. Max 1 "!".
- 4★: Positive with polite caveat ("Nice, though a bit slow.").
- 3★: Mixed ("Decent food but slow service.").
- 2★: Mixed/civil ("Room dusty, but staff was at least friendly.").
- 1★: Direct, civil, constructive ("Avoid. Wrong order, though parking was easy.").
6. Gen-Z: Slang (slaps, hits different, vibe, fr). Emojis: 1-2 max (😭🔥✨💯).
7. Professional: Polite, conversational, no slang or corporate letters ("Impressed", "Would recommend").
8. Hinglish Transliteration (CRITICAL): Write ONLY in English/Latin letters. NEVER use Devanagari script (Hindi characters). Transliterate like WhatsApp chat ("Arre, bahut achha tha", "Khana badhiya tha").`;

const PROMPT_EXAMPLES = `EXAMPLES:
1. En-Casual (5⭐, Cafe, tags: Coffee, Staff): "Oh, the coffee here is actually really good. Smooth. And the girl at the counter was super sweet – answered all my dumb questions. Definitely my new spot."
2. En-Short (5⭐, Auto repair, tags: Speed, Price): "Fast, fair price, car runs great. What more do you need?"
3. En-Professional (4⭐, Hospital, tags: Doctor, Wait): "The doctor explained everything clearly, which I appreciated. Wait was about 15 min. Only small issue was front desk could be friendlier."
4. Hinglish-Casual (5⭐, Salon, tags: Haircut, Clean): "Arre, haircut bahut achha kiya stylist ne. Aur salon bilkul clean tha. Honestly, main 2 weeks baad bhi wapas aa raha hoon."
5. GenZ (5⭐, Restaurant, tags: Food, Vibe): "The vibe here is immaculate fr 😭🔥 Pasta slaps so hard. Definitely my new comfort place."
6. Low rating (2⭐, Hotel, tags: Clean, Staff): "Honestly? Room was not clean – like, dust everywhere. But the staff was at least friendly. Won't stay again."`;

/**
 * Minify prompt string by stripping indentation and blank lines to reduce token usage.
 */
function minifyPrompt(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Build the prompt for Groq to generate exactly two distinct reviews in JSON format.
 */
export function buildPrompt(input: PromptInput): {
  system: string;
  user: string;
} {
  const { businessName, rating, tags, tone, language, aiContextPrompt, userNotes, length } = input;

  const isShorter = length === "shorter";
  const lengthRule = isShorter
    ? `- Casual / Professional / Gen-Z: 15–25 words (max 30).
- Short & crisp: 8–15 words (max 18).
- Output brief, single-sentence reviews.`
    : `- Casual / Professional / Gen-Z: 35–55 words (max 60).
- Short & crisp: 15–25 words (max 30).
- Write descriptive, context-rich sentences.`;

  const langLabel = language === "hi" ? "Hinglish (transliterated Hindi WhatsApp style)" : "English";
  const toneDescription = TONE_DESCRIPTIONS[tone];
  const tagList = tags.length > 0 ? tags.join(", ") : "overall experience";

  let system = `${SYSTEM_MESSAGE.replace("{length_balance_rules}", lengthRule)}\n`;
  system += `--- EXAMPLES ---\n${PROMPT_EXAMPLES}\n`;
  system += `--- GENERATION INSTRUCTIONS ---\n`;
  system += `1. Write exactly 2 distinct reviews in ${langLabel} and ${toneDescription}.\n`;
  system += `2. Vary phrasing between Option 1 and Option 2.\n`;
  
  if (aiContextPrompt && aiContextPrompt.trim()) {
    system += `3. CONTEXT: reviews for "${businessName}". Tailor reviews using context: "${aiContextPrompt}"\n`;
  }
  
  if (userNotes && userNotes.trim()) {
    system += `4. NOTES: Customers want to mention: "${userNotes}". Weave this in both options.\n`;
  }
  
  system += `5. RESPONSE FORMAT: Return ONLY a valid JSON object matching:
{
  "reviews": [
    "first review option",
    "second review option"
  ]
}
Do not use markdown wrappers, backticks, or "json" prefixes. Return raw JSON only.`;

  let user = `Generate 2 reviews for ${businessName}. Rating: ${rating}/5. Focus: ${tagList}. Tone: ${toneDescription}. Language: ${langLabel}.`;
  
  if (userNotes && userNotes.trim()) {
    user += ` Note: weave in "${userNotes}".`;
  }

  if (aiContextPrompt && aiContextPrompt.trim()) {
    user += ` Note: align with context "${aiContextPrompt}".`;
  }

  return {
    system: minifyPrompt(system),
    user: minifyPrompt(user),
  };
}

/**
 * Fallback reviews when OpenAI is unavailable.
 * Indexed by rating tier for variety.
 */
const FALLBACK_REVIEWS: Record<number, string[]> = {
  5: [
    "Had an amazing experience here! Everything was top-notch and I'd definitely recommend it to anyone looking for quality.",
    "Really impressed with the quality. The attention to detail was outstanding. Will be coming back for sure!",
    "Exceeded my expectations in every way. Truly a wonderful experience from start to finish.",
  ],
  4: [
    "Great experience overall. A few minor things could be improved but I'd still recommend it.",
    "Really enjoyed my visit. Good quality and friendly atmosphere. Would come back again.",
  ],
  3: [
    "It was okay. Some things were good, others could use improvement. An average experience.",
    "Decent experience but nothing that really stood out. Room for improvement.",
  ],
  2: [
    "Unfortunately, my experience was below expectations. Hope they can work on improving things.",
    "Not the best experience. There were some issues that need to be addressed.",
  ],
  1: [
    "Very disappointing experience. Significant improvements needed across the board.",
    "Would not recommend at this point. Multiple issues made the experience frustrating.",
  ],
};

const LOCAL_TEMPLATES: Record<"en" | "hi", Record<string, Record<number, string[]>>> = {
  en: {
    casual: {
      5: [
        "Absolutely loved my time at {businessName}! The {aspect} was incredible and the staff was extremely friendly. Highly recommended!",
        "Had a great experience at {businessName}. Outstanding {aspect} and overall a super pleasant vibe. Will return soon!",
        "Super happy with {businessName}. The {aspect} was perfect. 10/10 service and experience!",
      ],
      4: [
        "Really good experience at {businessName}. The {aspect} was great and the staff made sure we were well looked after.",
        "Had a nice visit to {businessName}. Good {aspect} and friendly atmosphere. Definitely worth a try!",
      ],
      3: [
        "It was decent. {businessName} has nice {aspect}, but some areas could use a bit of improvement.",
        "Average experience at {businessName}. The {aspect} was okay, but nothing out of the ordinary.",
      ],
      2: [
        "Was quite disappointed with the {aspect} at {businessName}. I hope they can improve this soon.",
        "Not the best visit. The {aspect} wasn't up to the mark. Expecting better from {businessName}.",
      ],
      1: [
        "Extremely disappointed with {businessName}. The {aspect} was terrible and the service was very poor.",
        "Would not recommend {businessName}. Had a bad experience with the {aspect}. Very unsatisfying.",
      ],
    },
    professional: {
      5: [
        "My experience at {businessName} was exceptional. The quality of {aspect} and professional standard exceeded expectations.",
        "Highly recommend {businessName}. Excellent {aspect}, prompt service, and highly professional management.",
      ],
      4: [
        "Very satisfactory service at {businessName}. The {aspect} is highly commendable. I would recommend them.",
        "A reliable establishment. {businessName} provides great {aspect} and professional customer service.",
      ],
      3: [
        "An average experience at {businessName}. The {aspect} was acceptable, though there is room for operational improvement.",
        "Standard service. {businessName} has decent {aspect}, but some aspects could be streamlined.",
      ],
      2: [
        "Below average standard at {businessName}. The {aspect} did not meet expectations. Disappointed with the service.",
        "My visit to {businessName} was suboptimal. The quality of {aspect} requires immediate improvement.",
      ],
      1: [
        "Extremely poor service and standard of {aspect} at {businessName}. Unacceptable and would not recommend under any circumstances.",
        "Highly unprofessional experience. The {aspect} was deficient. Definite room for concern.",
      ],
    },
    genz: {
      5: [
        "omg {businessName} absolutely slayed! 😭🔥 The {aspect} is literally unmatched. Vibe was 10/10 immaculate!",
        "{businessName} is a whole mood! ✨ The {aspect} was top tier and the staff was so sweet. Def coming back!",
      ],
      4: [
        "Pretty solid experience at {businessName}. The {aspect} was super good and the vibes were neat. 💯",
        "ngl {businessName} exceeded expectations. The {aspect} is high-key amazing. Worth the hype!",
      ],
      3: [
        "It was alright. {businessName} has decent {aspect} but nothing too crazy.",
        "Vibes were average. {businessName}'s {aspect} was okay, could be a bit better though.",
      ],
      2: [
        "bro the {aspect} at {businessName} was kinda mid. Not worth the hype tbh. 💀",
        "Disappointed ngl. The {aspect} at {businessName} was not giving what it was supposed to give.",
      ],
      1: [
        "bruh {businessName} is a major skip. ❌ The {aspect} was down bad and the service was zero stars.",
        "Worst experience ever. The {aspect} at {businessName} was pure trash. 😭 Don't go here.",
      ],
    },
    short: {
      5: [
        "Amazing {aspect}! Highly recommend {businessName}!",
        "Excellent experience at {businessName}. 10/10!",
        "Best {aspect} ever. Love this place!",
      ],
      4: [
        "Great {aspect} and solid service.",
        "Really good visit to {businessName}. Recommended.",
      ],
      3: [
        "Decent place, but {aspect} was average.",
        "Okay experience at {businessName}.",
      ],
      2: [
        "Disappointed with {aspect}. Could be better.",
        "Not up to standard. Disappointing visit.",
      ],
      1: [
        "Terrible {aspect}. Do not recommend.",
        "Worst experience. Waste of time.",
      ],
    },
  },
  hi: {
    casual: {
      5: [
        "Maza aa gaya! {businessName} ka {aspect} sach mein bahut badhiya hai. Staff ka behaviour bhi bohot achha tha.",
        "Had a super experience at {businessName}! {aspect} ekdum top notch tha. Har kisi ko ek baar zaroor aana chahiye.",
        "Bohot hi shandar experience raha {businessName} par. {aspect} lajawab tha aur service bhi super fast thi!",
      ],
      4: [
        "Bohot achha experience raha {businessName} mein. {aspect} badhiya tha aur staff ka kaam bhi achha laga.",
        "{businessName} ka {aspect} kaafi achha tha. Friendly atmosphere aur badhiya service.",
      ],
      3: [
        "Theek-thaak experience tha. {businessName} ka {aspect} theek hai, par thoda improvement ho sakta hai.",
        "Average tha. {businessName} ka {aspect} okay-okay laga, par thoda aur achha ho sakta tha.",
      ],
      2: [
        "Khushi nahi hui. {businessName} ka {aspect} bilkul achha nahi tha. Umeed hai ki ye isko sudharenge.",
        "{businessName} mein visit karke maza nahi aaya. Unka {aspect} bilkul average se niche tha.",
      ],
      1: [
        "Bohot hi bekaar experience! {businessName} ka {aspect} bohot kharab tha, bilkul paisa waste.",
        "Main toh bilkul recommend nahi karunga {businessName}. Unka {aspect} bohot bekar tha aur management bilkul zero.",
      ],
    },
    professional: {
      5: [
        "{businessName} par hamara anubhav atyant shandar raha. Wahan ka {aspect} aur shishtachar prashansniya hai.",
        "{businessName} ki gunvatta aur {aspect} utkrisht hai. Main sabhi ko yahan aane ki salah deta hoon.",
      ],
      4: [
        "{businessName} ki sewa se santusht hain. Wahan ka {aspect} aur prabandhan kaafi prashansniya hai.",
        "Uchit mulya aur uttam {aspect}. Yahan ki customer service kaafi behtar hai.",
      ],
      3: [
        "{businessName} par anubhav sadharan raha. Wahan ke {aspect} ko thoda aur behtar banaya ja sakta hai.",
        "Seva sadharan thi. {businessName} mein {aspect} theek tha par sudhaar ki aavashyakta hai.",
      ],
      2: [
        "{businessName} ki sewa hamari apekshaon se kam thi. {aspect} mein sudhaar karne ki zaroorat hai.",
        "{businessName} ka {aspect} achha nahi tha. Management ko is par dhyan dena chahiye.",
      ],
      1: [
        "Atyant nirashajanak! {businessName} ka {aspect} aur prabandhan bilkul apeksha ke anuroop nahi tha. Nirash hue.",
        "Bilkul kharab prabandhan aur {aspect}. {businessName} ko apni sewayen behtar karni chahiye.",
      ],
    },
    genz: {
      5: [
        "bro {businessName} ka {aspect} toh bilkul 🔥 tha! Vibes ekdum top tier standard the. 10/10 recommend!",
        "literally obsessed with {businessName}! Unka {aspect} ekdum next level hai. Immaculate vibes ✨",
      ],
      4: [
        "{businessName} ka {aspect} kaafi badhiya tha. Vibes bhi badhiya the. ✨",
        "ngl {businessName} ne impress kar diya. {aspect} sach mein high-key super good tha. 💯",
      ],
      3: [
        "Okay-ish vibes. {businessName} ka {aspect} average tha, not too bad not too good.",
        "Vibes thode normal the. {businessName} ka {aspect} theek tha but nothing wild.",
      ],
      2: [
        "Bro {businessName} ka {aspect} thoda mid tha. Expectation se kaafi kam. 💀",
        "ngl disappointing tha. {businessName} ka {aspect} was not giving at all.",
      ],
      1: [
        "bruh {businessName} toh bada skip hai. ❌ Unka {aspect} bilkul trash tha. Mat jao yaar.",
        "pure disappointment 😭 {businessName} ka {aspect} bekar tha aur vibes toxic the.",
      ],
    },
    short: {
      5: [
        "Bohot badhiya {aspect}! Highly recommended!",
        "Excellent experience at {businessName}!",
        "Bohot pasand aaya yahan ka {aspect}!",
      ],
      4: [
        "Achha {aspect} aur achhi service.",
        "Really good visit to {businessName}. Worth it.",
      ],
      3: [
        "Theek tha, par {aspect} thoda average tha.",
        "Decent experience at {businessName}.",
      ],
      2: [
        "Nirash hue. {aspect} aur behtar ho sakta tha.",
        "Expected more. Disappointing experience.",
      ],
      1: [
        "Bohot bekar {aspect}. Bilkul mat jao.",
        "Worst experience ever. Waste of money.",
      ],
    },
  },
};

/**
 * Get a fallback review when OpenAI is unavailable.
 */
export function getFallbackReview(
  rating: number,
  options?: {
    businessName?: string;
    tags?: string[];
    tone?: Tone;
    language?: "en" | "hi";
  }
): string {
  const tier = Math.min(5, Math.max(1, Math.round(rating))) as 1 | 2 | 3 | 4 | 5;

  if (options) {
    const businessName = options.businessName || "this place";
    const language = options.language || "en";
    const tone = options.tone || "casual";
    const tags = options.tags || [];

    // Format aspect based on tags
    let aspect = "overall experience";
    if (tags.length > 0) {
      if (tags.length === 1) {
        aspect = tags[0].toLowerCase();
      } else {
        const formattedTags = tags.map((t) => t.toLowerCase());
        const last = formattedTags.pop();
        aspect = `${formattedTags.join(", ")} and ${last}`;
      }
    } else {
      aspect = language === "hi" ? "overall service" : "overall experience";
    }

    const templatesByTone =
      LOCAL_TEMPLATES[language]?.[tone] || LOCAL_TEMPLATES[language]?.["casual"];
    const templates =
      templatesByTone?.[tier] || templatesByTone?.[5] || FALLBACK_REVIEWS[tier];

    const template = templates[Math.floor(Math.random() * templates.length)];
    return template
      .replace(/{businessName}/g, businessName)
      .replace(/{aspect}/g, aspect);
  }

  const reviews = FALLBACK_REVIEWS[tier];
  return reviews[Math.floor(Math.random() * reviews.length)];
}

/**
 * Get two distinct fallback reviews when OpenAI is unavailable.
 */
export function getFallbackReviews(
  rating: number,
  options?: {
    businessName?: string;
    tags?: string[];
    tone?: Tone;
    language?: "en" | "hi";
  }
): [string, string] {
  const tier = Math.min(5, Math.max(1, Math.round(rating))) as 1 | 2 | 3 | 4 | 5;
  const businessName = options?.businessName || "this place";
  const language = options?.language || "en";
  const tone = options?.tone || "casual";
  const tags = options?.tags || [];

  // Format aspect based on tags
  let aspect = "overall experience";
  if (tags.length > 0) {
    if (tags.length === 1) {
      aspect = tags[0].toLowerCase();
    } else {
      const formattedTags = tags.map((t) => t.toLowerCase());
      const last = formattedTags.pop();
      aspect = `${formattedTags.join(", ")} and ${last}`;
    }
  } else {
    aspect = language === "hi" ? "overall service" : "overall experience";
  }

  const templatesByTone =
    LOCAL_TEMPLATES[language]?.[tone] || LOCAL_TEMPLATES[language]?.["casual"];
  const templates =
    templatesByTone?.[tier] || templatesByTone?.[5] || FALLBACK_REVIEWS[tier];

  // Pick two different templates if possible
  let t1 = templates[0];
  let t2 = templates[templates.length - 1];

  if (templates.length > 1) {
    const idx1 = Math.floor(Math.random() * templates.length);
    let idx2 = Math.floor(Math.random() * templates.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * templates.length);
    }
    t1 = templates[idx1];
    t2 = templates[idx2];
  }

  const r1 = t1.replace(/{businessName}/g, businessName).replace(/{aspect}/g, aspect);
  const r2 = t2.replace(/{businessName}/g, businessName).replace(/{aspect}/g, aspect);

  return [r1, r2];
}
