import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import DemoPreview from "@/components/landing/DemoPreview";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-0/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">R</span>
            </div>
            <span className="font-bold text-white text-lg">ReviewFlow</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-sm text-white/50">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How it Works
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Demo
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signin"
              className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16" />

      {/* Page Sections */}
      <Hero />
      <HowItWorks />
      <DemoPreview />
      <Pricing />
      <FAQ />

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">R</span>
            </div>
            <span className="text-sm font-semibold text-white/60">
              ReviewFlow AI
            </span>
          </div>
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} ReviewFlow AI. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white/50 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white/50 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
