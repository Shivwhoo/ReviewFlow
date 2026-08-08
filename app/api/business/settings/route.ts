import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import Business from "@/lib/db/models/Business";
import { buildGoogleReviewUrl } from "@/lib/utils/googleLink";
import { compileAiContextPrompt } from "@/lib/utils/aiContext";
import QRCode from "@/lib/db/models/QRCode";
import redis from "@/lib/redis/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const business = await Business.findOne({ userId: session.user.id }).lean();
    if (!business) {
      return NextResponse.json({
        name: "",
        googlePlaceId: "",
        phoneNumber: "",
        defaultLanguage: "en",
        onboardingCompleted: false,
        onboardingAnswers: {
          uniqueFeatures: "",
          targetCustomer: "",
          popularProducts: "",
          compliments: "",
          reviewTone: "warm",
          keywords: "",
        },
      });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("[GET /api/business/settings]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    await dbConnect();
    let business = await Business.findOne({ userId: session.user.id });

    if (!business) {
      // Create business if it doesn't exist
      business = new Business({
        userId: session.user.id,
        name: body.name || "My Business",
        googlePlaceId: body.googlePlaceId || "",
        phoneNumber: body.phoneNumber || "",
        reviewUrl: body.googlePlaceId
          ? buildGoogleReviewUrl(body.googlePlaceId)
          : "",
        defaultLanguage: body.defaultLanguage || "en",
      });
    } else {
      if (body.name !== undefined) business.name = body.name;
      if (body.googlePlaceId !== undefined) {
        business.googlePlaceId = body.googlePlaceId;
        business.reviewUrl = buildGoogleReviewUrl(body.googlePlaceId);
      }
      if (body.phoneNumber !== undefined) business.phoneNumber = body.phoneNumber;
      if (body.defaultLanguage !== undefined) business.defaultLanguage = body.defaultLanguage;
    }

    if (body.onboardingAnswers) {
      business.onboardingAnswers = body.onboardingAnswers;
      business.aiContextPrompt = compileAiContextPrompt(body.onboardingAnswers);
    }

    if (typeof body.onboardingCompleted === "boolean") {
      business.onboardingCompleted = body.onboardingCompleted;
    }

    await business.save();

    // Invalidate Redis cache for all QR codes assigned to this business
    const qrcodes = await QRCode.find({ assignedToBusinessId: business._id }).lean();
    if (qrcodes.length > 0) {
      const keysToDelete = qrcodes.map(qr => `qr:${qr.qrId}`);
      // Upstash redis supports variadic arguments for del
      await redis.del(...keysToDelete);
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error("[PUT /api/business/settings]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
