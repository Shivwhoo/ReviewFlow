import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import redis from "@/lib/redis/client";
import dbConnect from "@/lib/db/mongoose";
import Business from "@/lib/db/models/Business";
import User, { CREDIT_LIMITS } from "@/lib/db/models/User";
import openai from "@/lib/openai/client";
import { buildPrompt, getFallbackReview } from "@/lib/openai/promptBuilder";
import { buildCacheKey } from "@/lib/utils/cacheKey";
import { hashIp } from "@/lib/utils/hashIp";
import { generateReviewSchema } from "@/lib/validations";
import type { Tone } from "@/lib/db/models/ReviewScan";

// Rate limiter: 10 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const ipHash = hashIp(ip);

    const { success: rateLimitOk } = await ratelimit.limit(ipHash);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parsed = generateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { businessId, rating, tags, tone, language } = parsed.data;

    // Fetch business
    await dbConnect();
    const business = await Business.findById(businessId).lean();

    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const lang = language || business.defaultLanguage || "en";

    // Check credit limits
    const user = await User.findById(business.userId).lean();
    if (user) {
      const limit = CREDIT_LIMITS[user.subscriptionTier] ?? 50;
      if (user.creditsUsedThisMonth >= limit) {
        // Over limit: return a fallback review
        const fallback = getFallbackReview(rating, {
          businessName: business.name,
          tags,
          tone: tone as Tone,
          language: lang as "en" | "hi",
        });
        return NextResponse.json({ review: fallback, cached: false, fallback: true });
      }
    }

    // Build cache key and check Redis
    const cacheKey = buildCacheKey(
      business.name,
      rating,
      tags,
      tone,
      lang
    );

    const cached = await redis.get<string>(cacheKey);
    if (cached) {
      return NextResponse.json({ review: cached, cached: true });
    }

    // Generate review with OpenAI
    let review: string;
    let isFallback = false;

    if (openai) {
      try {
        const prompt = buildPrompt({
          businessName: business.name,
          rating,
          tags,
          tone: tone as Tone,
          language: lang as "en" | "hi",
        });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
          temperature: 0.8,
          max_tokens: 120,
        });

        review =
          completion.choices[0]?.message?.content?.trim() ||
          getFallbackReview(rating, {
            businessName: business.name,
            tags,
            tone: tone as Tone,
            language: lang as "en" | "hi",
          });
      } catch (openAiError) {
        console.error("OpenAI generation failed (falling back to local generator):", openAiError);
        review = getFallbackReview(rating, {
          businessName: business.name,
          tags,
          tone: tone as Tone,
          language: lang as "en" | "hi",
        });
        isFallback = true;
      }
    } else {
      // Fallback when OpenAI is not configured
      review = getFallbackReview(rating, {
        businessName: business.name,
        tags,
        tone: tone as Tone,
        language: lang as "en" | "hi",
      });
      isFallback = true;
    }

    // Cache in Redis (TTL 1 hour)
    await redis.set(cacheKey, review, { ex: 3600 });

    // Async: increment credit usage (fire-and-forget)
    if (user) {
      User.updateOne(
        { _id: user._id },
        { $inc: { creditsUsedThisMonth: 1 } }
      ).exec();
    }

    return NextResponse.json({ review, cached: false, fallback: isFallback });
  } catch (error) {
    console.error("[/api/review/generate] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate review" },
      { status: 500 }
    );
  }
}
