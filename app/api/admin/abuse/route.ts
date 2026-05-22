import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import ReviewScan from "@/lib/db/models/ReviewScan";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    // Find IPs with high frequency scans in last 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const flaggedIPs = await ReviewScan.aggregate([
      { $match: { createdAt: { $gte: oneDayAgo } } },
      {
        $group: {
          _id: "$ipHash",
          count: { $sum: 1 },
          lastSeen: { $max: "$createdAt" },
          businesses: { $addToSet: "$businessId" },
        },
      },
      { $match: { count: { $gte: 5 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    const formatted = flaggedIPs.map((ip) => ({
      hash: ip._id,
      count: ip.count,
      lastSeen: ip.lastSeen,
      businessCount: ip.businesses.length,
      suspicious: ip.businesses.length > 2,
    }));

    return NextResponse.json({
      flaggedIPs: formatted,
    });
  } catch (error) {
    console.error("[GET /api/admin/abuse]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
