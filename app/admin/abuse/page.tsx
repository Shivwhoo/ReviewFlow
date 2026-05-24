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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Abuse Monitoring</h1>
        <p className="text-white/40 mt-1">Track rate limits and suspicious activity</p>
      </div>

      {/* Flagged IPs */}
      <div className="bg-glass rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-400" />
          Rate-Limited IPs (Last 24h)
        </h3>
        {!abuseData?.flaggedIPs?.length ? (
          <p className="text-white/30 text-sm py-4 text-center">
            No flagged IPs in the last 24 hours ✓
          </p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 px-3 text-white/40 font-medium">IP Hash</th>
                    <th className="text-right py-2 px-3 text-white/40 font-medium">Requests</th>
                    <th className="text-left py-2 px-3 text-white/40 font-medium">Last Seen</th>
                    <th className="text-right py-2 px-3 text-white/40 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {abuseData.flaggedIPs.map((ip: any, i: number) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2 px-3 font-mono text-xs text-white/60">
                        {ip.hash?.substring(0, 16)}...
                      </td>
                      <td className="py-2 px-3 text-right text-white/50">{ip.count}</td>
                      <td className="py-2 px-3 text-white/50">
                        {new Date(ip.lastSeen).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">
                          <Ban className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="sm:hidden divide-y divide-white/5">
              {abuseData.flaggedIPs.map((ip: any, i: number) => (
                <div key={i} className="py-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-red-400 font-semibold bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-lg">
                      {ip.hash?.substring(0, 12)}...
                    </span>
                    <button className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-white/30 font-bold mb-0.5">
                        Requests
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {ip.count}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-white/30 font-bold mb-0.5">
                        Last Seen
                      </span>
                      <span className="text-white/70">
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
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
        <h4 className="font-medium text-amber-300 mb-2">How abuse detection works</h4>
        <ul className="text-sm text-white/40 space-y-1 list-disc pl-4">
          <li>IPs are hashed using SHA-256 (raw IPs are never stored)</li>
          <li>Rate limiting: 10 requests per 10 seconds per IP hash</li>
          <li>Subscription tier limits: Free (50/mo), Pro (500/mo), Multi-Location (unlimited)</li>
          <li>Suspicious patterns: Same IP generating reviews for multiple businesses</li>
        </ul>
      </div>
    </div>
  );
}
