import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import User from "@/lib/db/models/User";
import Business from "@/lib/db/models/Business";
import QRCode from "@/lib/db/models/QRCode";
import redis from "@/lib/redis/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const users = await User.find().sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      users.map(async (user) => {
        const business = await Business.findOne({ userId: user._id }).lean();
        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          subscriptionTier: user.subscriptionTier,
          creditsUsedThisMonth: user.creditsUsedThisMonth,
          role: user.role,
          businessName: business?.name,
          isActive: business?.isActive ?? true,
          createdAt: user.createdAt,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[GET /api/admin/businesses]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, action, subscriptionTier } = await request.json();

    await dbConnect();

    if (action === "suspend" || action === "unsuspend") {
      // Update business active state
      await Business.updateMany(
        { userId: id },
        { isActive: action === "unsuspend" }
      );

      // Fetch user's businesses
      const businesses = await Business.find({ userId: id }).lean();
      const businessIds = businesses.map((b) => b._id);

      // Find all QRCodes assigned to these businesses
      const qrCodes = await QRCode.find({
        assignedToBusinessId: { $in: businessIds },
      }).lean();

      // Clear the Redis cache for each QR code to force a DB refetch
      for (const qrCode of qrCodes) {
        await redis.del(`qr:${qrCode.qrId}`);
      }
    } else if (action === "reset-credits") {
      await User.updateOne({ _id: id }, { creditsUsedThisMonth: 0 });
    } else if (action === "update-tier") {
      await User.updateOne({ _id: id }, { subscriptionTier });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/admin/businesses]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
