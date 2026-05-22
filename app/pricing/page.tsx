import Pricing from "@/components/landing/Pricing";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for ReviewFlow AI. Start free, scale as you grow.",
};

export default function PricingPage() {
  return (
    <div className="min-h-dvh">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-surface-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="font-bold text-white text-lg">ReviewFlow</span>
          </Link>
          <Link
            href="/signin"
            className="text-sm px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/15 transition-all"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <Pricing />
    </div>
  );
}
