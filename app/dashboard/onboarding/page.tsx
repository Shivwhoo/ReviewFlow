"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, Building, Users, Star, MessageSquare } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const [uniqueFeatures, setUniqueFeatures] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [popularProducts, setPopularProducts] = useState("");
  const [compliments, setCompliments] = useState("");
  const [reviewTone, setReviewTone] = useState<"warm" | "professional" | "enthusiastic">("warm");
  const [keywords, setKeywords] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if business settings exist (to pre-populate name & placeId)
  useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const res = await fetch("/api/business/settings");
      if (!res.ok) return null;
      const data = await res.json();
      if (data) {
        if (data.name) setBusinessName(data.name);
        if (data.googlePlaceId) setGooglePlaceId(data.googlePlaceId);
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.onboardingCompleted) {
          router.replace("/dashboard");
        }
      }
      return data;
    },
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: businessName,
        googlePlaceId,
        phoneNumber,
        onboardingAnswers: {
          uniqueFeatures,
          targetCustomer,
          popularProducts,
          compliments,
          reviewTone,
          keywords,
        },
        onboardingCompleted: true,
      };

      const res = await fetch("/api/business/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save onboarding data");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
      router.replace("/dashboard");
    },
  });

  // Step validation
  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {};

    if (step === 1) {
      if (!businessName.trim()) stepErrors.businessName = "Business name is required";
      if (!googlePlaceId.trim()) stepErrors.googlePlaceId = "Google Place ID is required";
      if (!phoneNumber.trim()) stepErrors.phoneNumber = "Phone number is required";
    } else if (step === 2) {
      if (!uniqueFeatures.trim()) stepErrors.uniqueFeatures = "This field is required";
      if (!targetCustomer.trim()) stepErrors.targetCustomer = "Typical customer profile is required";
    } else if (step === 3) {
      if (!popularProducts.trim()) stepErrors.popularProducts = "Popular products/services list is required";
      if (!compliments.trim()) stepErrors.compliments = "Compliments field is required";
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      saveMutation.mutate();
    }
  };

  const steps = [
    { number: 1, label: "Business Details", icon: Building },
    { number: 2, label: "USP & Audience", icon: Users },
    { number: 3, label: "Offerings & Compliments", icon: Star },
    { number: 4, label: "Tone & Keywords", icon: MessageSquare },
  ];

  return (
    <div className="reviewflow-theme flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8 relative">
      {/* Header */}
      <div className="text-center max-w-lg mb-8">
        <div className="w-14 h-14 rounded-2xl bg-[#B0102F] border-2 border-[#2B0E14] shadow-[3px_3px_0_#2B0E14] flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-7 h-7 text-[#C8F04D]" />
        </div>
        <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-[#2B0E14] tracking-tight">
          Train Your AI Agent
        </h1>
        <p className="font-body text-base text-[#2B0E14]/75 mt-2">
          Tell us about your business to generate hyper-personalized, 5-star Google reviews.
        </p>
      </div>

      {/* Card Wrapper */}
      <div className="w-full max-w-2xl bg-[#FFF3EA] border-2 border-[#2B0E14] rounded-3xl p-6 sm:p-9 shadow-[8px_8px_0_#2B0E14] relative">
        
        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-10 relative">
          <div className="absolute top-5 left-4 right-4 h-1 bg-[#2B0E14]/15 -translate-y-1/2 -z-0" />
          <div 
            className="absolute top-5 left-4 h-1 bg-[#2B0E14] -translate-y-1/2 -z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 92}%` }}
          />

          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isActive = currentStep === s.number;

            return (
              <div key={s.number} className="flex flex-col items-center gap-2 relative z-10">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-number text-sm font-bold border-2 border-[#2B0E14] transition-all duration-200 ${
                    isCompleted 
                      ? "bg-[#C8F04D] text-[#2B0E14]"
                      : isActive
                      ? "bg-[#B0102F] text-[#FFF3EA] shadow-[2px_2px_0_#2B0E14] scale-105"
                      : "bg-[#FFF3EA] text-[#2B0E14]/40"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : s.number}
                </div>
                <span className="hidden sm:inline font-label text-[11px] font-bold tracking-wider uppercase text-[#2B0E14]/70">
                  {s.label.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Content Form */}
        <div className="min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
            >
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-headline font-bold text-xl text-[#2B0E14] mb-4">Step 1: Business Details</h3>
                  <div>
                    <label className="block font-label text-sm font-semibold text-[#2B0E14] mb-1.5">Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bella Italia Café"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl bg-white border-2 text-[#2B0E14] font-body text-sm placeholder:text-[#2B0E14]/30 shadow-[2px_2px_0_#2B0E14] focus:outline-none focus:border-[#B0102F] focus:shadow-[3px_3px_0_#B0102F] transition-all ${
                        errors.businessName ? "border-red-600 bg-red-50/50" : "border-[#2B0E14]"
                      }`}
                    />
                    {errors.businessName && <p className="font-body text-xs text-red-600 font-semibold mt-1.5">{errors.businessName}</p>}
                  </div>
                  <div>
                    <label className="block font-label text-sm font-semibold text-[#2B0E14] mb-1.5">Google Place ID</label>
                    <input
                      type="text"
                      placeholder="ChIJN1t_tDeuEmsR..."
                      value={googlePlaceId}
                      onChange={(e) => setGooglePlaceId(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl bg-white border-2 text-[#2B0E14] font-body text-sm placeholder:text-[#2B0E14]/30 shadow-[2px_2px_0_#2B0E14] focus:outline-none focus:border-[#B0102F] focus:shadow-[3px_3px_0_#B0102F] transition-all ${
                        errors.googlePlaceId ? "border-red-600 bg-red-50/50" : "border-[#2B0E14]"
                      }`}
                    />
                    {errors.googlePlaceId && <p className="font-body text-xs text-red-600 font-semibold mt-1.5">{errors.googlePlaceId}</p>}
                    <p className="font-body text-xs text-[#2B0E14]/60 mt-1.5 leading-relaxed">
                      Used to generate your customer redirection link. You can look it up in your Google Business profile settings or Google Maps URL.
                    </p>
                  </div>
                  <div>
                    <label className="block font-label text-sm font-semibold text-[#2B0E14] mb-1.5">Business Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 234 567 8900"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl bg-white border-2 text-[#2B0E14] font-body text-sm placeholder:text-[#2B0E14]/30 shadow-[2px_2px_0_#2B0E14] focus:outline-none focus:border-[#B0102F] focus:shadow-[3px_3px_0_#B0102F] transition-all ${
                        errors.phoneNumber ? "border-red-600 bg-red-50/50" : "border-[#2B0E14]"
                      }`}
                    />
                    {errors.phoneNumber && <p className="font-body text-xs text-red-600 font-semibold mt-1.5">{errors.phoneNumber}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-headline font-bold text-xl text-[#2B0E14] mb-4">Step 2: USP & Audience</h3>
                  <div>
                    <label className="block font-label text-sm font-semibold text-[#2B0E14] mb-1.5">What makes your business unique?</label>
                    <textarea
                      rows={3}
                      placeholder="e.g., Authentic wood-fired pizza recipes from Naples, organic sourdough bases, 24/7 service, and garden seating."
                      value={uniqueFeatures}
                      onChange={(e) => setUniqueFeatures(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl bg-white border-2 text-[#2B0E14] font-body text-sm placeholder:text-[#2B0E14]/30 shadow-[2px_2px_0_#2B0E14] focus:outline-none focus:border-[#B0102F] focus:shadow-[3px_3px_0_#B0102F] transition-all resize-none ${
                        errors.uniqueFeatures ? "border-red-600 bg-red-50/50" : "border-[#2B0E14]"
                      }`}
                    />
                    {errors.uniqueFeatures && <p className="font-body text-xs text-red-600 font-semibold mt-1.5">{errors.uniqueFeatures}</p>}
                  </div>
                  <div>
                    <label className="block font-label text-sm font-semibold text-[#2B0E14] mb-1.5">Who is your typical customer?</label>
                    <input
                      type="text"
                      placeholder="e.g. families, students, remote workers, coffee enthusiasts"
                      value={targetCustomer}
                      onChange={(e) => setTargetCustomer(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl bg-white border-2 text-[#2B0E14] font-body text-sm placeholder:text-[#2B0E14]/30 shadow-[2px_2px_0_#2B0E14] focus:outline-none focus:border-[#B0102F] focus:shadow-[3px_3px_0_#B0102F] transition-all ${
                        errors.targetCustomer ? "border-red-600 bg-red-50/50" : "border-[#2B0E14]"
                      }`}
                    />
                    {errors.targetCustomer && <p className="font-body text-xs text-red-600 font-semibold mt-1.5">{errors.targetCustomer}</p>}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-headline font-bold text-xl text-[#2B0E14] mb-4">Step 3: Offerings & Compliments</h3>
                  <div>
                    <label className="block font-label text-sm font-semibold text-[#2B0E14] mb-1.5">List your top 3 most popular products or services</label>
                    <input
                      type="text"
                      placeholder="e.g., Margherita Pizza, Pistachio Croissant, Specialty Cold Brew"
                      value={popularProducts}
                      onChange={(e) => setPopularProducts(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl bg-white border-2 text-[#2B0E14] font-body text-sm placeholder:text-[#2B0E14]/30 shadow-[2px_2px_0_#2B0E14] focus:outline-none focus:border-[#B0102F] focus:shadow-[3px_3px_0_#B0102F] transition-all ${
                        errors.popularProducts ? "border-red-600 bg-red-50/50" : "border-[#2B0E14]"
                      }`}
                    />
                    {errors.popularProducts && <p className="font-body text-xs text-red-600 font-semibold mt-1.5">{errors.popularProducts}</p>}
                  </div>
                  <div>
                    <label className="block font-label text-sm font-semibold text-[#2B0E14] mb-1.5">What do customers frequently compliment you on?</label>
                    <textarea
                      rows={3}
                      placeholder="e.g., friendly staff who remember your name, extremely fast delivery, clean Instagram-worthy seating layout, relaxing live acoustic music."
                      value={compliments}
                      onChange={(e) => setCompliments(e.target.value)}
                      className={`w-full px-4 py-3 rounded-2xl bg-white border-2 text-[#2B0E14] font-body text-sm placeholder:text-[#2B0E14]/30 shadow-[2px_2px_0_#2B0E14] focus:outline-none focus:border-[#B0102F] focus:shadow-[3px_3px_0_#B0102F] transition-all resize-none ${
                        errors.compliments ? "border-red-600 bg-red-50/50" : "border-[#2B0E14]"
                      }`}
                    />
                    {errors.compliments && <p className="font-body text-xs text-red-600 font-semibold mt-1.5">{errors.compliments}</p>}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-headline font-bold text-xl text-[#2B0E14] mb-4">Step 4: AI Context Tone</h3>
                  <div>
                    <label className="block font-label text-sm font-semibold text-[#2B0E14] mb-2">Preferred review style / tone</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: "warm", label: "Warm & Personal", desc: "Friendly and welcoming" },
                        { value: "professional", label: "Professional & Concise", desc: "Polished and direct" },
                        { value: "enthusiastic", label: "Enthusiastic & Energetic", desc: "Exciting and hyped" },
                      ].map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setReviewTone(t.value as any)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            reviewTone === t.value
                              ? "bg-[#C8F04D] border-[#2B0E14] shadow-[3px_3px_0_#2B0E14] text-[#2B0E14]"
                              : "bg-white border-[#2B0E14]/30 text-[#2B0E14]/80 hover:border-[#2B0E14] hover:bg-[#FFE4D2]/30"
                          }`}
                        >
                          <p className="font-label text-sm font-bold">{t.label}</p>
                          <p className="font-body text-xs text-[#2B0E14]/70 mt-1 leading-normal">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-label text-sm font-semibold text-[#2B0E14] mb-1.5">
                      Target keywords or phrases <span className="text-[#2B0E14]/40 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. cozy atmosphere, fresh ingredients, value for money"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-[#2B0E14] text-[#2B0E14] font-body text-sm placeholder:text-[#2B0E14]/30 shadow-[2px_2px_0_#2B0E14] focus:outline-none focus:border-[#B0102F] focus:shadow-[3px_3px_0_#B0102F] transition-all"
                    />
                    <p className="font-body text-xs text-[#2B0E14]/60 mt-1.5">
                      Our generator will attempt to naturally incorporate these keywords when relevant.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-8 border-t-2 border-[#2B0E14]/15 pt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#2B0E14] border-2 border-[#2B0E14] font-button text-sm font-semibold shadow-[2px_2px_0_#2B0E14] disabled:opacity-40 disabled:pointer-events-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#B0102F] text-[#FFF3EA] border-2 border-[#2B0E14] font-button text-sm font-semibold shadow-[3px_3px_0_#2B0E14] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#2B0E14] transition-all"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#B0102F] text-[#FFF3EA] border-2 border-[#2B0E14] font-button text-sm font-semibold shadow-[3px_3px_0_#2B0E14] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_#2B0E14] transition-all disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                "Training Agent..."
              ) : (
                <>
                  Complete Onboarding
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
