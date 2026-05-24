import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import QRCode from "@/lib/db/models/QRCode";
import Business from "@/lib/db/models/Business";
import ReviewScan from "@/lib/db/models/ReviewScan";
import redis from "@/lib/redis/client";
import { Ratelimit } from "@upstash/ratelimit";
import { hashIp } from "@/lib/utils/hashIp";

const claimRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const business = await Business.findOne({ userId: session.user.id }).lean();
    if (!business) {
      return NextResponse.json([]);
    }

    const qrCodes = await QRCode.find({
      assignedToBusinessId: business._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with scan counts
    const enriched = await Promise.all(
      qrCodes.map(async (qr) => {
        const scanCount = await ReviewScan.countDocuments({ qrId: qr.qrId });
        return {
          ...qr,
          qrId: qr.qrId,
          locationName: qr.assignedToLocationId ? "Assigned" : "No location",
          scanCount,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[GET /api/business/qr-codes]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const ipHash = hashIp(ip);

    const { success: rateLimitOk, limit, reset, remaining } = await claimRatelimit.limit(ipHash);
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

    const { qrId, locationId } = await request.json();

    if (!qrId) {
      return NextResponse.json(
        { error: "QR ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const business = await Business.findOne({ userId: session.user.id });
    if (!business) {
      return NextResponse.json(
        { error: "No business found. Please create one in settings." },
        { status: 404 }
      );
    }

    const qrCode = await QRCode.findOne({ qrId });
    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    if (qrCode.assignedToBusinessId) {
      return NextResponse.json(
        { error: "This QR code is already assigned to a business" },
        { status: 409 }
      );
    }

    qrCode.assignedToBusinessId = business._id;
    qrCode.assignedToLocationId = locationId || undefined;
    qrCode.activatedAt = new Date();
    await qrCode.save();

    // Invalidate Redis cache
    await redis.del(`qr:${qrId}`);

    return NextResponse.json({ success: true, qrCode }, { headers: rlHeaders });
  } catch (error) {
    console.error("[POST /api/business/qr-codes]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
