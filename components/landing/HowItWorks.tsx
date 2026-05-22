"use client";

import { motion } from "framer-motion";
import { QrCode, Wand2, Send } from "lucide-react";

const STEPS = [
  {
    icon: QrCode,
    title: "Scan QR Code",
    description:
      "Your customer scans the QR code at your location. No app downloads needed.",
    color: "from-violet-500 to-indigo-500",
  },
  {
    icon: Wand2,
    title: "AI Generates Review",
    description:
      "They pick a rating, tags, and tone. Our AI instantly crafts a natural, authentic review.",
    color: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: Send,
    title: "Post to Google",
    description:
      "One tap to copy the review and open Google Maps. They paste and submit — done!",
    color: "from-amber-500 to-orange-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-4 py-24 max-w-6xl mx-auto" id="how-it-works">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          How it works
        </h2>
        <p className="mt-3 text-white/40 text-lg">
          Three simple steps to more Google reviews
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative group"
            >
              <div className="bg-glass rounded-2xl p-8 h-full hover:bg-white/[0.06] transition-all duration-300">
                {/* Step number */}
                <span className="absolute -top-3 -left-1 text-7xl font-black text-white/[0.03]">
                  {i + 1}
                </span>
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-white/40 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {/* Connector line (hidden on last item and mobile) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-white/10" />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
