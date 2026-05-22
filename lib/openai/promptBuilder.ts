import type { Tone } from "@/lib/db/models/ReviewScan";

interface PromptInput {
  businessName: string;
  rating: number;
  tags: string[];
  tone: Tone;
  language: "en" | "hi";
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

const SYSTEM_MESSAGE = `You write short, authentic Google reviews. Never use spammy phrases like "best ever", "must visit", "hidden gem". Keep it under 60 words. Use the exact rating and tone provided. If rating is low, be polite and constructive. Never mention that you are an AI. Write as a real customer.`;

/**
 * Build the prompt for OpenAI to generate a review.
 */
export function buildPrompt(input: PromptInput): {
  system: string;
  user: string;
} {
  const { businessName, rating, tags, tone, language } = input;

  const examples = language === "hi" ? HINGLISH_EXAMPLES : ENGLISH_EXAMPLES;
  const langLabel = language === "hi" ? "Hinglish" : "English";
  const toneDescription = TONE_DESCRIPTIONS[tone];
  const tagList = tags.length > 0 ? tags.join(", ") : "overall experience";

  const system = `${SYSTEM_MESSAGE}\n\n${examples}`;

  const user = `Write a review for ${businessName}. Rating: ${rating} stars. Focus on these aspects: ${tagList}. Tone: ${toneDescription}. Language: ${langLabel}.`;

  return { system, user };
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
