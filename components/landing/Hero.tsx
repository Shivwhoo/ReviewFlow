"use client";

import { motion } from "framer-motion";
import { ArrowRight, QrCode, Sparkles, Star } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-gradient" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-[128px] animate-gradient" style={{ animationDelay: "4s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[200px]" />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8"
      >
        <Sparkles className="w-4 h-4 text-violet-400" />
        <span className="text-sm text-white/70">AI-Powered Google Reviews</span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl sm:text-5xl md:text-7xl font-bold text-center max-w-4xl leading-[1.1] tracking-tight"
      >
        Turn every visit into a{" "}
        <span className="text-gradient">5-star review</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-lg sm:text-xl text-white/50 text-center max-w-2xl leading-relaxed"
      >
        Customers scan your QR code, AI crafts a natural review in seconds, and
        they post it to Google. Effortless. Authentic. Compliant.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3 mt-10"
      >
        <Link
          href="/signin"
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold
            bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500
            text-white transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          href="/r/demo"
          className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold
            bg-white/5 border border-white/10 text-white hover:bg-white/10
            transition-all duration-200"
        >
          <QrCode className="w-5 h-5" />
          Try Demo
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-16 text-center"
      >
        {[
          { value: "10K+", label: "Reviews Generated" },
          { value: "98%", label: "Positive Ratings" },
          { value: "< 30s", label: "Average Time" },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              {stat.value}
            </p>
            <p className="text-sm text-white/40 mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Floating phone mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
        className="mt-16 w-full max-w-sm"
      >
        <div className="relative mx-auto w-[280px] h-[500px] rounded-[2.5rem] bg-gradient-to-b from-surface-100 to-surface-0 border border-white/10 overflow-hidden shadow-2xl glow-violet">
          {/* Phone notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
          {/* Screen content preview */}
          <div className="absolute inset-3 top-8 rounded-2xl bg-gradient-to-b from-[#13132a] to-[#0f0f1a] p-4 flex flex-col items-center gap-4">
            <img src="/logo.png" alt="ReviewFlow Logo" className="w-10 h-10 object-contain mt-4" />
            <p className="text-xs text-white/60">Demo Restaurant</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 ${
                    s <= 4
                      ? "text-lime-400 fill-lime-400"
                      : "text-white/20"
                  }`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              {["Food", "Service", "Ambience"].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="w-full space-y-1.5 mt-2">
              <div className="h-2.5 bg-white/10 rounded w-full" />
              <div className="h-2.5 bg-white/10 rounded w-5/6" />
              <div className="h-2.5 bg-white/10 rounded w-4/6" />
            </div>
            <div className="flex gap-2 w-full mt-auto mb-2">
              <div className="flex-1 h-9 rounded-lg bg-white/90" />
              <div className="flex-1 h-9 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600" />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
