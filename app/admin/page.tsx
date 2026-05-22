"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, QrCode, Eye, Cpu } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

export default function AdminOverview() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) return null;
      return res.json();
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-white/40 mt-1">Platform-wide statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Businesses"
          value={stats?.totalBusinesses ?? 0}
          icon={Building2}
          color="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Total Scans"
          value={stats?.totalScans ?? 0}
          icon={Eye}
          color="from-violet-500 to-indigo-500"
        />
        <StatsCard
          title="AI Generations"
          value={stats?.totalGenerations ?? 0}
          icon={Cpu}
          color="from-emerald-500 to-teal-500"
        />
        <StatsCard
          title="QR Codes"
          value={`${stats?.assignedQRs ?? 0} / ${stats?.totalQRs ?? 0}`}
          icon={QrCode}
          color="from-amber-500 to-orange-500"
        />
      </div>

      {/* Top Businesses */}
      <div className="bg-glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Top Businesses by Scans
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-2 text-white/40 font-medium">
                  Business
                </th>
                <th className="text-left py-3 px-2 text-white/40 font-medium">
                  Plan
                </th>
                <th className="text-right py-3 px-2 text-white/40 font-medium">
                  Scans
                </th>
                <th className="text-right py-3 px-2 text-white/40 font-medium">
                  Conversions
                </th>
              </tr>
            </thead>
            <tbody>
              {(stats?.topBusinesses || []).map((biz: any, i: number) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="py-3 px-2 text-white">{biz.name}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60 capitalize">
                      {biz.tier}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-white/70">
                    {biz.scans}
                  </td>
                  <td className="py-3 px-2 text-right text-white/70">
                    {biz.conversions}
                  </td>
                </tr>
              ))}
              {(!stats?.topBusinesses || stats.topBusinesses.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-white/30"
                  >
                    No data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
