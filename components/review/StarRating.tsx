"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const labels = ["", "Terrible", "Bad", "Okay", "Good", "Amazing"];
  const colors = [
    "",
    "text-red-400",
    "text-orange-400",
    "text-yellow-400",
    "text-lime-400",
    "text-emerald-400",
  ];

  const displayRating = hovered || value;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-white/60 tracking-wide uppercase">
        How was your experience?
      </p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="relative p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-lg"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <motion.div
              animate={{
                scale: star <= displayRating ? 1 : 0.85,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Star
                className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors duration-200 ${
                  star <= displayRating
                    ? `${colors[displayRating]} fill-current`
                    : "text-white/20"
                }`}
              />
            </motion.div>
            {/* Glow effect for selected stars */}
            {star <= displayRating && (
              <motion.div
                className={`absolute inset-0 rounded-full blur-lg opacity-30 ${colors[displayRating]}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </div>
      {displayRating > 0 && (
        <motion.p
          key={displayRating}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-lg font-semibold ${colors[displayRating]}`}
        >
          {labels[displayRating]}
        </motion.p>
      )}
    </div>
  );
}
