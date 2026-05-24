"use client";

import { motion } from "framer-motion";

export interface ICustomTag {
  name: string;
  emoji?: string;
  isActive?: boolean;
}

interface TagSelectorProps {
  selected: string[];
  onChange: (tags: string[]) => void;
  availableTags?: ICustomTag[];
}

export default function TagSelector({
  selected,
  onChange,
  availableTags,
}: TagSelectorProps) {
  // Use custom active tags if available, otherwise default to a single chip
  const activeTags =
    availableTags && availableTags.filter((t) => t.isActive !== false).length > 0
      ? availableTags.filter((t) => t.isActive !== false)
      : [{ name: "Overall Experience", emoji: "✨" }];

  const toggle = (tagName: string) => {
    if (selected.includes(tagName)) {
      onChange(selected.filter((t) => t !== tagName));
    } else {
      onChange([...selected, tagName]);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
        What stood out?
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {activeTags.map((tag) => {
          const isSelected = selected.includes(tag.name);
          return (
            <motion.button
              key={tag.name}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(tag.name)}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 border cursor-pointer
                ${
                  isSelected
                    ? "bg-white/15 border-white/30 text-white shadow-lg shadow-white/5"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                }
              `}
              aria-pressed={isSelected}
            >
              {tag.emoji && <span className="text-base mr-0.5">{tag.emoji}</span>}
              <span>{tag.name}</span>
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-0.5 text-emerald-400 font-bold"
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
