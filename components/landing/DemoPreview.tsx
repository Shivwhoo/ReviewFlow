"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles } from "lucide-react";

const DEMO_REVIEWS: Record<string, string> = {
  "5-casual-food,service":
    "Really loved the food here! Everything was super fresh and flavorful. Our server was attentive and made great recommendations. Definitely coming back soon! 🍽️",
  "5-genz-food,ambience":
    "The food absolutely slapped 😭🔥 Vibes were immaculate fr. The ambience is giving main character energy. 10/10 would come back every day if I could",
  "4-professional-service,price":
    "The service was prompt and courteous throughout our visit. Pricing is reasonable for the quality offered. A solid choice for both casual dining and business meetings.",
  "3-short-food":
    "Food was decent but nothing special. Average experience overall.",
  "5-casual-staff,hygiene":
    "Staff was incredibly friendly and the place was spotless! You can tell they really care about cleanliness. Felt very comfortable dining here. Highly recommend!",
};

const TAGS = ["food", "service", "ambience", "staff", "price", "hygiene"];
const TONES = ["casual", "professional", "genz", "short"];

export default function DemoPreview() {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(["food", "service"]);
  const [tone, setTone] = useState("casual");

  const key = `${rating}-${tone}-${selectedTags.sort().join(",")}`;
  const review =
    DEMO_REVIEWS[key] ||
    DEMO_REVIEWS["5-casual-food,service"] ||
    "Select your rating, tags, and tone to see a preview!";

  return (
    <section className="px-4 py-24 max-w-4xl mx-auto" id="demo">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          See it in action
        </h2>
        <p className="mt-3 text-white/40 text-lg">
          Try our interactive demo — no sign-up needed
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-glass rounded-3xl p-6 sm:p-8 glow-violet"
      >
        {/* Rating */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <p className="text-sm text-white/50 uppercase tracking-wide font-medium">
            Rating
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className="p-0.5 focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    s <= rating
                      ? "text-emerald-400 fill-emerald-400"
                      : "text-white/20"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <p className="text-sm text-white/50 uppercase tracking-wide font-medium">
            Topics
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  )
                }
                className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-white/15 text-white border border-white/30"
                    : "bg-white/5 text-white/40 border border-white/10"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <p className="text-sm text-white/50 uppercase tracking-wide font-medium">
            Tone
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-3 py-1.5 rounded-full text-sm capitalize transition-all ${
                  tone === t
                    ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-white border border-violet-400/40"
                    : "bg-white/5 text-white/40 border border-white/10"
                }`}
              >
                {t === "genz" ? "Gen-Z" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Generated Preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white/5 rounded-xl p-5 border border-white/10"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-violet-400">
                AI-Generated Review
              </span>
            </div>
            <p className="text-white/80 leading-relaxed">{review}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
