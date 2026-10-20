"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Is this compliant with Google's review policies?",
    answer:
      "Yes! ReviewFlow AI generates review suggestions, but the customer manually copies and posts the review themselves. We never auto-submit reviews to Google. This is fully compliant with Google's Terms of Service.",
  },
  {
    question: "Can customers edit the AI-generated review?",
    answer:
      "Absolutely. The generated review appears in an editable text area. Customers are encouraged to personalize it before posting. We track whether reviews were edited for your analytics.",
  },
  {
    question: "How do the QR codes work?",
    answer:
      "We generate unique QR codes that you can print and place at your business location. When scanned, customers are taken directly to your review page — no app download needed. You can even pre-print QR codes and assign them to locations later.",
  },
  {
    question: "What languages are supported?",
    answer:
      "Currently we support English and Hinglish (Hindi-English mix). More languages are coming soon. The AI adapts its tone and style based on the selected language.",
  },
  {
    question: "How accurate are the AI reviews?",
    answer:
      "Our AI is trained to generate natural, authentic-sounding reviews. We use few-shot examples and careful prompting to avoid spammy language. Reviews are concise (under 60 words) and match the customer's chosen rating and tone.",
  },
  {
    question: "Can I use this for multiple locations?",
    answer:
      "Yes! Our Multi-Location plan supports unlimited locations, each with their own QR codes and analytics. Perfect for restaurant chains and franchise businesses.",
  },
  {
    question: "What happens if I exceed my monthly credits?",
    answer:
      "If you exceed your plan's monthly AI generation limit, we'll serve a generic fallback review. You can always upgrade your plan for more credits. Credits reset on the 1st of each month.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="landing-faq-section py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FFD0B3] border-t-[3px] border-[#2B0E14]" id="faq">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        {/* Left header column */}
        <div className="w-full lg:w-1/3">
          <h2 className="landing-section-title font-headline font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#2B0E14]">
            Frequently asked questions
          </h2>
          <p className="landing-section-subtitle font-body text-base sm:text-lg text-[#2B0E14]/80 mt-3">
            Everything you need to know about ReviewFlow AI and our compliant review flow.
          </p>
        </div>

        {/* Right accordion list column */}
        <div className="w-full lg:w-2/3 flex flex-col gap-3.5">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className="bg-[#FFF3EA] border-[3px] border-[#2B0E14] rounded-2xl overflow-hidden shadow-[4px_4px_0_#2B0E14] transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex items-center justify-between gap-4 w-full p-4 sm:p-5 text-left bg-transparent border-0 cursor-pointer"
                >
                  <span className="font-headline font-bold text-base sm:text-lg text-[#2B0E14] leading-snug">
                    {faq.question}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full border-2 border-[#2B0E14] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "bg-[#C8F04D] rotate-180" : "bg-[#B0102F] text-white"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 text-[#2B0E14]" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-[#2B0E14]/10 text-sm sm:text-base font-body text-[#2B0E14]/85 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
