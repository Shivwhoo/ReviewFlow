import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import DemoPreview from "@/components/landing/DemoPreview";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Link from "next/link";
import { auth } from "@/auth";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#demo", label: "Demo" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

function LogoMark({ size = 32, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl ${
        dark ? "bg-[#FF8A1F]" : "bg-[#17120E]"
      }`}
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6z"
          fill={dark ? "#17120E" : "#FF8A1F"}
        />
      </svg>
    </span>
  );
}

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="reviewflow-theme min-h-dvh w-full overflow-x-hidden bg-[#FBF6EC]">
      {/* Navigation */}
      <nav className="landing-nav fixed left-0 right-0 top-0 z-50 border-b border-[#17120E]/10 bg-[#FBF6EC]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="ReviewFlow home">
            <LogoMark />
            <span className="font-wordmark text-xl font-extrabold tracking-tight text-[#17120E] sm:text-2xl">
              ReviewFlow
            </span>
          </Link>

          <div className="hidden items-center gap-1 font-nav-link text-[15px] font-medium md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="landing-nav-link rounded-full px-4 py-2 text-[#17120E]/75 transition-colors hover:bg-[#17120E]/8 hover:text-[#17120E]"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-[#17120E] px-5 py-2 font-button text-sm font-semibold text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99] transition hover:bg-[#0B6E4F] sm:px-6 sm:text-base flex items-center gap-2"
              >
                <span>Dashboard</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
                  {session.user.name?.split(" ")[0] || "Account"}
                </span>
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="hidden rounded-full px-4 py-2 font-nav-link text-[15px] font-semibold text-[#17120E] transition-colors hover:bg-[#17120E]/8 sm:inline-block"
                >
                  Sign in
                </Link>
                <Link
                  href="/signin"
                  className="rounded-full bg-[#17120E] px-4 py-2 font-button text-sm font-semibold text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99] transition hover:bg-[#0B6E4F] sm:px-6 sm:text-base"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-[68px]" />

      {/* Page Sections */}
      <Hero />
      <HowItWorks />
      <DemoPreview />
      <Pricing />
      <FAQ />

      {/* Footer */}
      <footer className="landing-footer bg-[#17120E] px-4 py-12 text-[#FBF6EC] sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <LogoMark dark />
            <span className="font-wordmark text-xl font-extrabold tracking-tight">ReviewFlow AI</span>
          </div>
          <p className="text-center font-body text-sm text-[#FBF6EC]/65 sm:text-left">
            © {new Date().getFullYear()} ReviewFlow AI. All rights reserved.
          </p>
          <div className="flex gap-6 font-body text-sm">
            <a href="#" className="text-[#FBF6EC]/85 underline underline-offset-4 transition-colors hover:text-[#FF8A1F]">
              Privacy Policy
            </a>
            <a href="#" className="text-[#FBF6EC]/85 underline underline-offset-4 transition-colors hover:text-[#FF8A1F]">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}