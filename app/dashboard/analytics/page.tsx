"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"];
const DATE_RANGES = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-white/40 mt-1">Track your review performance</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {DATE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                range === r.value
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scans vs Conversions */}
      <div className="bg-glass rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wide">
          Scans vs Conversions
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="scans" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tag Frequency */}
        <div className="bg-glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wide">
            Tag Frequency
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} />
                <YAxis dataKey="tag" type="category" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} width={70} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-glass rounded-2xl p-6">
          <h3 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wide">
            Rating Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {ratingData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
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
