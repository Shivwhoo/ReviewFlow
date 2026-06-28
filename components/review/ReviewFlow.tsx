"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  AlertTriangle,
  QrCode,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from "lucide-react";
import StarRating from "@/components/review/StarRating";
import TagSelector from "@/components/review/TagSelector";
import ToneSelector from "@/components/review/ToneSelector";
import LanguageSelector from "@/components/review/LanguageSelector";

interface BusinessData {
  businessId: string;
  locationId?: string;
  businessName: string;
  googlePlaceId: string;
  reviewUrl: string;
  locationName?: string;
  logo?: string;
  customTags?: { name: string; emoji?: string; isActive?: boolean }[];
  defaultLanguage?: string;
}

type Tone = "casual" | "professional" | "genz" | "short";

export default function ReviewFlowClient({ qrId }: { qrId: string }) {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tone, setTone] = useState<Tone>("casual");
  const [userNotes, setUserNotes] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [showNotes, setShowNotes] = useState(false); // Collapsible notes toggle state
  const [length, setLength] = useState<"shorter" | "longer">("shorter");
  const [showHandoff, setShowHandoff] = useState(false);

  const [reviews, setReviews] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const [copySuccess, setCopySuccess] = useState<number | null>(null);
  const [userEdited, setUserEdited] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedTags, setDebouncedTags] = useState<string[]>([]);
  const [debouncedTone, setDebouncedTone] = useState<Tone>("casual");
  const [debouncedUserNotes, setDebouncedUserNotes] = useState("");
  const [debouncedLanguage, setDebouncedLanguage] = useState<"en" | "hi">("en");
  const [debouncedLength, setDebouncedLength] = useState<"shorter" | "longer">("shorter");

  // Debounce inputs to prevent rapid API calls on keystrokes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedTags(tags);
      setDebouncedTone(tone);
      setDebouncedUserNotes(userNotes);
      setDebouncedLanguage(language);
      setDebouncedLength(length);
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tags, tone, userNotes, language, length]);

  // Fetch business data from QR code
  const { data: business, isLoading: businessLoading, error: businessError } = useQuery<BusinessData>({
    queryKey: ["business-by-qr", qrId],
    queryFn: async () => {
      const res = await fetch(`/api/business/by-qr?qrId=${qrId}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load");
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // Sync language with business default language on load
  useEffect(() => {
    if (business?.defaultLanguage) {
      setLanguage(business.defaultLanguage as "en" | "hi");
    }
  }, [business]);

  // Generate AI reviews (exactly 2 options)
  const {
    data: reviewData,
    isLoading: reviewLoading,
    refetch: regenerate,
  } = useQuery({
    queryKey: [
      "generate-review",
      business?.businessId,
      rating,
      debouncedTags,
      debouncedTone,
      debouncedUserNotes,
      debouncedLanguage,
      debouncedLength,
    ],
    queryFn: async () => {
      const res = await fetch("/api/review/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business!.businessId,
          rating,
          tags: debouncedTags,
          tone: debouncedTone,
          userNotes: debouncedUserNotes,
          language: debouncedLanguage,
          length: debouncedLength,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate reviews");
      return res.json();
    },
    enabled: !!rating && !!business?.businessId,
    staleTime: 5 * 60 * 1000,
  });

  // Sync reviews array from query response
  useEffect(() => {
    if (reviewData?.reviews) {
      setReviews(reviewData.reviews);
      setSelectedIndex(null);
      setCopySuccess(null);
      setUserEdited(false);
    }
  }, [reviewData]);

  // Track events
  const trackEvent = useCallback(
    async (event: "copy" | "google", textToTrack: string) => {
      if (!business) return;
      try {
        await fetch("/api/review/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qrId,
            businessId: business.businessId,
            locationId: business.locationId,
            rating,
            tags,
            tone,
            reviewGenerated: textToTrack,
            userEdited,
            ...(event === "copy"
              ? { copiedAt: new Date().toISOString() }
              : { googleOpenedAt: new Date().toISOString() }),
          }),
        });
      } catch {
        // Silently fail tracking
      }
    },
    [business, qrId, rating, tags, tone, userEdited]
  );

  // Auto-copy on select
  const handleSelectReview = async (index: number) => {
    const text = reviews[index];
    setSelectedIndex(index);
    
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(index);
      trackEvent("copy", text);
      setTimeout(() => {
        setCopySuccess((current) => (current === index ? null : current));
      }, 3000);
    } catch (err) {
      console.error("Auto-copy clipboard API failed: ", err);
    }
  };

  // Handle in-place review text editing
  const handleEditReview = async (index: number, text: string) => {
    const updated = [...reviews];
    updated[index] = text;
    setReviews(updated);
    setUserEdited(true);

    // If it's the currently selected review, sync editing to clipboard
    if (selectedIndex === index) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        // Silently bypass edit clipboard sync errors
      }
    }
  };

  // Open Google Business redirection link
  const handleOpenGoogle = () => {
    if (!business || selectedIndex === null) return;
    trackEvent("google", reviews[selectedIndex]);
    window.open(business.reviewUrl, "_blank", "noopener,noreferrer");
  };

  const handleFinalRedirect = () => {
    handleOpenGoogle();
    setShowHandoff(false);
  };

  // Error state: QR not found or unassigned
  if (businessError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center bg-[#0a0a14]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white">QR Code Not Active</h1>
          <p className="text-white/50 max-w-sm">
            This QR code has not been activated yet. Please contact the business
            for assistance.
          </p>
        </motion.div>
      </div>
    );
  }

  // Loading state
  if (businessLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 bg-[#0a0a14]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center animate-pulse">
            <QrCode className="w-6 h-6 text-violet-400" />
          </div>
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 sm:py-10 bg-[#0a0a14] relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 mb-8"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <span className="text-2xl font-bold text-white">
            {business?.businessName?.[0]?.toUpperCase() || "R"}
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white text-center">
          {business?.businessName}
        </h1>
        {business?.locationName && (
          <p className="text-sm font-semibold text-white/40">{business.locationName}</p>
        )}
      </motion.div>

      {/* Review Flow Steps */}
      <AnimatePresence mode="wait">
        {showHandoff ? (
          <motion.div
            key="handoff-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-glass border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 w-full" />
            
            {/* Animated Success Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <span className="text-3xl">✅</span>
            </div>

            {/* Header */}
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Review Copied!
              </h2>
              <p className="text-xs font-bold text-emerald-400 mt-1 uppercase tracking-wider">
                You're almost done
              </p>
            </div>

            {/* Instructions */}
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              We are sending you to Google. Just <span className="text-white font-bold underline decoration-violet-500 decoration-2">long-press</span> the text box on Google and tap <span className="text-white font-bold bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">Paste</span>.
            </p>

            {/* Review Preview Card */}
            {selectedIndex !== null && (
              <div className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/5 text-left text-xs text-white/50 leading-relaxed font-medium italic relative overflow-hidden select-none">
                <div className="absolute top-1.5 right-2.5 text-[9px] uppercase tracking-wider text-white/15 font-bold">
                  On Clipboard
                </div>
                "{reviews[selectedIndex]}"
              </div>
            )}

            {/* Pulsing Proceed Button */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinalRedirect}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white cursor-pointer transition-all duration-200 shadow-xl shadow-violet-500/25 text-sm"
            >
              <ExternalLink className="w-4.5 h-4.5 animate-pulse" />
              Go to Google to Paste
            </motion.button>

            {/* Go Back Link */}
            <button
              type="button"
              onClick={() => setShowHandoff(false)}
              className="text-xs font-bold text-white/40 hover:text-white/70 transition-all cursor-pointer underline"
            >
              ← Go back to edit
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="standard-flow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md space-y-6"
          >
        
        {/* Step 1: Star Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-glass rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 w-full" />
          <StarRating value={rating} onChange={setRating} />
        </motion.div>

        {/* Step 2: Language Selector */}
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-glass rounded-2xl p-5 border border-white/5 shadow-xl relative overflow-hidden"
          >
            <LanguageSelector value={language} onChange={setLanguage} />
          </motion.div>
        )}

        {/* Step 3: Generated Reviews (just below language option) */}
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
                Select your favorite review below
              </span>
              
              <button
                type="button"
                onClick={() => regenerate()}
                disabled={reviewLoading}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50 font-bold cursor-pointer"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${reviewLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            <AnimatePresence mode="wait">
              {reviewLoading ? (
                <motion.div
                  key="skeletons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-full animate-pulse" />
                      <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse" />
                      <div className="h-4 bg-white/10 rounded w-4/6 animate-pulse" />
                    </div>
                  ))}
                </motion.div>
              ) : reviews.length > 0 ? (
                <motion.div
                  key="review-cards"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {reviews.map((reviewText, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isCopied = copySuccess === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!isSelected) handleSelectReview(idx);
                        }}
                        className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col gap-4 ${
                          isSelected
                            ? "bg-emerald-950/15 border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-[1.01]"
                            : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                        }`}
                      >
                        {/* Option Header */}
                        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                          <span className={isSelected ? "text-emerald-300 font-extrabold" : "text-white/40"}>
                            Review Option {idx + 1}
                          </span>
                          <span className="flex items-center gap-1 transition-all">
                            {isSelected && (
                              <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                                <Check className="w-3.5 h-3.5" />
                                Selected
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Review Text Body */}
                        <textarea
                          rows={3}
                          value={reviewText}
                          onChange={(e) => handleEditReview(idx, e.target.value)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isSelected) handleSelectReview(idx);
                          }}
                          className={`w-full bg-transparent border-0 text-white p-0 text-sm focus:ring-0 focus:outline-none leading-relaxed resize-none cursor-text ${
                            isSelected ? "text-white font-medium" : "text-white/70"
                          }`}
                          placeholder="Generating review..."
                        />
                        
                        {/* Button Bar: Manual Copy Button & Handoff feedback */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectReview(idx);
                            }}
                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                              isCopied
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold"
                                : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Review</span>
                              </>
                            )}
                          </button>

                          {isSelected && (
                            <span className="text-[10px] text-emerald-400 font-semibold animate-pulse">
                              📋 Copied! Ready to post.
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Step 4: Customizations Panel (placed below the reviews) */}
        {rating > 0 && reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-glass rounded-2xl p-6 border border-white/5 shadow-xl space-y-6 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Customize Review Options
              </h3>
            </div>

            {/* Customization 1: Review Length (Shorter / Longer) */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Review Length
              </label>
              <div className="flex bg-black/20 rounded-xl p-1 text-xs font-bold border border-white/5">
                <button
                  type="button"
                  onClick={() => setLength("shorter")}
                  className={`flex-1 py-2 rounded-lg transition-all duration-200 cursor-pointer text-center ${
                    length === "shorter"
                      ? "bg-violet-600 text-white shadow-sm font-semibold"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  Shorter
                </button>
                <button
                  type="button"
                  onClick={() => setLength("longer")}
                  className={`flex-1 py-2 rounded-lg transition-all duration-200 cursor-pointer text-center ${
                    length === "longer"
                      ? "bg-violet-600 text-white shadow-sm font-semibold"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  Longer
                </button>
              </div>
            </div>

            {/* Customization 2: Tone Selector */}
            <div className="space-y-2">
              <ToneSelector value={tone} onChange={setTone} />
            </div>

            {/* Customization 3: Tag Selector (What stood out) */}
            <div className="space-y-2">
              <TagSelector selected={tags} onChange={setTags} availableTags={business?.customTags} />
            </div>

            {/* Customization 4: Specific Details / User Notes */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <AnimatePresence mode="wait">
                {!showNotes ? (
                  <button
                    type="button"
                    onClick={() => setShowNotes(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors py-2.5 px-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 w-full justify-center cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    + Add a specific detail (Optional)
                  </button>
                ) : (
                  <div className="w-full text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider">
                        Specific detail or keyword
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNotes(false);
                          setUserNotes("");
                        }}
                        className="text-[10px] font-bold text-red-400 hover:underline cursor-pointer"
                      >
                        Clear & Close
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="e.g. fast service, friendly staff, great quality..."
                      value={userNotes}
                      onChange={(e) => setUserNotes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all resize-none"
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button "Google Ball" for Mobile Viewports (Keyboard Occlusion Safe) */}
      <AnimatePresence>
        {rating > 0 && selectedIndex !== null && !reviewLoading && !showHandoff && (
          <motion.button
            key="google-fab-ball"
            type="button"
            initial={{ scale: 0, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 30 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHandoff(true)}
            className="fixed bottom-24 right-6 z-50 md:hidden flex items-center justify-center gap-2 px-5 py-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 border border-white/20 shadow-2xl shadow-violet-500/50 text-white font-bold text-sm cursor-pointer animate-bounce hover:scale-105 active:scale-95 transition-all"
          >
            <ExternalLink className="w-4.5 h-4.5 animate-pulse" />
            <span>Post Review 🚀</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Bottom Bar Actions */}
      <AnimatePresence>
        {rating > 0 && !reviewLoading && reviews.length > 0 && !showHandoff && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/95 to-transparent pt-10 z-30 hidden md:block"
          >
            <div className="max-w-md mx-auto">
              {selectedIndex === null ? (
                <div className="text-center p-3 rounded-xl bg-violet-950/10 border border-violet-500/10 text-xs text-violet-300/80 animate-pulse font-semibold">
                  👇 Tap your favorite review card option above to copy and continue
                </div>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowHandoff(true)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                    font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600
                    hover:from-violet-500 hover:to-fuchsia-500 text-white cursor-pointer
                    transition-all duration-200 shadow-lg shadow-violet-500/25 text-sm"
                >
                  <ExternalLink className="w-4.5 h-4.5" />
                  Post Review on Google
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacing for sticky bottom actions on desktop */}
      {rating > 0 && reviews.length > 0 && <div className="h-24 hidden md:block" />}
      {rating > 0 && reviews.length > 0 && <div className="h-32 md:hidden" />}

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-auto pt-8 text-xs text-white/20"
      >
        Powered by ReviewFlow AI
      </motion.p>
    </div>
  );
}
