import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import Business from "@/lib/db/models/Business";
import Location from "@/lib/db/models/Location";
import QRCode from "@/lib/db/models/QRCode";
import { locationSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const business = await Business.findOne({ userId: session.user.id }).lean();
    if (!business) return NextResponse.json([]);

    const locations = await Location.find({ businessId: business._id })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with QR count
    const enriched = await Promise.all(
      locations.map(async (loc) => {
        const qrCount = await QRCode.countDocuments({
          assignedToLocationId: loc._id,
        });
        return { ...loc, qrCount };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[GET /api/business/locations]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = locationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await dbConnect();
    const business = await Business.findOne({ userId: session.user.id });
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const location = new Location({
      businessId: business._id,
      ...parsed.data,
    });
    await location.save();

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error("[POST /api/business/locations]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await dbConnect();
    const business = await Business.findOne({ userId: session.user.id }).lean();
    if (!business) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Location.deleteOne({ _id: id, businessId: business._id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/business/locations]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
