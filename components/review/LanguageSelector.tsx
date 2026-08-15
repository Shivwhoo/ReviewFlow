"use client";

import { motion } from "framer-motion";
import { Globe, Languages } from "lucide-react";

const LANGUAGES = [
  {
    id: "en" as const,
    label: "English",
    description: "Standard English",
    icon: Globe,
  },
  {
    id: "hi" as const,
    label: "Hinglish",
    description: "Hindi in English script",
    icon: Languages,
  },
];

type Language = "en" | "hi";

interface LanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
}

export default function LanguageSelector({
  value,
  onChange,
}: LanguageSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
        Select Language
      </p>
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {LANGUAGES.map((lang) => {
          const isSelected = value === lang.id;
          const Icon = lang.icon;
          return (
            <motion.button
              key={lang.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(lang.id)}
              className={`
                relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-semibold
                transition-all duration-200 border overflow-hidden cursor-pointer
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
                  layoutId="lang-highlight"
                  className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10 text-violet-400" />
              <span className="relative z-10">{lang.label}</span>
              <span className="text-[11px] font-normal opacity-50 relative z-10">
                {lang.description}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
