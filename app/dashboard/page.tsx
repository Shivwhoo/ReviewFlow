"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { QrCode, Eye, MousePointerClick, Sparkles, Loader2 } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const router = useRouter();

  // Onboarding verification check
  const { data: business, isLoading: businessLoading } = useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const res = await fetch("/api/business/settings");
      if (!res.ok) return null;
      const data = await res.json();
      if (data && !data.onboardingCompleted) {
        router.replace("/dashboard/onboarding");
      }
      return data;
    },
    enabled: !!session,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/business/analytics?range=30d");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!session && !!business?.onboardingCompleted,
  });

  if (businessLoading || (business && !business.onboardingCompleted)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF8A1F]" />
        <p className="animate-pulse font-body text-sm text-[#17120E]/55">Initializing Dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-wordmark text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
          Dashboard
        </h1>
        <p className="mt-1.5 font-body text-[15px] text-[#17120E]/60">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 lg:mb-8 lg:grid-cols-4">
        <StatsCard
          title="Total Scans"
          value={stats?.totalScans ?? 0}
          icon={Eye}
          trend={{ value: 12, label: "vs last month" }}
          color="bg-[#17120E] text-[#FF8A1F]"
        />
        <StatsCard
          title="Conversions"
          value={stats?.conversions ?? 0}
          icon={MousePointerClick}
          trend={{ value: 8, label: "vs last month" }}
          color="bg-[#0B6E4F] text-[#FBF6EC]"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats?.conversionRate ?? 0}%`}
          icon={Sparkles}
          color="bg-[#FF8A1F] text-[#17120E]"
        />
        <StatsCard
          title="AI Credits Used"
          value={`${stats?.creditsUsed ?? 0} / ${
            session?.user?.subscriptionTier === "multi-location"
              ? "∞"
              : session?.user?.subscriptionTier === "pro"
              ? "500"
              : "50"
          }`}
          icon={QrCode}
          color="bg-[#17120E]/10 text-[#17120E]"
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-12px_#17120E55] sm:p-6">
        <h2 className="mb-4 font-label text-lg font-bold tracking-tight text-[#17120E]">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href="/dashboard/qr"
            className="flex items-center gap-3 rounded-2xl border border-[#17120E]/10 bg-[#FBF6EC] p-4 transition hover:border-[#17120E]/30 hover:bg-white"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#17120E] text-[#FF8A1F]">
              <QrCode className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-label text-sm font-bold text-[#17120E]">Manage QR Codes</p>
              <p className="font-body text-xs text-[#17120E]/55">Claim or download QR codes</p>
            </div>
          </a>
          <a
            href="/dashboard/analytics"
            className="flex items-center gap-3 rounded-2xl border border-[#17120E]/10 bg-[#FBF6EC] p-4 transition hover:border-[#17120E]/30 hover:bg-white"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B6E4F] text-[#FBF6EC]">
              <Eye className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-label text-sm font-bold text-[#17120E]">View Analytics</p>
              <p className="font-body text-xs text-[#17120E]/55">Charts and insights</p>
            </div>
          </a>
          <a
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-2xl border border-[#17120E]/10 bg-[#FBF6EC] p-4 transition hover:border-[#17120E]/30 hover:bg-white"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF8A1F] text-[#17120E]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-label text-sm font-bold text-[#17120E]">Business Profile</p>
              <p className="font-body text-xs text-[#17120E]/55">Manage your settings</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}