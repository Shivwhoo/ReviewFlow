import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import ReviewScan from "@/lib/db/models/ReviewScan";
import QRCode from "@/lib/db/models/QRCode";
import { trackReviewSchema } from "@/lib/validations";
import { hashIp } from "@/lib/utils/hashIp";
import { buildCacheKey } from "@/lib/utils/cacheKey";
import redis from "@/lib/redis/client";
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = trackReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

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

    await dbConnect();

    // Look up QR code for businessId/locationId if not provided directly
    let businessId = data.businessId;
    let locationId = data.locationId;

    if (!locationId) {
      const qrCode = await QRCode.findOne({ qrId: data.qrId }).lean();
      if (qrCode) {
        locationId = qrCode.assignedToLocationId?.toString();
      }
    }

    const cacheKey = buildCacheKey(
      "", // Business name not needed for tracking cache key
      data.rating,
      data.tags,
      data.tone,
      "en"
    );

    const scan = new ReviewScan({
      qrId: data.qrId,
      businessId,
      locationId: locationId || undefined,
      ipHash,
      rating: data.rating,
      tagsSelected: data.tags,
      tone: data.tone,
      aiPromptKey: cacheKey,
      reviewGenerated: data.reviewGenerated,
      userEdited: data.userEdited,
      copiedAt: data.copiedAt ? new Date(data.copiedAt) : undefined,
      googleOpenedAt: data.googleOpenedAt
        ? new Date(data.googleOpenedAt)
        : undefined,
    });

    await scan.save();

    return NextResponse.json({ success: true, scanId: scan._id }, { headers: rlHeaders });
  } catch (error) {
    console.error("[/api/review/track] Error:", error);
    return NextResponse.json(
      { error: "Failed to track review" },
      { status: 500 }
    );
  }
}
