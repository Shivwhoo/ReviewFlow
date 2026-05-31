import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import QRCode from "@/lib/db/models/QRCode";
import Business from "@/lib/db/models/Business";
import redis from "@/lib/redis/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { qrId, businessId } = await request.json();

    if (!qrId) {
      return NextResponse.json(
        { error: "QR ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const qrCode = await QRCode.findOne({ qrId });
    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code not found" },
        { status: 404 }
      );
    }

    if (businessId === null || businessId === "") {
      // Unassign the QR code
      qrCode.assignedToBusinessId = undefined;
      qrCode.assignedToLocationId = undefined;
      qrCode.activatedAt = undefined;
      await qrCode.save();

      // Clear cached redirect data in Redis
      await redis.del(`qr:${qrId}`);

      return NextResponse.json({ success: true, message: "QR Code unassigned successfully", qrCode });
    }

    // Verify target business exists
    const business = await Business.findById(businessId);
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    // Assign the QR code to the business
    qrCode.assignedToBusinessId = business._id;
    qrCode.activatedAt = new Date();
    await qrCode.save();

    // Clear cached redirect data in Redis
    await redis.del(`qr:${qrId}`);

    return NextResponse.json({ success: true, message: "QR Code assigned successfully", qrCode });
  } catch (error) {
    console.error("[POST /api/admin/qr-codes/assign]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
