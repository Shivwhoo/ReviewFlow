import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db/mongoose";
import Business from "@/lib/db/models/Business";
import ReviewScan from "@/lib/db/models/ReviewScan";
import User from "@/lib/db/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    await dbConnect();
    const business = await Business.findOne({ userId: session.user.id }).lean();
    if (!business) {
      return NextResponse.json({
        totalScans: 0,
        conversions: 0,
        conversionRate: 0,
        creditsUsed: 0,
        dailyScans: [],
        tagFrequency: [],
        ratingDistribution: [],
      });
    }

    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const scans = await ReviewScan.find({
      businessId: business._id,
      createdAt: { $gte: startDate },
    }).lean();

    const totalScans = scans.length;
    const conversions = scans.filter((s) => s.googleOpenedAt).length;
    const conversionRate =
      totalScans > 0 ? Math.round((conversions / totalScans) * 100) : 0;

    // Daily scans aggregation
    const dailyMap = new Map<string, { scans: number; conversions: number }>();
    scans.forEach((scan) => {
      const date = new Date(scan.createdAt).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      });
      const existing = dailyMap.get(date) || { scans: 0, conversions: 0 };
      existing.scans++;
      if (scan.googleOpenedAt) existing.conversions++;
      dailyMap.set(date, existing);
    });

    const dailyScans = Array.from(dailyMap.entries()).map(
      ([date, { scans, conversions }]) => ({
        date,
        scans,
        conversions,
      })
    );

    // Tag frequency
    const tagMap = new Map<string, number>();
    scans.forEach((scan) => {
      scan.tagsSelected.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });
    const tagFrequency = Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    // Rating distribution
    const ratingMap = new Map<number, number>();
    scans.forEach((scan) => {
      ratingMap.set(scan.rating, (ratingMap.get(scan.rating) || 0) + 1);
    });
    const ratingDistribution = [5, 4, 3, 2, 1].map((r) => ({
      name: `${r} ★`,
      value: ratingMap.get(r) || 0,
    }));

    // Credits used
    const user = await User.findById(session.user.id).lean();

    return NextResponse.json({
      totalScans,
      conversions,
      conversionRate,
      creditsUsed: user?.creditsUsedThisMonth || 0,
      dailyScans,
      tagFrequency,
      ratingDistribution,
    });
  } catch (error) {
    console.error("[GET /api/business/analytics]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
