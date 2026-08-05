"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, RefreshCw, Star, Info, MessageSquare } from "lucide-react";

interface BusinessData {
  businessId: string;
  locationId?: string;
  businessName: string;
  googlePlaceId: string;
  reviewUrl: string;
  locationName?: string;
  logo?: string;
  phoneNumber?: string;
  customTags?: { name: string; emoji?: string; isActive?: boolean }[];
  defaultLanguage?: string;
}

type Tone = "casual" | "professional" | "genz" | "short";

export default function ReviewFlowClient({ qrId }: { qrId: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tone, setTone] = useState<Tone>("casual");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [length, setLength] = useState<"shorter" | "longer">("shorter");

  const [reviews, setReviews] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState<number | null>(null);
  const [userEdited, setUserEdited] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showPostPopup, setShowPostPopup] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedTags, setDebouncedTags] = useState<string[]>([]);
  const [debouncedTone, setDebouncedTone] = useState<Tone>("casual");
  const [debouncedUserNotes, setDebouncedUserNotes] = useState("");
  const [debouncedLanguage, setDebouncedLanguage] = useState<"en" | "hi">("en");
  const [debouncedLength, setDebouncedLength] = useState<"shorter" | "longer">("shorter");

  const [focusArea, setFocusArea] = useState<"overall" | "detail">("overall");
  const [detailInput, setDetailInput] = useState("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedTags(tags);
      setDebouncedTone(tone);
      setDebouncedUserNotes(focusArea === "detail" ? detailInput : "");
      setDebouncedLanguage(language);
      setDebouncedLength(length);
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tags, tone, detailInput, focusArea, language, length]);

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

  useEffect(() => {
    if (business?.defaultLanguage) {
      setLanguage(business.defaultLanguage as "en" | "hi");
    }
  }, [business]);

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

  useEffect(() => {
    if (reviewData?.reviews) {
      setReviews(reviewData.reviews);
      setCopySuccess(null);
      setUserEdited(false);
    }
  }, [reviewData]);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleCopy = async (index: number) => {
    const text = reviews[index];
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(index);
      trackEvent("copy", text);
      setShowPostPopup(true);
      
      setTimeout(() => {
         window.open(business?.reviewUrl, "_blank", "noopener,noreferrer");
      }, 3000);
      
      setTimeout(() => {
        setCopySuccess((current) => (current === index ? null : current));
      }, 3000);
    } catch (err) {
      console.error("Auto-copy clipboard API failed: ", err);
      showToast("Failed to copy");
    }
  };

  const handleEditReview = async (index: number, text: string) => {
    const updated = [...reviews];
    updated[index] = text;
    setReviews(updated);
    setUserEdited(true);
  };

  if (businessError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center bg-[#F4F4F5] font-['Inter']">
        <div className="text-red-500 mb-4">
          <Info className="w-8 h-8 mx-auto" />
        </div>
        <h1 className="text-xl font-bold text-[#121212]">QR Code Not Active</h1>
        <p className="text-[#71717A] max-w-sm mt-2 text-sm">
          This QR code has not been activated yet. Please contact the business for assistance.
        </p>
      </div>
    );
  }

  if (businessLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 bg-[#F4F4F5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C3A370]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F4F4F5] p-5 font-sans text-[#121212] selection:bg-[#E8DECE]">
      
      {/* Toast */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#121212] text-white px-6 py-3 rounded-full text-[13px] font-medium shadow-[0_12px_32px_rgba(0,0,0,0.06)] flex items-center gap-2 z-50 transition-all duration-300 pointer-events-none ${toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
        <Check className="w-4 h-4" />
        <span>{toastMessage}</span>
      </div>

      <div className="w-full max-w-[420px] bg-white rounded-[20px] shadow-[0_12px_32px_rgba(0,0,0,0.06)] border border-[#E4E4E7] overflow-hidden relative">
        <div className="p-8 sm:p-7 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#E4E4E7]">
          
          {/* Header */}
          <div className="text-center pb-6 border-b border-[#F4F4F5] mb-6">
            <div className="font-['Playfair_Display'] font-medium text-2xl text-[#121212] tracking-[-0.01em] flex items-center justify-center gap-2">
              {business?.logo && (
                <span className="text-[#C3A370] flex items-center">
                  <img src={business.logo} alt="Logo" className="w-5 h-5 object-contain" />
                </span>
              )}
              {business?.businessName}
            </div>

            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="flex gap-0.5 text-[#A1A1AA] cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <svg 
                      key={star} 
                      viewBox="0 0 24 24" 
                      className={`w-5 h-5 transition-all duration-300 ${isFilled ? "fill-[#C3A370] stroke-[#C3A370]" : "fill-transparent stroke-[#A1A1AA] stroke-[1.5px]"}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  )
                })}
              </div>
              <span className="text-xs font-medium text-[#121212] bg-[#F4F4F5] px-2.5 py-1 rounded-full tracking-[0.5px]">
                {rating > 0 ? rating.toFixed(1) : "0.0"}
              </span>
            </div>

            <p className="text-sm font-normal text-[#71717A] mt-4">
              How was your experience at <strong className="text-[#121212] font-medium">{business?.businessName}</strong>?
            </p>
          </div>

          {rating > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              
              {/* Language */}
              <div className="flex bg-[#F4F4F5] p-1 rounded-xl mb-8">
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex-1 py-2.5 px-3 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all text-center ${language === "en" ? "bg-white text-[#121212] shadow-[0_2px_8px_rgba(0,0,0,0.04)]" : "bg-transparent text-[#71717A]"}`}
                >
                  English
                  <span className={`block text-[10px] font-normal mt-0.5 ${language === "en" ? "text-[#71717A]" : "text-[#A1A1AA]"}`}>Standard</span>
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`flex-1 py-2.5 px-3 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all text-center ${language === "hi" ? "bg-white text-[#121212] shadow-[0_2px_8px_rgba(0,0,0,0.04)]" : "bg-transparent text-[#71717A]"}`}
                >
                  Hinglish
                  <span className={`block text-[10px] font-normal mt-0.5 ${language === "hi" ? "text-[#71717A]" : "text-[#A1A1AA]"}`}>Conversational</span>
                </button>
              </div>

              {/* Reviews */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Playfair_Display'] font-medium text-lg text-[#121212]">
                  Curated <span className="text-[#C3A370] italic">Drafts</span>
                </h3>
                <button 
                  onClick={() => regenerate()}
                  disabled={reviewLoading}
                  className="flex items-center gap-1.5 bg-transparent border-none text-[13px] font-normal text-[#71717A] hover:text-[#121212] cursor-pointer transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reviewLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>

              <div className="flex flex-col gap-4 mb-8">
                {reviewLoading ? (
                  <div className="animate-pulse flex flex-col gap-4">
                    <div className="h-32 bg-[#F4F4F5] rounded-xl border border-[#E4E4E7]"></div>
                    <div className="h-32 bg-[#F4F4F5] rounded-xl border border-[#E4E4E7]"></div>
                  </div>
                ) : reviews.map((reviewText, idx) => {
                  const isCopied = copySuccess === idx;
                  const labels = ["Top Pick", "Personal Touch", "Highlight"];
                  const label = labels[idx % labels.length];
                  
                  return (
                    <div key={idx} className="bg-white rounded-xl p-5 border border-[#E4E4E7] transition-all hover:border-[#C3A370] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.5px] text-[#C3A370] mb-3">
                        <Star className="w-3 h-3 fill-current" />
                        {label}
                      </span>
                      
                      <textarea
                        rows={4}
                        value={reviewText}
                        onChange={(e) => handleEditReview(idx, e.target.value)}
                        className="w-full bg-transparent border-none text-[14px] leading-[1.6] text-[#2C2C2C] font-normal mb-2 focus:outline-none resize-none"
                      />
                      
                      <div className="flex items-center justify-end pt-4 border-t border-[#F4F4F5]">
                        <button
                          onClick={() => handleCopy(idx)}
                          className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-[13px] font-medium cursor-pointer transition-all ${
                            isCopied 
                              ? "bg-[#238A4B] border-[#238A4B] text-white" 
                              : "bg-[#121212] border-[#121212] text-white hover:bg-[#2C2C2C] hover:border-[#2C2C2C] active:scale-[0.98]"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Customize Section */}
              <div className="pt-6 border-t border-[#E4E4E7]">
                <div className="flex items-center gap-2 mb-5">
                  <h4 className="font-['Playfair_Display'] font-medium text-base text-[#121212]">Adjust Parameters</h4>
                </div>

                {/* Length */}
                <div className="mb-6">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#71717A] mb-3">Length</span>
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => setLength("shorter")}
                      className={`px-4 py-2 border rounded-full text-[13px] font-normal cursor-pointer transition-all ${length === "shorter" ? "border-[#C3A370] bg-[#F9F6F0] text-[#C3A370] font-medium" : "border-[#E4E4E7] bg-white text-[#71717A] hover:border-[#A1A1AA] hover:text-[#121212]"}`}
                    >
                      Concise
                    </button>
                    <button 
                      onClick={() => setLength("longer")}
                      className={`px-4 py-2 border rounded-full text-[13px] font-normal cursor-pointer transition-all ${length === "longer" ? "border-[#C3A370] bg-[#F9F6F0] text-[#C3A370] font-medium" : "border-[#E4E4E7] bg-white text-[#71717A] hover:border-[#A1A1AA] hover:text-[#121212]"}`}
                    >
                      Detailed
                    </button>
                  </div>
                </div>

                {/* Tone */}
                <div className="mb-6">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#71717A] mb-3">Tone</span>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { val: "casual", label: "Conversational", sub: "Friendly & natural" },
                      { val: "professional", label: "Professional", sub: "Polished & objective" },
                      { val: "genz", label: "Modern", sub: "Contemporary styling" },
                      { val: "short", label: "Direct", sub: "To the point" }
                    ].map(t => (
                      <button 
                        key={t.val}
                        onClick={() => setTone(t.val as Tone)}
                        className={`flex-[1_0_calc(50%-4px)] p-2.5 sm:px-4 sm:py-2 border rounded-xl sm:rounded-full text-[13px] font-normal cursor-pointer transition-all text-left sm:text-center ${tone === t.val ? "border-[#C3A370] bg-[#F9F6F0] text-[#C3A370] font-medium" : "border-[#E4E4E7] bg-white text-[#71717A] hover:border-[#A1A1AA] hover:text-[#121212]"}`}
                      >
                        {t.label}
                        <span className="block text-[10px] font-normal opacity-70 mt-0.5">{t.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus Area */}
                <div className="mb-6">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#71717A] mb-3">Focus Area</span>
                  <div className="flex flex-col gap-2">
                    <div 
                      onClick={() => setFocusArea("overall")}
                      className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl border cursor-pointer transition-all ${focusArea === "overall" ? "border-[#C3A370] bg-[#F9F6F0]" : "border-[#E4E4E7] hover:border-[#A1A1AA]"}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all ${focusArea === "overall" ? "border-[#C3A370]" : "border-[#E4E4E7]"}`}>
                        <div className={`w-2 h-2 rounded-full bg-[#C3A370] transition-transform ${focusArea === "overall" ? "scale-100" : "scale-0"}`}></div>
                      </div>
                      <span className={`text-[13px] font-medium flex-1 ${focusArea === "overall" ? "text-[#121212]" : "text-[#2C2C2C]"}`}>Overall Experience</span>
                    </div>

                    <div 
                      onClick={() => setFocusArea("detail")}
                      className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl border cursor-pointer transition-all ${focusArea === "detail" ? "border-[#C3A370] bg-[#F9F6F0]" : "border-[#E4E4E7] hover:border-[#A1A1AA]"}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all ${focusArea === "detail" ? "border-[#C3A370]" : "border-[#E4E4E7]"}`}>
                        <div className={`w-2 h-2 rounded-full bg-[#C3A370] transition-transform ${focusArea === "detail" ? "scale-100" : "scale-0"}`}></div>
                      </div>
                      <span className={`text-[13px] font-medium flex-1 ${focusArea === "detail" ? "text-[#121212]" : "text-[#2C2C2C]"}`}>Specific Detail</span>
                    </div>
                  </div>

                  {focusArea === "detail" && (
                    <div className="flex items-center gap-2 mt-2 px-3.5 py-1.5 bg-white rounded-xl border border-[#E4E4E7] focus-within:border-[#C3A370] focus-within:shadow-[0_0_0_3px_#F9F6F0] transition-all">
                      <MessageSquare className="w-4 h-4 text-[#A1A1AA]" />
                      <input 
                        type="text" 
                        placeholder="e.g., The scalp massage..." 
                        value={detailInput}
                        onChange={(e) => setDetailInput(e.target.value)}
                        className="flex-1 border-none bg-transparent py-2 font-sans text-[13px] text-[#121212] focus:outline-none placeholder:text-[#A1A1AA]"
                      />
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* Footer Area */}
          <div className="mt-8 pt-5 border-t border-[#F4F4F5]">
            {business?.phoneNumber && (
              <div className="text-center mb-6 pt-2">
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">Business Contact</p>
                <a href={`tel:${business.phoneNumber}`} className="text-[15px] font-medium text-[#2C2C2C] hover:text-[#C3A370] transition-colors">
                  {business.phoneNumber}
                </a>
              </div>
            )}

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#A1A1AA] tracking-[1px] uppercase">ReviewFlow AI</span>
                <a href="tel:9334947294" className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#121212] transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Support
                </a>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed max-w-[90%]">
                About Us: We empower businesses to collect authentic, high-quality reviews effortlessly through personalized AI experiences.
              </p>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showPostPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[20px] shadow-2xl border border-[#E4E4E7] w-full max-w-sm p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#F9F6F0] flex items-center justify-center mx-auto mb-4 text-[#C3A370]">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-['Playfair_Display'] text-xl font-medium text-[#121212] mb-2">Review Copied!</h3>
              <p className="text-sm text-[#71717A] mb-6">
                Redirecting you to Google automatically to paste your review.
              </p>
              
              <div className="flex flex-col gap-3">
                <a
                  href={business?.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowPostPopup(false)}
                  className="bg-[#121212] text-white py-3 rounded-full text-sm font-medium hover:bg-[#2C2C2C] transition-colors"
                >
                  Post Manually
                </a>
                <button
                  onClick={() => setShowPostPopup(false)}
                  className="text-sm text-[#71717A] hover:text-[#121212] font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
