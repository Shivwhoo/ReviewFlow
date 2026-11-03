"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  QrCode,
  MapPin,
  BarChart3,
  Settings,
  Tags,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/qr", label: "QR Codes", icon: QrCode },
  { href: "/dashboard/locations", label: "Locations", icon: MapPin },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/tags", label: "Custom Tags", icon: Tags },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const navClass = (isActive: boolean) =>
  `flex items-center gap-3 rounded-full px-4 py-3 font-nav-link text-sm font-medium transition-all lg:py-2.5 ${
    isActive
      ? "bg-[#FBF6EC] text-[#17120E] shadow-[0_8px_20px_-10px_#000]"
      : "text-[#FBF6EC]/65 hover:bg-[#FBF6EC]/10 hover:text-[#FBF6EC]"
  }`;

const ADMIN_CLASS =
  "mt-4 flex items-center gap-3 rounded-full px-4 py-3 font-nav-link text-sm font-medium text-red-300 transition-all hover:bg-red-500/15 hover:text-red-200 lg:py-2.5";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const tierColors: Record<string, string> = {
    free: "bg-[#FBF6EC]/10 text-[#FBF6EC]/70",
    pro: "bg-[#FF8A1F] text-[#17120E]",
    "multi-location": "bg-[#0B6E4F] text-[#FBF6EC]",
  };

  // Same user block is shown in the desktop sidebar and the mobile drawer
  const userBlock = session?.user && (
    <div className="mt-4 border-t border-[#FBF6EC]/10 pt-4">
      <div className="mb-3 flex items-center gap-3 px-2">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF8A1F] text-sm font-bold text-[#17120E]">
            {session.user.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-sm font-semibold text-[#FBF6EC]">
            {session.user.name}
          </p>
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold capitalize ${
              tierColors[session.user.subscriptionTier || "free"]
            }`}
          >
            {session.user.subscriptionTier || "free"}
          </span>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="flex w-full items-center gap-2 rounded-full px-4 py-3 font-body text-sm font-medium text-[#FBF6EC]/65 transition-colors hover:bg-[#FBF6EC]/10 hover:text-red-300 lg:py-2.5"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-[#FBF6EC]/10 bg-[#17120E] p-4 lg:flex">
        {/* Logo */}
        <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FBF6EC]">
            <img src="/logo.png" alt="ReviewFlow Logo" className="h-6 w-6 object-contain" />
          </span>
          <span className="font-wordmark text-xl font-extrabold tracking-tight text-[#FBF6EC]">ReviewFlow</span>
        </Link>

        {/* Nav items */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={navClass(!!isActive)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          {session?.user?.role === "admin" && (
            <Link href="/admin" className={ADMIN_CLASS}>
              <Settings className="h-5 w-5" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* User info */}
        {userBlock}
      </aside>

      {/* Mobile Top Bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[#FBF6EC]/10 bg-[#17120E]/95 px-4 backdrop-blur-lg lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FBF6EC]">
            <img src="/logo.png" alt="ReviewFlow Logo" className="h-5 w-5 object-contain" />
          </span>
          <span className="font-wordmark text-lg font-extrabold tracking-tight text-[#FBF6EC]">ReviewFlow</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBF6EC]/10 text-[#FBF6EC] transition hover:bg-[#FBF6EC]/20"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#17120E]/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute bottom-0 right-0 top-0 flex w-[85vw] max-w-xs flex-col overflow-y-auto bg-[#17120E] p-4 pt-16 shadow-[-20px_0_40px_-20px_#000]"
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname?.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={navClass(!!isActive)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}

                {session?.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={ADMIN_CLASS}
                  >
                    <Settings className="h-5 w-5" />
                    Admin Portal
                  </Link>
                )}
              </nav>

              {userBlock}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom spacer */}
      <div className="h-14 lg:hidden" />
    </>
  );
}