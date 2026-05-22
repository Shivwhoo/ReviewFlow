"use client";

import { motion } from "framer-motion";
import { MessageCircle, Briefcase, Zap, AlignLeft } from "lucide-react";

const TONES = [
  {
    id: "casual" as const,
    label: "Casual",
    description: "Friendly & natural",
    icon: MessageCircle,
  },
  {
    id: "professional" as const,
    label: "Professional",
    description: "Polished & measured",
    icon: Briefcase,
  },
  {
    id: "genz" as const,
    label: "Gen-Z",
    description: "With emojis & slang",
    icon: Zap,
  },
  {
    id: "short" as const,
    label: "Short & Crisp",
    description: "Under 20 words",
    icon: AlignLeft,
  },
];

type Tone = "casual" | "professional" | "genz" | "short";

interface ToneSelectorProps {
  value: Tone;
  onChange: (tone: Tone) => void;
}

export default function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-white/60 tracking-wide uppercase">
        Pick a tone
      </p>
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {TONES.map((tone) => {
          const isSelected = value === tone.id;
          const Icon = tone.icon;
          return (
            <motion.button
              key={tone.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(tone.id)}
              className={`
                relative flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-sm
                transition-all duration-200 border overflow-hidden
                ${
                  isSelected
                    ? "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border-violet-400/40 text-white"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70"
                }
              `}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <motion.div
                  layoutId="tone-highlight"
                  className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="font-semibold relative z-10">{tone.label}</span>
              <span className="text-[11px] opacity-60 relative z-10">
                {tone.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
