import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import QRCode from "@/lib/db/models/QRCode";
import Business from "@/lib/db/models/Business";
import Location from "@/lib/db/models/Location";
import redis from "@/lib/redis/client";
import { Ratelimit } from "@upstash/ratelimit";
import { hashIp } from "@/lib/utils/hashIp";

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
});

interface QRCacheData {
  businessId: string;
  locationId?: string;
  businessName: string;
  googlePlaceId: string;
  reviewUrl: string;
  locationName?: string;
  logo?: string;
  phoneNumber?: string;
  customTags?: any[];
  defaultLanguage?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qrId = searchParams.get("qrId");

    if (!qrId) {
      return NextResponse.json(
        { error: "qrId parameter is required" },
        { status: 400 }
      );
    }

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

    // Check Redis cache first (24hr TTL)
    const cacheKey = `qr:${qrId}`;
    const cached = await redis.get<QRCacheData>(cacheKey);

    if (cached) {
      return NextResponse.json(cached, { headers: rlHeaders });
    }

    // Fetch from database
    await dbConnect();
    const qrCode = await QRCode.findOne({ qrId }).lean();

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    if (!qrCode.assignedToBusinessId || !qrCode.isActive) {
      return NextResponse.json(
        {
          error: "unassigned",
          message:
            "This QR code has not been activated. Please contact the business.",
        },
        { status: 404 }
      );
    }

    const business = await Business.findById(
      qrCode.assignedToBusinessId
    ).lean();

    if (!business || !business.isActive) {
      return NextResponse.json(
        { error: "Business not found or inactive" },
        { status: 404 }
      );
    }

    let locationName: string | undefined;
    if (qrCode.assignedToLocationId) {
      const location = await Location.findById(
        qrCode.assignedToLocationId
      ).lean();
      if (location) {
        locationName = location.name;
      }
    }

    const data: QRCacheData = {
      businessId: business._id.toString(),
      locationId: qrCode.assignedToLocationId?.toString(),
      businessName: business.name,
      googlePlaceId: business.googlePlaceId,
      reviewUrl: business.reviewUrl,
      locationName,
      logo: business.logo,
      phoneNumber: business.phoneNumber,
      customTags: business.customTags,
      defaultLanguage: business.defaultLanguage || "en",
    };

    // Cache in Redis with 24hr TTL
    await redis.set(cacheKey, JSON.stringify(data), { ex: 86400 });

    return NextResponse.json(data, { headers: rlHeaders });
  } catch (error) {
    console.error("[/api/business/by-qr] Error:", error);
    return NextResponse.json(
      { error: "Failed to look up QR code" },
      { status: 500 }
    );
  }
}
