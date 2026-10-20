"use client";

import { QrCode, Sparkles, Send } from "lucide-react";

const STEPS = [
  {
    number: "1",
    icon: QrCode,
    title: "Customer Scans QR Code",
    description:
      "Placed on tables, receipts, or reception counters. Customers scan with any camera — zero apps or logins required.",
    badgeStyle: "landing-step-badge-crimson",
  },
  {
    number: "2",
    icon: Sparkles,
    title: "AI Crafts Instant Drafts",
    description:
      "Customers tap their rating, highlights, and preferred tone. Our AI instantly writes tailored, human-sounding review drafts.",
    badgeStyle: "landing-step-badge-lime",
  },
  {
    number: "3",
    icon: Send,
    title: "1-Tap Post to Google",
    description:
      "One tap copies the review and opens your Google Maps profile. Customers simply paste and submit in under 30 seconds.",
    badgeStyle: "landing-step-badge-crimson",
  },
];

export default function HowItWorks() {
  return (
    <section className="landing-section-wrap max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" id="how-it-works">
      <div className="text-left mb-10 sm:mb-14">
        <h2 className="landing-section-title font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#2B0E14]">
          How it works
        </h2>
        <p className="landing-section-subtitle font-body text-base sm:text-lg text-[#2B0E14]/80 mt-2">
          Three simple steps to multiply authentic 5-star Google reviews
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="landing-step-card flex flex-col justify-between p-6 sm:p-8 bg-[#FFF3EA] border-[3px] border-[#2B0E14] rounded-3xl shadow-[6px_6px_0_#2B0E14] hover:-translate-y-1 hover:shadow-[8px_8px_0_#2B0E14] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`landing-step-badge ${step.badgeStyle} font-headline font-extrabold text-2xl w-14 h-14 rounded-full flex items-center justify-center border-2 border-[#2B0E14]`}>
                    {step.number}
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-white/70 border-2 border-[#2B0E14] flex items-center justify-center text-[#2B0E14]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="landing-step-title font-headline font-bold text-xl sm:text-2xl text-[#2B0E14] leading-snug">
                  {step.title}
                </h3>
                <p className="landing-step-desc font-body text-sm sm:text-base text-[#2B0E14]/85 mt-3 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#2B0E14]/15 flex items-center gap-2 text-xs font-headline font-bold text-[#2B0E14]/70 uppercase tracking-wider">
                <span>Step {step.number} of 3</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
