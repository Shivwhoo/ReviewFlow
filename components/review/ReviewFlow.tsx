"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, RefreshCw, Star, Info, MessageSquare, Phone, ChevronDown } from "lucide-react";

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

const RoundedStar = ({ isFilled, isSmall, onClick, onMouseEnter, onMouseLeave, animateRipple }: any) => {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <svg 
        viewBox="0 0 24 24" 
        className={`cursor-pointer transition-all duration-300 transform ${isSmall ? "w-[14px] h-[14px]" : "w-[52px] h-[52px]"} ${!isSmall && !isFilled ? "hover:scale-110" : ""}`}
        style={{
          filter: isFilled && !isSmall ? "drop-shadow(0px 4px 12px rgba(245, 166, 35, 0.25))" : "none"
        }}
      >
        <path 
          d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeWidth={isFilled ? "0" : "1.5"}
          stroke={isFilled ? "none" : "rgba(209, 213, 219, 0.4)"}
          fill={isFilled ? "url(#star-gradient)" : "transparent"}
        />
      </svg>
      {animateRipple && !isSmall && (
        <motion.div 
          className="absolute inset-0 rounded-full bg-[#F5A623]"
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ pointerEvents: "none" }}
        />
      )}
    </motion.div>
  )
}

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
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  
  // Emotive Feedback replacing specific text detail
  const [emotiveFeedback, setEmotiveFeedback] = useState<string>("");
  
  // Animation state for star ripples
  const [animatingStar, setAnimatingStar] = useState<number | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedTags, setDebouncedTags] = useState<string[]>([]);
  const [debouncedTone, setDebouncedTone] = useState<Tone>("casual");
  const [debouncedUserNotes, setDebouncedUserNotes] = useState("");
  const [debouncedLanguage, setDebouncedLanguage] = useState<"en" | "hi">("en");
  const [debouncedLength, setDebouncedLength] = useState<"shorter" | "longer">("shorter");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedTags(tags);
      setDebouncedTone(tone);
      setDebouncedUserNotes(emotiveFeedback);
      setDebouncedLanguage(language);
      setDebouncedLength(length);
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tags, tone, emotiveFeedback, language, length]);

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

  const handleStarClick = (star: number) => {
    setAnimatingStar(star);
    setRating(star);
    setTimeout(() => {
      setAnimatingStar(null);
    }, 500);
  };

  const toggleTag = (tagName: string) => {
    setTags(prev => prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]);
  };

  if (businessError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center bg-[#FDFBF7] font-['Inter']">
        <div className="text-red-500 mb-4">
          <Info className="w-8 h-8 mx-auto" />
        </div>
        <h1 className="text-xl font-bold text-[#1A1A1A]">QR Code Not Active</h1>
        <p className="text-[#6B7280] max-w-sm mt-2 text-sm">
          This QR code has not been activated yet. Please contact the business for assistance.
        </p>
      </div>
    );
  }

  if (businessLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh px-6 bg-[#FDFBF7]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A574]"></div>
      </div>
    );
  }

  const renderBusinessName = () => {
    const name = business?.businessName || "";
    if (name.toLowerCase().includes("salon")) {
       const parts = name.split(new RegExp("salon", "i"));
       return (
         <>
           {parts[0]} <span className="font-sans font-light tracking-wide text-[22px]">Salon</span>
         </>
       );
    }
    return name;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#FDFBF7] p-5 font-sans text-[#1A1A1A] selection:bg-[#D4A574]/20 relative overflow-hidden">
      
      {/* Global SVG Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="star-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCEABB" />
            <stop offset="100%" stopColor="#F8B500" />
          </linearGradient>
        </defs>
      </svg>

      {/* Background Soft Mirror Gradients */}
      <div className="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[#F5A623]/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-[#D4A574]/10 rounded-full blur-[100px] pointer-events-none translate-x-1/4 translate-y-1/4"></div>
      <div className="absolute top-1/2 left-1/2 w-[70vw] h-[70vw] bg-[#FDFBF7]/40 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-overlay"></div>

      {/* Toast */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-6 py-3 rounded-full text-[13px] font-medium shadow-[0_12px_32px_rgba(0,0,0,0.06)] flex items-center gap-2 z-50 transition-all duration-300 pointer-events-none ${toastMessage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
        <Check className="w-4 h-4" />
        <span>{toastMessage}</span>
      </div>

      <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-2xl rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.04)] border border-white/60 overflow-hidden relative z-10">
        <div className="p-8 sm:p-7 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#E4E4E7]">
          
          {/* Header */}
          <div className="text-center pb-2 flex flex-col items-center">
            {business?.logo && (
              <span className="text-[#D4A574] flex items-center mb-4">
                <img src={business.logo} alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
              </span>
            )}
            <h1 className="font-['Playfair_Display'] font-semibold text-[24px] text-[#1A1A1A] tracking-[-0.02em] leading-tight">
               {renderBusinessName()}
            </h1>
            
            <div className="w-[40px] h-[1px] bg-[#E4E4E7] mt-5 mb-6"></div>

            <AnimatePresence mode="popLayout">
              {rating === 0 ? (
                <motion.div
                  key="rating-large"
                  layoutId="rating-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="flex items-center justify-center mb-8">
                    <h2 className="font-sans text-[16px] font-normal text-[#6B7280] tracking-[1px]">
                      How was your experience?
                    </h2>
                  </div>

                  <span className="text-[9px] font-semibold text-[#A1A1AA] uppercase tracking-[1.5px] mb-4 block">
                    Rated 5.0 by the community
                  </span>

                  <div className="flex justify-center gap-3 mb-8">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = star <= (hoverRating || rating);
                      return (
                        <RoundedStar
                          key={star}
                          isFilled={isFilled}
                          isSmall={false}
                          animateRipple={animatingStar === star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleStarClick(star)}
                        />
                      )
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="rating-small"
                  layoutId="rating-container"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="inline-flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full px-3 py-1 mb-6"
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <RoundedStar
                        key={star}
                        isFilled={star <= rating}
                        isSmall={true}
                        onClick={() => handleStarClick(star)}
                      />
                    ))}
                  </div>
                  <span className="text-[12px] font-bold text-[#1A1A1A]">5.0</span>
                  <span className="text-[10px] font-medium uppercase text-[#A1A1AA] tracking-wider">
                    · Community Rated
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>

          {rating > 0 && (
            <motion.div 
              variants={containerVariants} 
              initial="hidden" 
              animate="show" 
              className="pt-2 border-t border-[#F4F4F5]"
            >
              
              {/* Custom Tags */}
              {business?.customTags && business.customTags.filter(t => t.isActive !== false).length > 0 && (
                <motion.div variants={itemVariants} className="mb-6 mt-4 relative z-20">
                  <span className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#6B7280] mb-3">What stood out?</span>
                  <div className="relative">
                    <button 
                      onClick={() => setIsTagsOpen(!isTagsOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-[#E4E4E7] rounded-xl bg-white text-[13px] text-[#1A1A1A] cursor-pointer transition-all hover:border-[#A1A1AA] shadow-sm"
                    >
                      <span className="truncate font-medium">
                        {tags.length > 0 ? tags.join(", ") : "Select highlights..."}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${isTagsOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isTagsOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute z-30 top-full left-0 right-0 mt-2 bg-white border border-[#E4E4E7] rounded-xl shadow-lg shadow-black/5 overflow-hidden max-h-[200px] overflow-y-auto"
                        >
                          {business.customTags.filter(t => t.isActive !== false).map((tag) => {
                            const isSelected = tags.includes(tag.name);
                            return (
                              <button
                                key={tag.name}
                                onClick={() => toggleTag(tag.name)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-[13px] hover:bg-[#F9FAFB] transition-colors border-b border-[#F4F4F5] last:border-0 ${isSelected ? "text-[#D4A574] font-medium bg-[#FDFBF7]" : "text-[#4B5563]"}`}
                              >
                                <div className="flex items-center gap-2">
                                  {tag.emoji && <span>{tag.emoji}</span>}
                                  <span>{tag.name}</span>
                                </div>
                                {isSelected && <Check className="w-4 h-4" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* Language */}
              <motion.div variants={itemVariants} className="flex bg-[#F3F4F6] p-1 rounded-xl mb-8 mt-6">
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex-1 py-2.5 px-3 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all text-center ${language === "en" ? "bg-white text-[#1A1A1A] shadow-sm" : "bg-transparent text-[#6B7280] hover:text-[#1A1A1A]"}`}
                >
                  English
                  <span className={`block text-[10px] font-normal mt-0.5 ${language === "en" ? "text-[#6B7280]" : "text-[#A1A1AA]"}`}>Standard</span>
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`flex-1 py-2.5 px-3 border-none rounded-lg text-[13px] font-medium cursor-pointer transition-all text-center ${language === "hi" ? "bg-white text-[#1A1A1A] shadow-sm" : "bg-transparent text-[#6B7280] hover:text-[#1A1A1A]"}`}
                >
                  Hinglish
                  <span className={`block text-[10px] font-normal mt-0.5 ${language === "hi" ? "text-[#6B7280]" : "text-[#A1A1AA]"}`}>Conversational</span>
                </button>
              </motion.div>

              {/* Reviews */}
              <motion.div variants={itemVariants} className="flex items-center justify-between mb-4">
                <h3 className="font-['Playfair_Display'] font-medium text-lg text-[#1A1A1A]">
                  Curated <span className="text-[#D4A574] italic">Drafts</span>
                </h3>
                <button 
                  onClick={() => regenerate()}
                  disabled={reviewLoading}
                  className="flex items-center gap-1.5 bg-transparent border-none text-[13px] font-normal text-[#6B7280] hover:text-[#1A1A1A] cursor-pointer transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reviewLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-4 mb-8">
                {reviewLoading ? (
                  <div className="animate-pulse flex flex-col gap-4">
                    <div className="h-32 bg-[#F9F9F9] rounded-xl border border-[#E4E4E7]"></div>
                    <div className="h-32 bg-[#F9F9F9] rounded-xl border border-[#E4E4E7]"></div>
                  </div>
                ) : reviews.map((reviewText, idx) => {
                  const isCopied = copySuccess === idx;
                  const labels = ["Top Pick", "Personal Touch", "Highlight"];
                  const label = labels[idx % labels.length];
                  
                  return (
                    <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border border-[#E4E4E7] transition-all hover:border-[#D4A574] hover:shadow-lg hover:shadow-[#D4A574]/10">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.5px] text-[#D4A574] mb-3">
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
                          className={`flex items-center gap-1.5 px-5 py-2.5 border rounded-full text-[13px] font-medium cursor-pointer transition-all shadow-sm ${
                            isCopied 
                              ? "bg-[#238A4B] border-[#238A4B] text-white" 
                              : "bg-[#1A1A1A] border-[#1A1A1A] text-white hover:bg-[#2C2C2C] hover:border-[#2C2C2C] active:scale-[0.98]"
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
              </motion.div>

              {/* Customize Section */}
              <motion.div variants={itemVariants} className="pt-6 border-t border-[#E4E4E7]">
                <div className="flex items-center gap-2 mb-5">
                  <h4 className="font-['Playfair_Display'] font-medium text-base text-[#1A1A1A]">Adjust Parameters</h4>
                </div>



                {/* Length */}
                <div className="mb-6">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#6B7280] mb-3">Length</span>
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      onClick={() => setLength("shorter")}
                      className={`px-4 py-2 border rounded-full text-[13px] font-normal cursor-pointer transition-all ${length === "shorter" ? "border-[#D4A574] bg-[#FDFBF7] text-[#D4A574] font-medium" : "border-[#E4E4E7] bg-white text-[#6B7280] hover:border-[#A1A1AA] hover:text-[#1A1A1A]"}`}
                    >
                      Concise
                    </button>
                    <button 
                      onClick={() => setLength("longer")}
                      className={`px-4 py-2 border rounded-full text-[13px] font-normal cursor-pointer transition-all ${length === "longer" ? "border-[#D4A574] bg-[#FDFBF7] text-[#D4A574] font-medium" : "border-[#E4E4E7] bg-white text-[#6B7280] hover:border-[#A1A1AA] hover:text-[#1A1A1A]"}`}
                    >
                      Detailed
                    </button>
                  </div>
                </div>

                {/* Tone */}
                <div className="mb-6">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#6B7280] mb-3">Tone</span>
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
                        className={`flex-[1_0_calc(50%-4px)] p-2.5 sm:px-4 sm:py-2 border rounded-xl sm:rounded-full text-[13px] font-normal cursor-pointer transition-all text-left sm:text-center ${tone === t.val ? "border-[#D4A574] bg-[#FDFBF7] text-[#D4A574] font-medium" : "border-[#E4E4E7] bg-white text-[#6B7280] hover:border-[#A1A1AA] hover:text-[#1A1A1A]"}`}
                      >
                        {t.label}
                        <span className="block text-[10px] font-normal opacity-70 mt-0.5">{t.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}

          {/* Footer Area */}
          <div className="mt-8 pt-6 border-t border-[#F4F4F5]">
            {business?.phoneNumber && (
              <div className="flex justify-center mb-6 pb-6 border-b border-[#F4F4F5]">
                <a 
                  href={`tel:${business.phoneNumber}`} 
                  className="flex items-center gap-2 px-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full text-[13px] font-medium text-[#4B5563] hover:text-[#1A1A1A] hover:border-[#D4A574] hover:bg-[#FDFBF7] transition-all shadow-sm group"
                >
                  <Phone className="w-3.5 h-3.5 text-[#D4A574] group-hover:scale-110 transition-transform" />
                  {business.phoneNumber}
                </a>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-semibold text-[#A1A1AA] tracking-[1.5px] uppercase">Powered By</span>
                <span className="text-[11px] font-medium text-[#6B7280]">ReviewFlow AI</span>
              </div>
              <a href="tel:9334947294" className="flex items-center gap-1.5 text-[12px] font-medium text-[#1A1A1A] opacity-50 hover:opacity-100 transition-opacity">
                <MessageSquare className="w-3.5 h-3.5" />
                Support
              </a>
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
              className="bg-[#FDFBF7] rounded-[24px] shadow-2xl border border-white w-full max-w-sm p-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#D4A574]/10 flex items-center justify-center mx-auto mb-5 text-[#D4A574]">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-['Playfair_Display'] text-2xl font-medium text-[#1A1A1A] mb-2">Review Copied!</h3>
              <p className="text-sm text-[#6B7280] mb-8 leading-relaxed">
                Redirecting you to Google automatically to paste your review.
              </p>
              
              <div className="flex flex-col gap-3">
                <a
                  href={business?.reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowPostPopup(false)}
                  className="bg-[#1A1A1A] text-white py-3.5 rounded-full text-[14px] font-medium hover:bg-[#2C2C2C] transition-colors shadow-lg shadow-black/10"
                >
                  Post Manually
                </a>
                <button
                  onClick={() => setShowPostPopup(false)}
                  className="text-[13px] text-[#A1A1AA] hover:text-[#1A1A1A] font-medium transition-colors cursor-pointer py-2"
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
