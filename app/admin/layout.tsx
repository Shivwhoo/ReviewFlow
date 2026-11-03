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
    <div className="reviewflow-theme flex min-h-dvh w-full bg-[#FBF6EC] text-[#17120E]">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-[#17120E] p-4 text-[#FBF6EC] lg:flex">
        <Link href="/admin" className="mb-2 flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBF6EC]">
            <span className="font-wordmark text-sm font-extrabold text-[#17120E]">A</span>
          </div>
          <span className="font-wordmark text-lg font-extrabold tracking-tight text-[#FBF6EC]">
            Admin Portal
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="mb-4 flex items-center gap-2 rounded-full px-3 py-2 font-body text-xs text-[#FBF6EC]/55 transition hover:bg-[#FBF6EC]/10 hover:text-[#FBF6EC]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
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
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-full px-4 py-2.5 font-nav-link text-sm transition ${
                  isActive
                    ? "bg-[#FBF6EC] font-semibold text-[#17120E]"
                    : "text-[#FBF6EC]/65 hover:bg-[#FBF6EC]/10 hover:text-[#FBF6EC]"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {session?.user && (
          <div className="mt-4 border-t border-[#FBF6EC]/10 pt-4">
            <p className="mb-2 truncate px-3 font-body text-xs text-[#FBF6EC]/55">
              {session.user.email}
            </p>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full cursor-pointer items-center gap-2 rounded-full px-3 py-2.5 font-button text-sm font-semibold text-[#FBF6EC]/65 transition hover:bg-[#FBF6EC]/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile header for admin */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between bg-[#17120E] px-4 lg:hidden">
        <div className="flex min-w-0 items-center">
          <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FBF6EC]">
            <span className="font-wordmark text-xs font-extrabold text-[#17120E]">A</span>
          </div>
          <span className="truncate font-wordmark text-base font-extrabold tracking-tight text-[#FBF6EC]">
            Admin Portal
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#FBF6EC]/65 transition hover:bg-[#FBF6EC]/10 hover:text-[#FBF6EC]"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          {session?.user && (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              aria-label="Sign out"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#FBF6EC]/65 transition hover:bg-[#FBF6EC]/10 hover:text-red-300"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <main className="min-w-0 flex-1 animate-fadeIn overflow-auto p-4 pb-24 pt-18 lg:p-8 lg:pb-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="pb-safe fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[#FBF6EC]/10 bg-[#17120E] px-4 lg:hidden">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex h-12 w-16 flex-col items-center justify-center rounded-2xl transition ${
                isActive
                  ? "bg-[#FBF6EC] font-bold text-[#17120E]"
                  : "text-[#FBF6EC]/60 hover:text-[#FBF6EC]"
              }`}
            >
              <Icon className="mb-0.5 h-5 w-5" />
              <span className="font-body text-[11px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}