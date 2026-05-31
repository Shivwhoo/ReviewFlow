"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Building,
  Users,
  Star,
  MessageSquare,
  X,
  Loader2,
} from "lucide-react";

interface TrainingWizardProps {
  userId: string;
  initialBusinessData: any;
  onClose: () => void;
}

export default function TrainingWizard({
  userId,
  initialBusinessData,
  onClose,
}: TrainingWizardProps) {
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

  // Initialize form state with existing business details
  useEffect(() => {
    if (initialBusinessData) {
      setBusinessName(initialBusinessData.name || "");
      setGooglePlaceId(initialBusinessData.googlePlaceId || "");
      if (initialBusinessData.onboardingAnswers) {
        setUniqueFeatures(initialBusinessData.onboardingAnswers.uniqueFeatures || "");
        setTargetCustomer(initialBusinessData.onboardingAnswers.targetCustomer || "");
        setPopularProducts(initialBusinessData.onboardingAnswers.popularProducts || "");
        setCompliments(initialBusinessData.onboardingAnswers.compliments || "");
        setReviewTone(initialBusinessData.onboardingAnswers.reviewTone || "warm");
        setKeywords(initialBusinessData.onboardingAnswers.keywords || "");
      }
    }
  }, [initialBusinessData]);

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

      const res = await fetch(`/api/admin/businesses/${userId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save onboarding data");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      onClose();
    },
  });

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

  if (!initialBusinessData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-xl bg-glass border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-white/40 text-sm animate-pulse">Fetching Business Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-glass border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative Orbs inside Modal */}
        <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-violet-600/10 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-fuchsia-600/10 rounded-full blur-[80px] -z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-md mx-auto mb-8 pr-6 pl-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
            Train AI Agent
          </h2>
          <p className="mt-1 text-xs text-white/40">
            Configure target preferences and characteristics for this business.
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 -translate-y-1/2 -z-10 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => {
            const isCompleted = currentStep > s.number;
            const isActive = currentStep === s.number;

            return (
              <div key={s.number} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${
                    isCompleted
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 border-transparent text-white"
                      : isActive
                      ? "bg-[#0f0f1a] border-violet-500 text-violet-400 shadow-md shadow-violet-500/10"
                      : "bg-[#0f0f1a] border-white/10 text-white/40"
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.number}
                </div>
                <span className="hidden sm:inline text-[9px] font-semibold tracking-wide uppercase text-white/40">
                  {s.label.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Content Form */}
        <div className="min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.15 }}
            >
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Step 1: Business Details</h3>
                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Bella Italia Café"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-xs placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all ${
                        errors.businessName ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.businessName && <p className="text-[10px] text-red-400 mt-1">{errors.businessName}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">Google Place ID</label>
                    <input
                      type="text"
                      placeholder="ChIJN1t_tDeuEmsR..."
                      value={googlePlaceId}
                      onChange={(e) => setGooglePlaceId(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-xs placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all ${
                        errors.googlePlaceId ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.googlePlaceId && <p className="text-[10px] text-red-400 mt-1">{errors.googlePlaceId}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Step 2: USP & Audience</h3>
                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">What makes the business unique?</label>
                    <textarea
                      rows={3}
                      placeholder="e.g., Authentic wood-fired pizza recipes, organic sourdough, 24/7 service."
                      value={uniqueFeatures}
                      onChange={(e) => setUniqueFeatures(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-xs placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all resize-none ${
                        errors.uniqueFeatures ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.uniqueFeatures && <p className="text-[10px] text-red-400 mt-1">{errors.uniqueFeatures}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">Who is the typical customer?</label>
                    <input
                      type="text"
                      placeholder="e.g. families, students, remote workers"
                      value={targetCustomer}
                      onChange={(e) => setTargetCustomer(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-xs placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all ${
                        errors.targetCustomer ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.targetCustomer && <p className="text-[10px] text-red-400 mt-1">{errors.targetCustomer}</p>}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Step 3: Offerings & Compliments</h3>
                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">Top 3 most popular products or services</label>
                    <input
                      type="text"
                      placeholder="e.g., Margherita Pizza, Specialty Cold Brew"
                      value={popularProducts}
                      onChange={(e) => setPopularProducts(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-xs placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all ${
                        errors.popularProducts ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.popularProducts && <p className="text-[10px] text-red-400 mt-1">{errors.popularProducts}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">What do customers frequently compliment them on?</label>
                    <textarea
                      rows={3}
                      placeholder="e.g., friendly staff who remember names, extremely fast delivery, clean seating layout."
                      value={compliments}
                      onChange={(e) => setCompliments(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-xs placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all resize-none ${
                        errors.compliments ? "border-red-500/50" : "border-white/10"
                      }`}
                    />
                    {errors.compliments && <p className="text-[10px] text-red-400 mt-1">{errors.compliments}</p>}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Step 4: AI Context Tone</h3>
                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1.5">Preferred review style / tone</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "warm", label: "Warm", desc: "Friendly" },
                        { value: "professional", label: "Professional", desc: "Concise" },
                        { value: "enthusiastic", label: "Enthusiastic", desc: "Hyped" },
                      ].map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setReviewTone(t.value as any)}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            reviewTone === t.value
                              ? "bg-violet-500/20 border-violet-400 text-white shadow-lg shadow-violet-500/10"
                              : "bg-[#0f0f1a]/40 border-white/5 text-white/60 hover:border-white/10 hover:text-white"
                          }`}
                        >
                          <p className="text-xs font-semibold">{t.label}</p>
                          <p className="text-[9px] text-white/40 mt-0.5 leading-normal">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-white/70 mb-1">
                      Target keywords or phrases <span className="text-white/25">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. cozy atmosphere, fresh ingredients, value for money"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition-all"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between mt-6 border-t border-white/5 pt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold transition-all shadow-md shadow-violet-500/10 cursor-pointer"
            >
              Continue
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving Context...
                </>
              ) : (
                <>
                  Train AI Agent
                  <Check className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
