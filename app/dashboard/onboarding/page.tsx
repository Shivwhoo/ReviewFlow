"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, Building, Users, Star, MessageSquare } from "lucide-react";

// text-base on mobile prevents iOS zoom-on-focus; sm:text-sm keeps desktop compact
const inputCls = (hasError?: boolean) =>
  `w-full rounded-2xl border bg-white px-4 py-3 font-body text-base text-[#17120E] placeholder:text-[#17120E]/35 transition focus:outline-none focus:ring-2 sm:text-sm ${
    hasError
      ? "border-red-500 bg-red-50/60 focus:border-red-500 focus:ring-red-500/25"
      : "border-[#17120E]/15 focus:border-[#FF8A1F] focus:ring-[#FF8A1F]/30"
  }`;

const LABEL = "mb-1.5 block font-label text-sm font-semibold text-[#17120E]";
const ERROR = "mt-1.5 font-body text-xs font-semibold text-red-600";
const HINT = "mt-1.5 font-body text-xs leading-relaxed text-[#17120E]/55";
const STEP_TITLE = "mb-4 font-headline text-xl font-extrabold tracking-tight text-[#17120E]";

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
    <div className="reviewflow-theme relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 max-w-lg text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#17120E] shadow-[0_8px_20px_-8px_#17120E99]">
          <Sparkles className="h-7 w-7 text-[#FF8A1F]" />
        </span>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
          Train Your AI Agent
        </h1>
        <p className="mt-2 font-body text-base text-[#17120E]/65">
          Tell us about your business to generate hyper-personalized, 5-star Google reviews.
        </p>
      </div>

      {/* Card Wrapper */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_16px_40px_-20px_#17120E66] backdrop-blur-sm sm:p-9">
        
        {/* Progress Tracker */}
        <div className="relative mb-3 flex items-center justify-between sm:mb-10">
          <div className="absolute left-5 right-5 top-5 -z-0 h-1 -translate-y-1/2 rounded-full bg-[#17120E]/10" />
          <div 
            className="absolute left-5 top-5 -z-0 h-1 -translate-y-1/2 rounded-full bg-[#FF8A1F] transition-all duration-300"
            style={{ width: `calc((100% - 2.5rem) * ${(currentStep - 1) / (steps.length - 1)})` }}
          />

          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isActive = currentStep === s.number;

            return (
              <div key={s.number} className="relative z-10 flex flex-col items-center gap-2">
                <div 
                  className={`flex h-10 w-10 items-center justify-center rounded-full border font-number text-sm font-bold transition-all duration-200 ${
                    isCompleted 
                      ? "border-[#0B6E4F] bg-[#0B6E4F] text-[#FBF6EC]"
                      : isActive
                      ? "scale-105 border-[#17120E] bg-[#17120E] text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99] ring-4 ring-[#FF8A1F]/30"
                      : "border-[#17120E]/15 bg-[#FBF6EC] text-[#17120E]/40"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? <Check className="h-5 w-5 stroke-[3]" /> : s.number}
                </div>
                <span className={`hidden font-label text-xs font-semibold sm:inline ${isActive ? "text-[#17120E]" : "text-[#17120E]/55"}`}>
                  {s.label.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Current step name on mobile, where the tracker has no labels */}
        <p className="mb-6 text-center font-label text-sm font-semibold text-[#17120E]/60 sm:hidden">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1].label}
        </p>

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
                  <h3 className={STEP_TITLE}>Step 1: Business Details</h3>
                  <div>
                    <label htmlFor="businessName" className={LABEL}>Business Name</label>
                    <input
                      id="businessName"
                      type="text"
                      placeholder="e.g. Bella Italia Café"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      aria-invalid={!!errors.businessName}
                      className={inputCls(!!errors.businessName)}
                    />
                    {errors.businessName && <p className={ERROR}>{errors.businessName}</p>}
                  </div>
                  <div>
                    <label htmlFor="googlePlaceId" className={LABEL}>Google Place ID</label>
                    <input
                      id="googlePlaceId"
                      type="text"
                      placeholder="ChIJN1t_tDeuEmsR..."
                      value={googlePlaceId}
                      onChange={(e) => setGooglePlaceId(e.target.value)}
                      aria-invalid={!!errors.googlePlaceId}
                      className={inputCls(!!errors.googlePlaceId)}
                    />
                    {errors.googlePlaceId && <p className={ERROR}>{errors.googlePlaceId}</p>}
                    <p className={HINT}>
                      Used to generate your customer redirection link. You can look it up in your Google Business profile settings or Google Maps URL.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className={LABEL}>Business Phone Number</label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      placeholder="e.g. +1 234 567 8900"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      aria-invalid={!!errors.phoneNumber}
                      className={inputCls(!!errors.phoneNumber)}
                    />
                    {errors.phoneNumber && <p className={ERROR}>{errors.phoneNumber}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className={STEP_TITLE}>Step 2: USP & Audience</h3>
                  <div>
                    <label htmlFor="uniqueFeatures" className={LABEL}>What makes your business unique?</label>
                    <textarea
                      id="uniqueFeatures"
                      rows={3}
                      placeholder="e.g., Authentic wood-fired pizza recipes from Naples, organic sourdough bases, 24/7 service, and garden seating."
                      value={uniqueFeatures}
                      onChange={(e) => setUniqueFeatures(e.target.value)}
                      aria-invalid={!!errors.uniqueFeatures}
                      className={`${inputCls(!!errors.uniqueFeatures)} resize-none`}
                    />
                    {errors.uniqueFeatures && <p className={ERROR}>{errors.uniqueFeatures}</p>}
                  </div>
                  <div>
                    <label htmlFor="targetCustomer" className={LABEL}>Who is your typical customer?</label>
                    <input
                      id="targetCustomer"
                      type="text"
                      placeholder="e.g. families, students, remote workers, coffee enthusiasts"
                      value={targetCustomer}
                      onChange={(e) => setTargetCustomer(e.target.value)}
                      aria-invalid={!!errors.targetCustomer}
                      className={inputCls(!!errors.targetCustomer)}
                    />
                    {errors.targetCustomer && <p className={ERROR}>{errors.targetCustomer}</p>}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className={STEP_TITLE}>Step 3: Offerings & Compliments</h3>
                  <div>
                    <label htmlFor="popularProducts" className={LABEL}>List your top 3 most popular products or services</label>
                    <input
                      id="popularProducts"
                      type="text"
                      placeholder="e.g., Margherita Pizza, Pistachio Croissant, Specialty Cold Brew"
                      value={popularProducts}
                      onChange={(e) => setPopularProducts(e.target.value)}
                      aria-invalid={!!errors.popularProducts}
                      className={inputCls(!!errors.popularProducts)}
                    />
                    {errors.popularProducts && <p className={ERROR}>{errors.popularProducts}</p>}
                  </div>
                  <div>
                    <label htmlFor="compliments" className={LABEL}>What do customers frequently compliment you on?</label>
                    <textarea
                      id="compliments"
                      rows={3}
                      placeholder="e.g., friendly staff who remember your name, extremely fast delivery, clean Instagram-worthy seating layout, relaxing live acoustic music."
                      value={compliments}
                      onChange={(e) => setCompliments(e.target.value)}
                      aria-invalid={!!errors.compliments}
                      className={`${inputCls(!!errors.compliments)} resize-none`}
                    />
                    {errors.compliments && <p className={ERROR}>{errors.compliments}</p>}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className={STEP_TITLE}>Step 4: AI Context Tone</h3>
                  <div>
                    <p className="mb-2 font-label text-sm font-semibold text-[#17120E]">Preferred review style / tone</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        { value: "warm", label: "Warm & Personal", desc: "Friendly and welcoming" },
                        { value: "professional", label: "Professional & Concise", desc: "Polished and direct" },
                        { value: "enthusiastic", label: "Enthusiastic & Energetic", desc: "Exciting and hyped" },
                      ].map((t) => {
                        const selected = reviewTone === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setReviewTone(t.value as any)}
                            aria-pressed={selected}
                            className={`rounded-2xl border p-4 text-left transition-all ${
                              selected
                                ? "border-[#17120E] bg-[#17120E] text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99]"
                                : "border-[#17120E]/15 bg-white text-[#17120E] hover:border-[#17120E]/40 hover:bg-[#FBF6EC]"
                            }`}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="font-label text-sm font-bold">{t.label}</span>
                              {selected && <Check className="h-4 w-4 shrink-0 text-[#FF8A1F] stroke-[3]" />}
                            </span>
                            <span className={`mt-1 block font-body text-xs leading-normal ${selected ? "text-[#FBF6EC]/70" : "text-[#17120E]/60"}`}>
                              {t.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="keywords" className={LABEL}>
                      Target keywords or phrases <span className="font-normal text-[#17120E]/45">(Optional)</span>
                    </label>
                    <input
                      id="keywords"
                      type="text"
                      placeholder="e.g. cozy atmosphere, fresh ingredients, value for money"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className={inputCls()}
                    />
                    <p className={HINT}>
                      Our generator will attempt to naturally incorporate these keywords when relevant.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#17120E]/10 pt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 rounded-full border border-[#17120E]/15 bg-white px-5 py-3 font-button text-sm font-semibold text-[#17120E] transition hover:bg-[#17120E]/8 disabled:pointer-events-none disabled:opacity-40 sm:py-2.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-full bg-[#17120E] px-6 py-3 font-button text-sm font-semibold text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99] transition hover:bg-[#0B6E4F] sm:py-2.5"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 rounded-full bg-[#FF8A1F] px-5 py-3 font-button text-sm font-semibold text-[#17120E] shadow-[0_8px_20px_-8px_#FF8A1F] transition hover:bg-[#ff9a3d] disabled:cursor-not-allowed disabled:opacity-50 sm:px-7 sm:py-2.5"
            >
              {saveMutation.isPending ? (
                "Training Agent..."
              ) : (
                <>
                  Complete Onboarding
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}