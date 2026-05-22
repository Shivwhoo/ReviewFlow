"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, AlertTriangle, QrCode } from "lucide-react";
import StarRating from "@/components/review/StarRating";
import TagSelector from "@/components/review/TagSelector";
import ToneSelector from "@/components/review/ToneSelector";
import GeneratedReview from "@/components/review/GeneratedReview";
import CopyButton from "@/components/shared/CopyButton";

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
  const [editedReview, setEditedReview] = useState("");
  const [userEdited, setUserEdited] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedTags, setDebouncedTags] = useState<string[]>([]);
  const [debouncedTone, setDebouncedTone] = useState<Tone>("casual");

  // Debounce tags and tone changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedTags(tags);
      setDebouncedTone(tone);
    }, 600);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tags, tone]);

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

  // Generate AI review
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
        }),
      });
      if (!res.ok) throw new Error("Failed to generate review");
      return res.json();
    },
    enabled: !!rating && !!business?.businessId,
    staleTime: 5 * 60 * 1000,
  });

  const generatedReview = editedReview || reviewData?.review || "";

  // Track events
  const trackEvent = useCallback(
    async (event: "copy" | "google") => {
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
            reviewGenerated: generatedReview,
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
    [business, qrId, rating, tags, tone, generatedReview, userEdited]
  );

  const handleCopy = () => trackEvent("copy");

  const handleOpenGoogle = () => {
    if (!business) return;
    trackEvent("google");
    window.open(business.reviewUrl, "_blank", "noopener,noreferrer");
  };

  const handleEdit = (text: string) => {
    setEditedReview(text);
    setUserEdited(true);
  };

  // Error: QR not found or unassigned
  if (businessError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
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
      <div className="flex flex-col items-center justify-center min-h-dvh px-6">
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
    <div className="flex flex-col items-center min-h-dvh px-4 py-6 sm:py-10">
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
        {/* Step 1: Star Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StarRating value={rating} onChange={setRating} />
        </motion.div>

        {/* Steps 2-4 appear after rating selection */}
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

              {/* Step 4: Generated Review */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GeneratedReview
                  review={reviewData?.review || ""}
                  isLoading={reviewLoading}
                  onEdit={handleEdit}
                  onRegenerate={() => regenerate()}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Bottom Buttons */}
      <AnimatePresence>
        {generatedReview && !reviewLoading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/95 to-transparent pt-10"
          >
            <div className="flex gap-3 max-w-md mx-auto">
              <CopyButton
                text={generatedReview}
                onCopy={handleCopy}
                className="flex-1"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenGoogle}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                  font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600
                  hover:from-violet-500 hover:to-fuchsia-500 text-white
                  transition-all duration-200 flex-1 shadow-lg shadow-violet-500/25"
              >
                <ExternalLink className="w-5 h-5" />
                Post on Google
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacing for sticky buttons */}
      {generatedReview && !reviewLoading && <div className="h-24" />}

      {/* Powered by footer */}
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
