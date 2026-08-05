import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import Business from "@/lib/db/models/Business";
import { buildGoogleReviewUrl } from "@/lib/utils/googleLink";
import { compileAiContextPrompt } from "@/lib/utils/aiContext";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: userId } = await params;

    await dbConnect();
    const business = await Business.findOne({ userId }).lean();
    if (!business) {
      return NextResponse.json({
        name: "",
        googlePlaceId: "",
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
    console.error("[GET /api/admin/businesses/[id]/settings]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: userId } = await params;
    const body = await request.json();

    await dbConnect();
    let business = await Business.findOne({ userId });

    if (!business) {
      // Create business if it doesn't exist
      business = new Business({
        userId,
        name: body.name || "My Business",
        googlePlaceId: body.googlePlaceId || "",
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
      if (body.defaultLanguage !== undefined) business.defaultLanguage = body.defaultLanguage;
      if (body.phoneNumber !== undefined) business.phoneNumber = body.phoneNumber;
    }

    if (body.onboardingAnswers) {
      business.onboardingAnswers = body.onboardingAnswers;
      business.aiContextPrompt = compileAiContextPrompt(body.onboardingAnswers);
    }

    if (typeof body.onboardingCompleted === "boolean") {
      business.onboardingCompleted = body.onboardingCompleted;
    }

    await business.save();
    return NextResponse.json(business);
  } catch (error) {
    console.error("[PUT /api/admin/businesses/[id]/settings]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
