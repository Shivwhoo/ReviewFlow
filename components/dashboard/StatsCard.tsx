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
  color?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "from-violet-500 to-fuchsia-500",
}: StatsCardProps) {
  return (
    <div className="bg-glass rounded-2xl p-5 hover:bg-white/[0.06] transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/40 font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-1 ${
                trend.value >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              <span className="text-white/30">{trend.label}</span>
            </p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
