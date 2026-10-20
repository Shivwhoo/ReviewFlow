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
    <div className="reviewflow-theme min-h-dvh flex flex-col justify-between">
      <div>
        {/* Navigation */}
        <nav className="landing-nav fixed top-0 left-0 right-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-[68px]">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#B0102F] border-2 border-[#2B0E14] shadow-[2px_2px_0_#2B0E14]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z"
                    fill="#C8F04D"
                  />
                </svg>
              </span>
              <span className="font-wordmark text-2xl font-extrabold tracking-tight text-[#2B0E14]">
                ReviewFlow
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/signin"
                className="font-nav-link text-[16px] font-semibold text-[#2B0E14] underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                Sign In
              </Link>
              <Link
                href="/signin"
                className="landing-nav-cta"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Spacer for fixed nav */}
        <div className="h-[68px]" />

        <Pricing />
      </div>

      {/* Footer */}
      <footer className="landing-footer py-10 px-4 sm:px-8 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-wordmark text-lg font-bold text-[#FFE4D2]">
              ReviewFlow AI
            </span>
          </div>
          <p className="font-body text-xs text-[#FFE4D2]/70">
            © {new Date().getFullYear()} ReviewFlow AI. All rights reserved.
          </p>
          <div className="flex gap-4 font-body text-xs">
            <Link href="/" className="text-[#FFE4D2] hover:text-[#C8F04D]">
              ← Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
