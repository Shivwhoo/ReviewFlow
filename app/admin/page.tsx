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
      <div className="mb-6 sm:mb-8">
        <h1 className="font-wordmark text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
          Admin overview
        </h1>
        <p className="mt-1.5 font-body text-[15px] text-[#17120E]/60">
          Platform-wide statistics
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 min-[480px]:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Businesses"
          value={stats?.totalBusinesses ?? 0}
          icon={Building2}
          color="bg-[#17120E] text-[#FF8A1F]"
        />
        <StatsCard
          title="Total Scans"
          value={stats?.totalScans ?? 0}
          icon={Eye}
          color="bg-[#0B6E4F] text-[#FBF6EC]"
        />
        <StatsCard
          title="AI Generations"
          value={stats?.totalGenerations ?? 0}
          icon={Cpu}
          color="bg-[#FF8A1F] text-[#17120E]"
        />
        <StatsCard
          title="QR Codes"
          value={`${stats?.assignedQRs ?? 0} / ${stats?.totalQRs ?? 0}`}
          icon={QrCode}
          color="bg-[#17120E]/10 text-[#17120E]"
        />
      </div>

      {/* Top Businesses */}
      <div className="rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-12px_#17120E55] sm:p-6">
        <h3 className="mb-4 font-label text-lg font-bold tracking-tight text-[#17120E]">
          Top businesses by scans
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] font-body text-sm">
            <thead>
              <tr className="border-b border-[#17120E]/10">
                <th className="px-2 py-3 text-left font-label text-xs font-semibold text-[#17120E]/55">
                  Business
                </th>
                <th className="px-2 py-3 text-left font-label text-xs font-semibold text-[#17120E]/55">
                  Plan
                </th>
                <th className="px-2 py-3 text-right font-label text-xs font-semibold text-[#17120E]/55">
                  Scans
                </th>
                <th className="px-2 py-3 text-right font-label text-xs font-semibold text-[#17120E]/55">
                  Conversions
                </th>
              </tr>
            </thead>
            <tbody>
              {(stats?.topBusinesses || []).map((biz: any, i: number) => (
                <tr
                  key={i}
                  className="border-b border-[#17120E]/10 transition hover:bg-white"
                >
                  <td className="max-w-[220px] truncate px-2 py-3 font-semibold text-[#17120E]">
                    {biz.name}
                  </td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-[#17120E]/[0.06] px-2.5 py-1 text-xs font-semibold capitalize text-[#17120E]/70">
                      {biz.tier}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right text-[#17120E]/70">
                    {biz.scans}
                  </td>
                  <td className="px-2 py-3 text-right text-[#17120E]/70">
                    {biz.conversions}
                  </td>
                </tr>
              ))}
              {(!stats?.topBusinesses || stats.topBusinesses.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-[#17120E]/50"
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