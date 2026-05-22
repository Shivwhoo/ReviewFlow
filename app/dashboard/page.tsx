"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { QrCode, Eye, MousePointerClick, Sparkles } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

export default function DashboardOverview() {
  const { data: session } = useSession();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/business/analytics?range=30d");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!session,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 mt-1">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Scans"
          value={stats?.totalScans ?? 0}
          icon={Eye}
          trend={{ value: 12, label: "vs last month" }}
          color="from-violet-500 to-indigo-500"
        />
        <StatsCard
          title="Conversions"
          value={stats?.conversions ?? 0}
          icon={MousePointerClick}
          trend={{ value: 8, label: "vs last month" }}
          color="from-emerald-500 to-teal-500"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats?.conversionRate ?? 0}%`}
          icon={Sparkles}
          color="from-fuchsia-500 to-pink-500"
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
          color="from-amber-500 to-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/dashboard/qr"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <QrCode className="w-8 h-8 text-violet-400" />
            <div>
              <p className="text-sm font-medium text-white">Manage QR Codes</p>
              <p className="text-xs text-white/40">Claim or download QR codes</p>
            </div>
          </a>
          <a
            href="/dashboard/analytics"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <Eye className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-white">View Analytics</p>
              <p className="text-xs text-white/40">Charts and insights</p>
            </div>
          </a>
          <a
            href="/dashboard/settings"
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
          >
            <Sparkles className="w-8 h-8 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-white">Business Profile</p>
              <p className="text-xs text-white/40">Manage your settings</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
