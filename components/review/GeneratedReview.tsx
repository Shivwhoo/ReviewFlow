"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, RotateCcw } from "lucide-react";

interface GeneratedReviewProps {
  review: string;
  isLoading: boolean;
  onEdit: (edited: string) => void;
  onRegenerate: () => void;
}

export default function GeneratedReview({
  review,
  isLoading,
  onEdit,
  onRegenerate,
}: GeneratedReviewProps) {
  const [editedReview, setEditedReview] = useState(review);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedReview(review);
    setIsEditing(false);
  }, [review]);

  const handleChange = (value: string) => {
    setEditedReview(value);
    setIsEditing(true);
    onEdit(value);
  };

  const charCount = editedReview.length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-white/60 tracking-wide uppercase">
          Your Review
        </p>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="h-4 bg-white/10 rounded animate-pulse w-full" />
            <div className="h-4 bg-white/10 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-white/10 rounded animate-pulse w-4/6" />
          </motion.div>
        ) : (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative"
          >
            <textarea
              value={editedReview}
              onChange={(e) => handleChange(e.target.value)}
              rows={4}
              className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white
                resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/40
                focus:border-violet-500/40 transition-all text-[15px] leading-relaxed"
              placeholder="Your review will appear here..."
            />
            <div className="flex items-center justify-between mt-1.5 px-1">
              <div className="flex items-center gap-1">
                {isEditing && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-xs text-amber-400/70"
                  >
                    <Pencil className="w-3 h-3" />
                    Edited
                  </motion.span>
                )}
              </div>
              <span
                className={`text-xs ${
                  charCount > 500 ? "text-red-400" : "text-white/30"
                }`}
              >
                {charCount} characters
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
