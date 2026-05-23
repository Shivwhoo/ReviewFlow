"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, AlertTriangle, QrCode, Copy, Check, RotateCcw, Sparkles } from "lucide-react";
import StarRating from "@/components/review/StarRating";
import TagSelector from "@/components/review/TagSelector";
import ToneSelector from "@/components/review/ToneSelector";

interface BusinessData {
  businessId: string;
  locationId?: string;
  businessName: string;
  googlePlaceId: string;
  reviewUrl: string;
  locationName?: string;
  logo?: string;
}

type Tone = "casual" | "professional" | "genz" | "short";

export default function ReviewFlowClient({ qrId }: { qrId: string }) {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tone, setTone] = useState<Tone>("casual");
  const [userNotes, setUserNotes] = useState("");

  const [reviews, setReviews] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  
  const [copySuccess, setCopySuccess] = useState<number | null>(null);
  const [userEdited, setUserEdited] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedTags, setDebouncedTags] = useState<string[]>([]);
  const [debouncedTone, setDebouncedTone] = useState<Tone>("casual");
  const [debouncedUserNotes, setDebouncedUserNotes] = useState("");

  // Debounce inputs to prevent rapid API calls on keystrokes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedTags(tags);
      setDebouncedTone(tone);
      setDebouncedUserNotes(userNotes);
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tags, tone, userNotes]);

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

  const selectedReview = selectedIndex !== null ? reviews[selectedIndex] : null;

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
        <h1 className="text-xl font-bold text-white text-center">
          {business?.businessName}
        </h1>
        {business?.locationName && (
          <p className="text-sm text-white/40">{business.locationName}</p>
        )}
      </motion.div>

      {/* Review Flow Steps */}
      <div className="w-full max-w-md space-y-8">
        
        {/* Step 1: Star Rating + Optional Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <StarRating value={rating} onChange={setRating} />
          
          {rating > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-1"
            >
              <label className="block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider">
                Anything specific you'd like to mention? (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. loved the pistachio croissants, friendly barista, fast wifi..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all resize-none"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Dynamic Options appear after rating is selected */}
        <AnimatePresence>
          {rating > 0 && (
            <>
              {/* Step 2: Tag Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <TagSelector selected={tags} onChange={setTags} />
              </motion.div>

              {/* Step 3: Tone Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ToneSelector value={tone} onChange={setTone} />
              </motion.div>

              {/* Step 4: Double Selectable Reviews Option Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Select & Copy Your Review
                  </p>
                  <button
                    type="button"
                    onClick={() => regenerate()}
                    disabled={reviewLoading}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50 font-semibold"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${reviewLoading ? "animate-spin" : ""}`} />
                    Regenerate Options
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
                  ) : (
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
                            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col gap-2.5 ${
                              isSelected
                                ? "bg-violet-950/15 border-violet-500/80 shadow-lg shadow-violet-500/10"
                                : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                            }`}
                          >
                            {/* Option tag and Copy badge */}
                            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                              <span className={isSelected ? "text-violet-300" : "text-white/40"}>
                                Option {idx + 1}
                              </span>
                              <span className="flex items-center gap-1 transition-all">
                                {isCopied ? (
                                  <motion.span
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-emerald-400 flex items-center gap-0.5"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Copied!
                                  </motion.span>
                                ) : isSelected ? (
                                  <span className="text-violet-400 flex items-center gap-0.5">
                                    <Check className="w-3.5 h-3.5" />
                                    Selected
                                  </span>
                                ) : (
                                  <span className="text-white/25 flex items-center gap-0.5 hover:text-white/50">
                                    <Copy className="w-3 h-3" />
                                    Click to Copy
                                  </span>
                                )}
                              </span>
                            </div>

                            {/* Review Text Body (Editable when selected or anytime) */}
                            <textarea
                              rows={3}
                              value={reviewText}
                              onChange={(e) => handleEditReview(idx, e.target.value)}
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid triggering container click again
                                if (!isSelected) handleSelectReview(idx);
                              }}
                              className={`w-full bg-transparent border-0 text-white p-0 text-sm focus:ring-0 focus:outline-none leading-relaxed resize-none ${
                                isSelected ? "text-white" : "text-white/70"
                              }`}
                              placeholder="Review option..."
                            />
                            
                            {/* Animated Auto-Copy visual confirmation */}
                            <AnimatePresence>
                              {isCopied && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute bottom-2 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-md font-semibold pointer-events-none"
                                >
                                  Copied to clipboard! ✅
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Actions */}
      <AnimatePresence>
        {rating > 0 && !reviewLoading && reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/95 to-transparent pt-10 z-30"
          >
            <div className="max-w-md mx-auto">
              {selectedIndex === null ? (
                <div className="text-center p-3 rounded-xl bg-violet-950/10 border border-violet-500/10 text-xs text-violet-300/80 animate-pulse font-medium">
                  👇 Tap your favorite option above to copy and continue
                </div>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOpenGoogle}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl
                    font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600
                    hover:from-violet-500 hover:to-fuchsia-500 text-white
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

      {/* Spacing for sticky actions */}
      {rating > 0 && reviews.length > 0 && <div className="h-24" />}

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
