"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, CreditCard, AlertTriangle, Globe, Sparkles, Building, Check, ArrowRight } from "lucide-react";

// text-base on mobile prevents iOS zoom-on-focus; sm:text-sm keeps desktop compact
const INPUT =
  "w-full rounded-2xl border border-[#17120E]/15 bg-white px-4 py-3 font-body text-base text-[#17120E] placeholder:text-[#17120E]/35 transition focus:border-[#FF8A1F] focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/30 sm:py-2.5 sm:text-sm";
const LABEL = "mb-1.5 block font-label text-sm font-semibold text-[#17120E]";
const CARD =
  "rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-12px_#17120E55] sm:p-6";
const CARD_TITLE = "font-label text-lg font-bold tracking-tight text-[#17120E]";
const SAVE_BTN =
  "flex w-full items-center justify-center gap-2 rounded-full bg-[#FF8A1F] px-6 py-3 font-button text-sm font-semibold text-[#17120E] shadow-[0_8px_20px_-8px_#FF8A1F] transition hover:bg-[#ff9a3d] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5";

const pill = (selected: boolean) =>
  `rounded-full border px-4 py-2.5 font-button text-sm font-semibold transition sm:py-2 ${
    selected
      ? "border-[#17120E] bg-[#17120E] text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99]"
      : "border-[#17120E]/15 bg-white text-[#17120E]/70 hover:border-[#17120E]/40 hover:text-[#17120E]"
  }`;

export default function SettingsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "ai">("profile");

  const [form, setForm] = useState({
    name: "",
    googlePlaceId: "",
    phoneNumber: "",
    defaultLanguage: "en" as "en" | "hi",
    onboardingAnswers: {
      uniqueFeatures: "",
      targetCustomer: "",
      popularProducts: "",
      compliments: "",
      reviewTone: "warm" as "warm" | "professional" | "enthusiastic",
      keywords: "",
    },
  });
  const [loaded, setLoaded] = useState(false);

  const { data: business } = useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const res = await fetch("/api/business/settings");
      if (!res.ok) return null;
      const data = await res.json();
      if (!loaded) {
        setForm({
          name: data.name || "",
          googlePlaceId: data.googlePlaceId || "",
          phoneNumber: data.phoneNumber || "",
          defaultLanguage: data.defaultLanguage || "en",
          onboardingAnswers: {
            uniqueFeatures: data.onboardingAnswers?.uniqueFeatures || "",
            targetCustomer: data.onboardingAnswers?.targetCustomer || "",
            popularProducts: data.onboardingAnswers?.popularProducts || "",
            compliments: data.onboardingAnswers?.compliments || "",
            reviewTone: data.onboardingAnswers?.reviewTone || "warm",
            keywords: data.onboardingAnswers?.keywords || "",
          },
        });
        setLoaded(true);
      }
      return data;
    },
    enabled: !!session,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/business/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
    },
  });

  const handleAnswersChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      onboardingAnswers: {
        ...prev.onboardingAnswers,
        [field]: value,
      },
    }));
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-wordmark text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
          Settings
        </h1>
        <p className="mt-1.5 font-body text-[15px] text-[#17120E]/60">
          Manage your business profile, AI training context, and billing
        </p>
      </div>

      {/* Tabs Menu */}
      <div
        className="mb-6 inline-flex max-w-full overflow-x-auto rounded-full border border-[#17120E]/10 bg-[#17120E]/[0.06] p-1"
        role="tablist"
      >
        {[
          { id: "profile", label: "Business Profile", icon: Building },
          { id: "ai", label: "AI Training & Context", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 font-button text-sm font-semibold transition-all sm:py-2 ${
                isActive
                  ? "bg-[#17120E] text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99]"
                  : "text-[#17120E]/60 hover:bg-[#17120E]/8 hover:text-[#17120E]"
              }`}
            >
              <Icon className="hidden h-4 w-4 sm:block" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "profile" ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Business Profile */}
            <div className={CARD}>
              <h3 className={`${CARD_TITLE} mb-4`}>Business Details</h3>
              <div className="max-w-md space-y-4">
                <div>
                  <label htmlFor="s-name" className={LABEL}>Business Name</label>
                  <input
                    id="s-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="s-place" className={LABEL}>Google Place ID</label>
                  <input
                    id="s-place"
                    type="text"
                    value={form.googlePlaceId}
                    onChange={(e) => setForm({ ...form, googlePlaceId: e.target.value })}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label htmlFor="s-phone" className={LABEL}>Phone Number</label>
                  <input
                    id="s-phone"
                    type="text"
                    inputMode="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className={INPUT}
                  />
                </div>
                <div>
                  <p className={LABEL}>Default Language</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "en", label: "English" },
                      { value: "hi", label: "Hinglish" },
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        aria-pressed={form.defaultLanguage === lang.value}
                        onClick={() => setForm({ ...form, defaultLanguage: lang.value as "en" | "hi" })}
                        className={pill(form.defaultLanguage === lang.value)}
                      >
                        <Globe className="mr-1.5 inline h-4 w-4" />
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => saveMutation.mutate(form)}
                    disabled={saveMutation.isPending}
                    className={SAVE_BTN}
                  >
                    <Save className="h-4 w-4" />
                    {saveMutation.isPending ? "Saving..." : "Save Changes"}
                  </button>
                  {saveMutation.isSuccess && (
                    <p role="status" className="mt-3 font-body text-sm font-semibold text-[#0B6E4F]">✓ Saved successfully</p>
                  )}
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="rounded-3xl bg-[#17120E] p-5 text-[#FBF6EC] shadow-[0_16px_40px_-20px_#17120E99] sm:p-6">
              <h3 className="mb-3 flex items-center gap-2 font-label text-lg font-bold tracking-tight">
                <CreditCard className="h-5 w-5 text-[#FF8A1F]" />
                Subscription & Billing
              </h3>
              <p className="mb-4 flex flex-wrap items-center gap-2 font-body text-sm text-[#FBF6EC]/70">
                Current plan:
                <span className="rounded-full bg-[#FF8A1F] px-3 py-0.5 text-xs font-bold capitalize text-[#17120E]">
                  {session?.user?.subscriptionTier || "Free"}
                </span>
              </p>
              <div className="max-w-xl rounded-2xl border border-[#FBF6EC]/10 bg-[#FBF6EC]/[0.06] p-4 font-body text-sm leading-relaxed text-[#FBF6EC]/75">
                💡 <span className="font-semibold text-[#FBF6EC]">Offline Billing Model:</span> Subscription tiers and limits are managed offline. To upgrade your plan, request additional location slots, or renew your usage credits, please contact our support team directly at <a href="mailto:support@reviewflow.app" className="break-all font-semibold text-[#FF8A1F] underline underline-offset-4 transition-colors hover:text-[#ffb066]">support@reviewflow.app</a>.
              </div>
            </div>

            {/* Danger Zone */}
            <div className="rounded-3xl border border-red-500/25 bg-red-500/[0.06] p-5 sm:p-6">
              <h3 className="mb-2 flex items-center gap-2 font-label text-lg font-bold tracking-tight text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </h3>
              <p className="mb-4 font-body text-sm text-[#17120E]/65">
                Deleting your account will deactivate all QR codes and remove your data. This action cannot be undone.
              </p>
              <button type="button" className="w-full rounded-full border border-red-500/40 bg-white px-6 py-3 font-button text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white sm:w-auto sm:py-2.5">
                Delete Account
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* AI Onboarding Customization context form */}
            <div className={CARD}>
              <div className="mb-6 flex flex-col gap-3 border-b border-[#17120E]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className={CARD_TITLE}>AI Training Parameters</h3>
                  <p className="mt-1 font-body text-xs text-[#17120E]/55 sm:text-sm">Configure parameters that train reviews generated for your business</p>
                </div>
                <div className="flex w-fit items-center gap-1.5 rounded-full bg-[#0B6E4F]/10 px-3 py-1.5 font-label text-xs font-bold text-[#0B6E4F]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Agent Active
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="a-unique" className={LABEL}>What makes your business unique?</label>
                    <textarea
                      id="a-unique"
                      rows={3}
                      value={form.onboardingAnswers.uniqueFeatures}
                      onChange={(e) => handleAnswersChange("uniqueFeatures", e.target.value)}
                      className={`${INPUT} resize-none`}
                    />
                  </div>
                  <div>
                    <label htmlFor="a-customer" className={LABEL}>Who is your typical customer?</label>
                    <input
                      id="a-customer"
                      type="text"
                      value={form.onboardingAnswers.targetCustomer}
                      onChange={(e) => handleAnswersChange("targetCustomer", e.target.value)}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <label htmlFor="a-products" className={LABEL}>List your top 3 most popular products or services</label>
                    <input
                      id="a-products"
                      type="text"
                      value={form.onboardingAnswers.popularProducts}
                      onChange={(e) => handleAnswersChange("popularProducts", e.target.value)}
                      className={INPUT}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="a-compliments" className={LABEL}>What do customers compliment you on?</label>
                    <textarea
                      id="a-compliments"
                      rows={3}
                      value={form.onboardingAnswers.compliments}
                      onChange={(e) => handleAnswersChange("compliments", e.target.value)}
                      className={`${INPUT} resize-none`}
                    />
                  </div>
                  <div>
                    <p className={LABEL}>Preferred review tone</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "warm", label: "Warm" },
                        { value: "professional", label: "Professional" },
                        { value: "enthusiastic", label: "Enthusiastic" },
                      ].map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          aria-pressed={form.onboardingAnswers.reviewTone === t.value}
                          onClick={() => handleAnswersChange("reviewTone", t.value)}
                          className={pill(form.onboardingAnswers.reviewTone === t.value)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="a-keywords" className={LABEL}>
                      Keywords or phrases <span className="font-normal text-[#17120E]/45">(Optional)</span>
                    </label>
                    <input
                      id="a-keywords"
                      type="text"
                      value={form.onboardingAnswers.keywords}
                      onChange={(e) => handleAnswersChange("keywords", e.target.value)}
                      className={INPUT}
                    />
                  </div>
                </div>
              </div>

              {/* Display compiled Context string preview */}
              {business?.aiContextPrompt && (
                <div className="mb-6 break-words rounded-2xl border border-[#FF8A1F]/25 bg-[#FF8A1F]/[0.08] p-4 font-body text-xs leading-relaxed text-[#17120E]/70">
                  <p className="mb-1.5 flex items-center gap-1.5 font-label text-xs font-bold text-[#17120E]">
                    <Sparkles className="h-3.5 w-3.5 text-[#FF8A1F]" />
                    Pre-Compiled AI Agent Prompt Context (Cached)
                  </p>
                  "{business.aiContextPrompt}"
                </div>
              )}

              <button
                type="button"
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending}
                className={SAVE_BTN}
              >
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? "Training Agent..." : "Update AI Context"}
              </button>
              {saveMutation.isSuccess && (
                <p role="status" className="mt-3 font-body text-sm font-semibold text-[#0B6E4F]">✓ AI Context trained successfully</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}