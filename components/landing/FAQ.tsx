"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-4 py-24 max-w-3xl mx-auto" id="faq">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-white/40 text-lg">
          Everything you need to know about ReviewFlow AI
        </p>
      </motion.div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-5 rounded-xl bg-glass text-left hover:bg-white/[0.06] transition-all"
            >
              <span className="font-medium text-white">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-white/40 shrink-0 transition-transform ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 pt-2 text-white/50 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
