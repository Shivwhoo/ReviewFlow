import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import QRCode from "@/lib/db/models/QRCode";
import generateQRId from "@/lib/qr/generateId";
import { batchQRSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();
    const [total, assigned] = await Promise.all([
      QRCode.countDocuments(),
      QRCode.countDocuments({ assignedToBusinessId: { $ne: null } }),
    ]);

    const qrCodes = await QRCode.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      total,
      assigned,
      unassigned: total - assigned,
      qrCodes,
    });
  } catch (error) {
    console.error("[GET /api/admin/qr-codes/batch]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = batchQRSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { count, printedBatch } = parsed.data;

    await dbConnect();

    const qrDocs = Array.from({ length: count }, () => ({
      qrId: generateQRId(),
      isActive: true,
      printedBatch: printedBatch || undefined,
    }));

    const inserted = await QRCode.insertMany(qrDocs, { ordered: false });

    return NextResponse.json({
      success: true,
      count: inserted.length,
      qrIds: inserted.map((q) => q.qrId),
    });
  } catch (error) {
    console.error("[POST /api/admin/qr-codes/batch]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
