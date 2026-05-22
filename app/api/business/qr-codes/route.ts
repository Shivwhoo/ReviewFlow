import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import QRCode from "@/lib/db/models/QRCode";
import Business from "@/lib/db/models/Business";
import ReviewScan from "@/lib/db/models/ReviewScan";
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

    return NextResponse.json({ success: true, qrCode });
  } catch (error) {
    console.error("[POST /api/business/qr-codes]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
