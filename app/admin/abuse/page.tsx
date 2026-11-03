"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, Ban } from "lucide-react";

export default function AbusePage() {
  const { data: abuseData } = useQuery({
    queryKey: ["admin-abuse"],
    queryFn: async () => {
      const res = await fetch("/api/admin/abuse");
      if (!res.ok) return { flaggedIPs: [], suspiciousScans: [] };
      return res.json();
    },
  });

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-wordmark text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
          Abuse monitoring
        </h1>
        <p className="mt-1.5 font-body text-[15px] text-[#17120E]/60">
          Track rate limits and suspicious activity
        </p>
      </div>

      {/* Flagged IPs */}
      <div className="mb-6 rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-12px_#17120E55] sm:p-6">
        <h3 className="mb-4 flex items-center gap-3 font-label text-lg font-bold tracking-tight text-[#17120E]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-500/10">
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </span>
          Rate-limited IPs (last 24h)
        </h3>
        {!abuseData?.flaggedIPs?.length ? (
          <p
            role="status"
            className="rounded-2xl bg-[#0B6E4F]/10 px-4 py-6 text-center font-body text-sm font-semibold text-[#0B6E4F]"
          >
            No flagged IPs in the last 24 hours ✓
          </p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full font-body text-sm">
                <thead>
                  <tr className="border-b border-[#17120E]/10">
                    <th className="px-3 py-2.5 text-left font-label text-xs font-semibold text-[#17120E]/55">IP hash</th>
                    <th className="px-3 py-2.5 text-right font-label text-xs font-semibold text-[#17120E]/55">Requests</th>
                    <th className="px-3 py-2.5 text-left font-label text-xs font-semibold text-[#17120E]/55">Last seen</th>
                    <th className="px-3 py-2.5 text-right font-label text-xs font-semibold text-[#17120E]/55">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {abuseData.flaggedIPs.map((ip: any, i: number) => (
                    <tr key={i} className="border-b border-[#17120E]/10 transition hover:bg-white">
                      <td className="px-3 py-2.5 font-mono text-xs text-[#17120E]/70">
                        {ip.hash?.substring(0, 16)}...
                      </td>
                      <td className="px-3 py-2.5 text-right text-[#17120E]/70">{ip.count}</td>
                      <td className="px-3 py-2.5 text-[#17120E]/70">
                        {new Date(ip.lastSeen).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          aria-label={`Ban IP ${ip.hash?.substring(0, 16)}`}
                          className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="divide-y divide-[#17120E]/10 sm:hidden">
              {abuseData.flaggedIPs.map((ip: any, i: number) => (
                <div key={i} className="space-y-3 py-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate rounded-full bg-red-500/10 px-3 py-1 font-mono text-xs font-semibold text-red-600">
                      {ip.hash?.substring(0, 12)}...
                    </span>
                    <button
                      aria-label={`Ban IP ${ip.hash?.substring(0, 12)}`}
                      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-red-500/10 hover:text-red-600"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#17120E]/10 bg-[#FBF6EC] p-4 font-body text-xs text-[#17120E]/55">
                    <div>
                      <span className="mb-0.5 block text-xs text-[#17120E]/55">
                        Requests
                      </span>
                      <span className="font-number text-lg font-extrabold text-[#17120E]">
                        {ip.count}
                      </span>
                    </div>
                    <div>
                      <span className="mb-0.5 block text-xs text-[#17120E]/55">
                        Last seen
                      </span>
                      <span className="text-sm font-semibold text-[#17120E]/80">
                        {new Date(ip.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="rounded-3xl border border-[#FF8A1F]/30 bg-[#FF8A1F]/10 p-5 sm:p-6">
        <h4 className="mb-2 font-label text-base font-bold tracking-tight text-[#17120E]">
          How abuse detection works
        </h4>
        <ul className="list-disc space-y-1.5 pl-4 font-body text-sm leading-relaxed text-[#17120E]/65">
          <li>IPs are hashed using SHA-256 (raw IPs are never stored)</li>
          <li>Rate limiting: 10 requests per 10 seconds per IP hash</li>
          <li>Subscription tier limits: Free (50/mo), Pro (500/mo), Multi-Location (unlimited)</li>
          <li>Suspicious patterns: Same IP generating reviews for multiple businesses</li>
        </ul>
      </div>
    </div>
  );
}