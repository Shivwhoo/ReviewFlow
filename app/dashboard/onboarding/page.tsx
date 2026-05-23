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
        if (data.onboardingCompleted) {
          // If already completed onboarding, redirect to dashboard
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
    { number: 3, label: "Products & Compliments", icon: Star },
    { number: 4, label: "Tone & Keywords", icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-4 py-8 relative overflow-hidden bg-[#0a0a14]">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <div className="text-center max-w-lg mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
          Train Your AI Agent
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Tell us about your business to generate hyper-personalized, 5-star Google reviews.
        </p>
      </div>

      {/* Card Wrapper */}
      <div className="w-full max-w-xl bg-glass border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-10 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 -translate-y-1/2 -z-10 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.number;
            const isActive = currentStep === s.number;

            return (
              <div key={s.number} className="flex flex-col items-center gap-2">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                    isCompleted 
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 border-transparent text-white"
                      : isActive
                      ? "bg-[#0f0f1a] border-violet-500 text-violet-400 shadow-md shadow-violet-500/10"
                      : "bg-[#0f0f1a] border-white/10 text-white/40"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.number}
                </div>
                <span className="hidden sm:inline text-[10px] font-semibold tracking-wide uppercase text-white/40">
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Step 1: Business Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bella Italia Café"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all ${
                        errors.businessName ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.businessName && <p className="text-xs text-red-400 mt-1">{errors.businessName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Google Place ID</label>
                    <input
                      type="text"
                      placeholder="ChIJN1t_tDeuEmsR..."
                      value={googlePlaceId}
                      onChange={(e) => setGooglePlaceId(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all ${
                        errors.googlePlaceId ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.googlePlaceId && <p className="text-xs text-red-400 mt-1">{errors.googlePlaceId}</p>}
                    <p className="text-[11px] text-white/30 mt-1.5 leading-relaxed">
                      Used to generate your customer redirection link. You can look it up in your Google Business profile settings or Google Maps URL.
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Step 2: USP & Audience</h3>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">What makes your business unique?</label>
                    <textarea
                      rows={3}
                      placeholder="e.g., Authentic wood-fired pizza recipes from Naples, organic sourdough bases, 24/7 service, and garden seating."
                      value={uniqueFeatures}
                      onChange={(e) => setUniqueFeatures(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all resize-none ${
                        errors.uniqueFeatures ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.uniqueFeatures && <p className="text-xs text-red-400 mt-1">{errors.uniqueFeatures}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Who is your typical customer?</label>
                    <input
                      type="text"
                      placeholder="e.g. families, students, remote workers, coffee enthusiasts"
                      value={targetCustomer}
                      onChange={(e) => setTargetCustomer(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all ${
                        errors.targetCustomer ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.targetCustomer && <p className="text-xs text-red-400 mt-1">{errors.targetCustomer}</p>}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Step 3: Offerings & Compliments</h3>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">List your top 3 most popular products or services</label>
                    <input
                      type="text"
                      placeholder="e.g., Margherita Pizza, Pistachio Croissant, Specialty Cold Brew"
                      value={popularProducts}
                      onChange={(e) => setPopularProducts(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all ${
                        errors.popularProducts ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.popularProducts && <p className="text-xs text-red-400 mt-1">{errors.popularProducts}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">What do customers frequently compliment you on?</label>
                    <textarea
                      rows={3}
                      placeholder="e.g., friendly staff who remember your name, extremely fast delivery, clean Instagram-worthy seating layout, relaxing live acoustic music."
                      value={compliments}
                      onChange={(e) => setCompliments(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all resize-none ${
                        errors.compliments ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.compliments && <p className="text-xs text-red-400 mt-1">{errors.compliments}</p>}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Step 4: AI Context Tone</h3>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Preferred review style / tone</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { value: "warm", label: "Warm & Personal", desc: "Friendly and welcoming" },
                        { value: "professional", label: "Professional & Concise", desc: "Polished and direct" },
                        { value: "enthusiastic", label: "Enthusiastic & Energetic", desc: "Exciting and hyped" },
                      ].map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setReviewTone(t.value as any)}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            reviewTone === t.value
                              ? "bg-violet-500/20 border-violet-400 text-white shadow-lg shadow-violet-500/10"
                              : "bg-[#0f0f1a]/40 border-white/5 text-white/60 hover:border-white/10 hover:text-white"
                          }`}
                        >
                          <p className="text-xs font-semibold">{t.label}</p>
                          <p className="text-[10px] text-white/40 mt-1 leading-normal">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Target keywords or phrases <span className="text-white/25">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. cozy atmosphere, fresh ingredients, value for money"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                    />
                    <p className="text-[10px] text-white/30 mt-1 px-1">
                      Our generator will attempt to naturally incorporate these keywords when relevant.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between mt-8 border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold transition-all shadow-md shadow-violet-500/10"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
            >
              {saveMutation.isPending ? (
                "Training Agent..."
              ) : (
                <>
                  Complete Onboarding
                  <Check className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
