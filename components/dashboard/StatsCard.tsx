import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  // Classes for the icon tile: background + icon color, e.g. "bg-[#17120E] text-[#FF8A1F]"
  color?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "bg-[#17120E] text-[#FF8A1F]",
}: StatsCardProps) {
  return (
    <div className="rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-14px_#17120E55] transition hover:border-[#17120E]/20 hover:bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-label text-sm font-medium text-[#17120E]/60">{title}</p>
          <p className="mt-1.5 truncate font-number text-2xl font-extrabold tracking-tight text-[#17120E] sm:text-3xl">
            {value}
          </p>
          {trend && (
            <p
              className={`mt-1.5 font-body text-xs font-semibold ${
                trend.value >= 0 ? "text-[#0B6E4F]" : "text-red-600"
              }`}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              <span className="font-normal text-[#17120E]/50">{trend.label}</span>
            </p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}