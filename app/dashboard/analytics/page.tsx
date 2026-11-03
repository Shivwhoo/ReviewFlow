"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// Ratings run 5★ → 1★: green for happy, through amber, to red for unhappy
const COLORS = ["#0B6E4F", "#7BB591", "#F5C26B", "#FF8A1F", "#D64545"];
const DATE_RANGES = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

const INK = "#17120E";
const AXIS_TICK = { fill: "rgba(23,18,14,0.5)", fontSize: 11 };
const TOOLTIP_STYLE = {
  backgroundColor: "#FBF6EC",
  border: "1px solid rgba(23,18,14,0.12)",
  borderRadius: "16px",
  color: INK,
  fontSize: "12px",
  boxShadow: "0 8px 20px -8px rgba(23,18,14,0.35)",
};

const CARD =
  "rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-12px_#17120E55] sm:p-6";

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [range, setRange] = useState("30d");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["business-analytics", range],
    queryFn: async () => {
      const res = await fetch(`/api/business/analytics?range=${range}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!session,
  });

  // Mock data for when API isn't connected yet
  const mockDaily = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en", { month: "short", day: "numeric" }),
    scans: Math.floor(Math.random() * 50) + 10,
    conversions: Math.floor(Math.random() * 30) + 5,
  }));

  const mockTags = [
    { tag: "Food", count: 145 },
    { tag: "Service", count: 120 },
    { tag: "Ambience", count: 78 },
    { tag: "Staff", count: 65 },
    { tag: "Price", count: 42 },
    { tag: "Hygiene", count: 30 },
  ];

  const mockRatings = [
    { name: "5 ★", value: 45 },
    { name: "4 ★", value: 28 },
    { name: "3 ★", value: 15 },
    { name: "2 ★", value: 8 },
    { name: "1 ★", value: 4 },
  ];

  const dailyData = analytics?.dailyScans || mockDaily;
  const tagData = analytics?.tagFrequency || mockTags;
  const ratingData = analytics?.ratingDistribution || mockRatings;

  // Summary numbers derived from the same data the charts use (display only)
  const totalScans = dailyData.reduce((s: number, d: any) => s + (Number(d.scans) || 0), 0);
  const totalConversions = dailyData.reduce((s: number, d: any) => s + (Number(d.conversions) || 0), 0);
  const conversionRate = totalScans > 0 ? Math.round((totalConversions / totalScans) * 100) : 0;
  const topTag = tagData.reduce(
    (best: any, t: any) => (!best || (Number(t.count) || 0) > (Number(best.count) || 0) ? t : best),
    null
  );

  const stats = [
    { label: "Total scans", value: totalScans.toLocaleString(), tone: "bg-[#17120E] text-[#FBF6EC]", sub: "text-[#FBF6EC]/60" },
    { label: "Reviews posted", value: totalConversions.toLocaleString(), tone: "bg-white/70 text-[#17120E] border border-[#17120E]/10", sub: "text-[#17120E]/55" },
    { label: "Conversion rate", value: `${conversionRate}%`, tone: "bg-[#FF8A1F] text-[#17120E]", sub: "text-[#17120E]/65" },
    { label: "Most mentioned", value: topTag?.tag ?? "—", tone: "bg-[#0B6E4F] text-[#FBF6EC]", sub: "text-[#FBF6EC]/65" },
  ];

  return (
    <div className={`transition-opacity ${isLoading ? "opacity-60" : "opacity-100"}`}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-wordmark text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
            Analytics
          </h1>
          <p className="mt-1.5 font-body text-[15px] text-[#17120E]/60">Track your review performance</p>
        </div>
        <div
          className="inline-flex self-start rounded-full border border-[#17120E]/10 bg-[#17120E]/[0.06] p-1 sm:self-auto"
          role="group"
          aria-label="Date range"
        >
          {DATE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              aria-pressed={range === r.value}
              className={`rounded-full px-4 py-1.5 font-button text-sm font-semibold transition-all ${
                range === r.value
                  ? "bg-[#17120E] text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99]"
                  : "text-[#17120E]/60 hover:bg-[#17120E]/8 hover:text-[#17120E]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary tiles */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-3xl p-5 ${s.tone}`}>
            <p className={`font-body text-sm ${s.sub}`}>{s.label}</p>
            <p className="mt-2 truncate font-wordmark text-3xl font-extrabold tracking-tight sm:text-4xl">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Scans vs Conversions */}
      <div className={`${CARD} mb-6`}>
        <h3 className="mb-4 font-label text-base font-bold tracking-tight text-[#17120E]">
          Scans vs conversions
        </h3>
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,18,14,0.08)" />
              <XAxis dataKey="date" tick={AXIS_TICK} axisLine={{ stroke: "rgba(23,18,14,0.12)" }} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "rgba(23,18,14,0.15)" }} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "rgba(23,18,14,0.65)", fontSize: "12px" }}>{value}</span>
                )}
              />
              <Line type="monotone" dataKey="scans" stroke="#FF8A1F" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="conversions" stroke="#0B6E4F" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Tag Frequency */}
        <div className={CARD}>
          <h3 className="mb-4 font-label text-base font-bold tracking-tight text-[#17120E]">
            Tag frequency
          </h3>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <BarChart data={tagData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(23,18,14,0.08)" />
                <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="tag"
                  type="category"
                  tick={{ fill: "rgba(23,18,14,0.75)", fontSize: 12 }}
                  width={70}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(23,18,14,0.05)" }} />
                <Bar dataKey="count" fill="#FF8A1F" radius={[0, 999, 999, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className={CARD}>
          <h3 className="mb-4 font-label text-base font-bold tracking-tight text-[#17120E]">
            Rating distribution
          </h3>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#FBF6EC"
                  strokeWidth={2}
                >
                  {ratingData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "rgba(23,18,14,0.65)", fontSize: "12px" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}