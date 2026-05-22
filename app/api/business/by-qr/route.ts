import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongoose";
import QRCode from "@/lib/db/models/QRCode";
import Business from "@/lib/db/models/Business";
import Location from "@/lib/db/models/Location";
import redis from "@/lib/redis/client";

interface QRCacheData {
  businessId: string;
  locationId?: string;
  businessName: string;
  googlePlaceId: string;
  reviewUrl: string;
  locationName?: string;
  logo?: string;
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

    // Check Redis cache first (24hr TTL)
    const cacheKey = `qr:${qrId}`;
    const cached = await redis.get<QRCacheData>(cacheKey);

    if (cached) {
      return NextResponse.json(cached);
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
    };

    // Cache in Redis with 24hr TTL
    await redis.set(cacheKey, JSON.stringify(data), { ex: 86400 });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/business/by-qr] Error:", error);
    return NextResponse.json(
      { error: "Failed to look up QR code" },
      { status: 500 }
    );
  }
}
