"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  QrCode,
  ShieldAlert,
  LogOut,
  ArrowLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/businesses", label: "Businesses", icon: Building2 },
  { href: "/admin/qr-pool", label: "QR Pool", icon: QrCode },
  { href: "/admin/abuse", label: "Abuse", icon: ShieldAlert },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex min-h-dvh bg-surface-0">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-dvh bg-surface-100 border-r border-red-500/10 p-4">
        <Link href="/admin" className="flex items-center gap-2 mb-2 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <span className="font-bold text-white">Admin Portal</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/30 hover:text-white/50 mb-4"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Dashboard
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-red-500/10 text-red-300"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {session?.user && (
          <div className="border-t border-white/5 pt-4 mt-4">
            <p className="text-xs text-white/40 px-2 mb-2">
              {session.user.email}
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-3 py-2 text-sm text-white/40 hover:text-red-400 transition-colors w-full rounded-lg hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile header for admin */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-surface-100/95 backdrop-blur-lg border-b border-red-500/10 flex items-center justify-between px-4">
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mr-2">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <span className="font-bold text-white text-sm">Admin Portal</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 lg:p-8 p-4 pt-18 pb-24 lg:pb-8 lg:pt-8 overflow-auto animate-fadeIn">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface-100/95 backdrop-blur-lg border-t border-red-500/10 flex justify-around items-center px-4 pb-safe shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all ${
                isActive
                  ? "text-red-400 font-bold"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
