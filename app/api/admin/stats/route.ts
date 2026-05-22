import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import Business from "@/lib/db/models/Business";
import QRCode from "@/lib/db/models/QRCode";
import ReviewScan from "@/lib/db/models/ReviewScan";
import User from "@/lib/db/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const [totalBusinesses, totalScans, totalQRs, assignedQRs, totalUsers] =
      await Promise.all([
        Business.countDocuments(),
        ReviewScan.countDocuments(),
        QRCode.countDocuments(),
        QRCode.countDocuments({ assignedToBusinessId: { $ne: null } }),
        User.countDocuments(),
      ]);

    // Top businesses by scan count
    const topBusinessesAgg = await ReviewScan.aggregate([
      {
        $group: {
          _id: "$businessId",
          scans: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $ifNull: ["$googleOpenedAt", false] }, 1, 0] },
          },
        },
      },
      { $sort: { scans: -1 } },
      { $limit: 10 },
    ]);

    const topBusinesses = await Promise.all(
      topBusinessesAgg.map(async (entry) => {
        const biz = await Business.findById(entry._id).lean();
        const user = biz
          ? await User.findById(biz.userId).lean()
          : null;
        return {
          name: biz?.name || "Unknown",
          tier: user?.subscriptionTier || "free",
          scans: entry.scans,
          conversions: entry.conversions,
        };
      })
    );

    return NextResponse.json({
      totalBusinesses,
      totalScans,
      totalGenerations: totalScans,
      totalQRs,
      assignedQRs,
      totalUsers,
      topBusinesses,
    });
  } catch (error) {
    console.error("[GET /api/admin/stats]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
