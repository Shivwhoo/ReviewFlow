"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  onCopy?: () => void;
  className?: string;
}

export default function CopyButton({ text, onCopy, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCopy}
      disabled={!text}
      className={`
        flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${
          copied
            ? "bg-emerald-500 text-white"
            : "bg-white text-gray-900 hover:bg-white/90"
        }
        ${className}
      `}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2"
          >
            <Copy className="w-5 h-5" />
            Copy Review
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
