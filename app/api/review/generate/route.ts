import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import redis from "@/lib/redis/client";
import dbConnect from "@/lib/db/mongoose";
import Business from "@/lib/db/models/Business";
import User, { CREDIT_LIMITS } from "@/lib/db/models/User";
import { groqRotator } from "@/lib/groq/client";
import { buildPrompt, getFallbackReviews } from "@/lib/groq/promptBuilder";
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

    const { success: rateLimitOk, limit, reset, remaining } = await ratelimit.limit(ipHash);
    const rlHeaders = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    };

    if (!rateLimitOk) {
      const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            ...rlHeaders,
            "Retry-After": retryAfter.toString(),
          },
        }
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

    const { businessId, rating, tags, tone, language, userNotes, length } = parsed.data;

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
        const fallback = getFallbackReviews(rating, {
          businessName: business.name,
          tags,
          tone: tone as Tone,
          language: lang as "en" | "hi",
        });
        if (userNotes && userNotes.trim()) {
          fallback[0] = `${fallback[0]} Also, ${userNotes.trim()}.`;
          fallback[1] = `${fallback[1]} Especially ${userNotes.trim()}.`;
        }
        return NextResponse.json(
          { reviews: fallback, cached: false, fallback: true },
          { headers: rlHeaders }
        );
      }
    }

    // Build cache key and check Redis
    let cacheKey = buildCacheKey(
      business.name,
      rating,
      tags,
      tone,
      lang
    );
    if (length) {
      cacheKey += `:len:${length}`;
    }
    if (userNotes && userNotes.trim()) {
      cacheKey += `:notes:${userNotes.trim().toLowerCase().replace(/\s+/g, "_")}`;
    }

    const cached = await redis.get<any>(cacheKey);
    if (cached) {
      let reviewsArray: string[] = [];
      try {
        if (typeof cached === "string") {
          const parsedCached = JSON.parse(cached);
          reviewsArray = Array.isArray(parsedCached) ? parsedCached : [cached, cached];
        } else if (Array.isArray(cached)) {
          reviewsArray = cached;
        } else {
          reviewsArray = [String(cached), String(cached)];
        }
      } catch {
        reviewsArray = [String(cached), String(cached)];
      }
      return NextResponse.json(
        { reviews: reviewsArray, cached: true },
        { headers: rlHeaders }
      );
    }

    // Generate review with Groq
    let reviews: string[] = [];
    let isFallback = false;

    if (groqRotator.isConfigured) {
      try {
        const prompt = buildPrompt({
          businessName: business.name,
          rating,
          tags,
          tone: tone as Tone,
          language: lang as "en" | "hi",
          aiContextPrompt: business.aiContextPrompt || "",
          userNotes,
          length,
        });

        const completion = await groqRotator.generateChatCompletion({
          model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
          messages: [
            { role: "system", content: prompt.system },
            { role: "user", content: prompt.user },
          ],
          temperature: 0.8,
          max_tokens: 2000,
        });

        const content = completion.choices[0]?.message?.content?.trim();
        console.log("[GROQ COMPLETION DETAILS]:", JSON.stringify(completion, null, 2));
        console.log("[GROQ OUTPUT]:", content);
        if (content) {
          const cleanedContent = content.replace(/^```(json)?\n?|\n?```$/gi, '').trim();
          const parsedJson = JSON.parse(cleanedContent);
          if (parsedJson && Array.isArray(parsedJson.reviews) && parsedJson.reviews.length >= 2) {
            reviews = parsedJson.reviews.slice(0, 2);
          }
        }

        if (reviews.length < 2) {
          throw new Error("Invalid reviews count returned from Groq");
        }
      } catch (groqError) {
        console.error("Groq generation failed (falling back to local generator):", groqError);
        reviews = getFallbackReviews(rating, {
          businessName: business.name,
          tags,
          tone: tone as Tone,
          language: lang as "en" | "hi",
        });
        if (userNotes && userNotes.trim()) {
          reviews[0] = `${reviews[0]} Also, ${userNotes.trim()}.`;
          reviews[1] = `${reviews[1]} Especially ${userNotes.trim()}.`;
        }
        isFallback = true;
      }
    } else {
      // Fallback when Groq is not configured
      reviews = getFallbackReviews(rating, {
        businessName: business.name,
        tags,
        tone: tone as Tone,
        language: lang as "en" | "hi",
      });
      if (userNotes && userNotes.trim()) {
        reviews[0] = `${reviews[0]} Also, ${userNotes.trim()}.`;
        reviews[1] = `${reviews[1]} Especially ${userNotes.trim()}.`;
      }
      isFallback = true;
    }

    // Cache in Redis (TTL 1 hour)
    await redis.set(cacheKey, JSON.stringify(reviews), { ex: 3600 });

    // Async: increment credit usage (fire-and-forget)
    if (user) {
      User.updateOne(
        { _id: user._id },
        { $inc: { creditsUsedThisMonth: 1 } }
      ).exec();
    }

    return NextResponse.json(
      { reviews, cached: false, fallback: isFallback },
      { headers: rlHeaders }
    );
  } catch (error) {
    console.error("[/api/review/generate] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate reviews" },
      { status: 500 }
    );
  }
}
