"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, CreditCard, AlertTriangle, Globe, Sparkles, Building, Check, ArrowRight } from "lucide-react";

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 mt-1">Manage your business profile, AI training context, and billing</p>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-px">
        {[
          { id: "profile", label: "Business Profile", icon: Building },
          { id: "ai", label: "AI Training & Context", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all relative border-b-2 -mb-0.5 ${
                isActive 
                  ? "text-violet-400 border-violet-500" 
                  : "text-white/40 border-transparent hover:text-white/70"
              }`}
            >
              <Icon className="w-4 h-4" />
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
            <div className="bg-glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Business Details</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm text-white/50 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1">Google Place ID</label>
                  <input
                    type="text"
                    value={form.googlePlaceId}
                    onChange={(e) => setForm({ ...form, googlePlaceId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1">Default Language</label>
                  <div className="flex gap-2">
                    {[
                      { value: "en", label: "English" },
                      { value: "hi", label: "Hinglish" },
                    ].map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => setForm({ ...form, defaultLanguage: lang.value as "en" | "hi" })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          form.defaultLanguage === lang.value
                            ? "bg-violet-500/20 text-violet-300 border border-violet-400/40"
                            : "bg-white/5 text-white/40 border border-white/10"
                        }`}
                      >
                        <Globe className="w-4 h-4 inline mr-1" />
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => saveMutation.mutate(form)}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-violet-500/15"
                >
                  <Save className="w-4 h-4" />
                  {saveMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
                {saveMutation.isSuccess && (
                  <p className="text-sm text-emerald-400 mt-2">✓ Saved successfully</p>
                )}
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-glass rounded-2xl p-6 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl -z-10" />
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-400" />
                Subscription & Billing
              </h3>
              <p className="text-sm text-white/60 mb-4">
                Current plan:{" "}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 capitalize ml-1.5 border border-violet-500/30">
                  {session?.user?.subscriptionTier || "Free"}
                </span>
              </p>
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-sm text-white/60 leading-relaxed max-w-xl">
                💡 <span className="font-semibold text-white">Offline Billing Model:</span> Subscription tiers and limits are managed offline. To upgrade your plan, request additional location slots, or renew your usage credits, please contact our support team directly at <a href="mailto:support@reviewflow.app" className="text-violet-400 hover:text-violet-300 transition-colors font-medium underline decoration-violet-500/40">support@reviewflow.app</a>.
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" />
                Danger Zone
              </h3>
              <p className="text-sm text-white/40 mb-4">
                Deleting your account will deactivate all QR codes and remove your data. This action cannot be undone.
              </p>
              <button type="button" className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all border border-red-500/30">
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
            <div className="bg-glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Training Parameters</h3>
                  <p className="text-xs text-white/40 mt-1">Configure parameters that train reviews generated for your business</p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Agent Active
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1 font-medium">What makes your business unique?</label>
                    <textarea
                      rows={3}
                      value={form.onboardingAnswers.uniqueFeatures}
                      onChange={(e) => handleAnswersChange("uniqueFeatures", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1 font-medium">Who is your typical customer?</label>
                    <input
                      type="text"
                      value={form.onboardingAnswers.targetCustomer}
                      onChange={(e) => handleAnswersChange("targetCustomer", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1 font-medium">List your top 3 most popular products or services</label>
                    <input
                      type="text"
                      value={form.onboardingAnswers.popularProducts}
                      onChange={(e) => handleAnswersChange("popularProducts", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1 font-medium">What do customers compliment you on?</label>
                    <textarea
                      rows={3}
                      value={form.onboardingAnswers.compliments}
                      onChange={(e) => handleAnswersChange("compliments", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1.5 font-medium">Preferred review tone</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "warm", label: "Warm" },
                        { value: "professional", label: "Professional" },
                        { value: "enthusiastic", label: "Enthusiastic" },
                      ].map((t) => (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => handleAnswersChange("reviewTone", t.value)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            form.onboardingAnswers.reviewTone === t.value
                              ? "bg-violet-500/20 text-violet-300 border-violet-400/40 shadow-md shadow-violet-500/5"
                              : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1 font-medium">
                      Keywords or phrases <span className="text-white/25">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.onboardingAnswers.keywords}
                      onChange={(e) => handleAnswersChange("keywords", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
                    />
                  </div>
                </div>
              </div>

              {/* Display compiled Context string preview */}
              {business?.aiContextPrompt && (
                <div className="mb-6 p-4 rounded-2xl bg-violet-950/15 border border-violet-500/10 text-xs text-white/60 leading-relaxed">
                  <p className="font-bold text-violet-300 mb-1.5 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pre-Compiled AI Agent Prompt Context (Cached)
                  </p>
                  "{business.aiContextPrompt}"
                </div>
              )}

              <button
                type="button"
                onClick={() => saveMutation.mutate(form)}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold disabled:opacity-50 transition-all shadow-md shadow-violet-500/15"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "Training Agent..." : "Update AI Context"}
              </button>
              {saveMutation.isSuccess && (
                <p className="text-sm text-emerald-400 mt-2">✓ AI Context trained successfully</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
