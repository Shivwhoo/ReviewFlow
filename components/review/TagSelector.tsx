"use client";

import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  HandHeart,
  Lamp,
  Users,
  BadgeDollarSign,
  Sparkles,
} from "lucide-react";

const TAGS = [
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "service", label: "Service", icon: HandHeart },
  { id: "ambience", label: "Ambience", icon: Lamp },
  { id: "staff", label: "Staff", icon: Users },
  { id: "price", label: "Price", icon: BadgeDollarSign },
  { id: "hygiene", label: "Hygiene", icon: Sparkles },
];

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ selected, onChange }: TagSelectorProps) {
  const toggle = (tagId: string) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter((t) => t !== tagId));
    } else {
      onChange([...selected, tagId]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-white/60 tracking-wide uppercase">
        What stood out?
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {TAGS.map((tag) => {
          const isSelected = selected.includes(tag.id);
          const Icon = tag.icon;
          return (
            <motion.button
              key={tag.id}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(tag.id)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 border
                ${
                  isSelected
                    ? "bg-white/15 border-white/30 text-white shadow-lg shadow-white/5"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                }
              `}
              aria-pressed={isSelected}
            >
              <Icon className="w-4 h-4" />
              <span>{tag.label}</span>
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-0.5 text-emerald-400"
                >
                  ✓
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
