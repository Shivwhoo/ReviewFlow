"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Save, CreditCard, AlertTriangle, Globe } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    googlePlaceId: "",
    defaultLanguage: "en" as "en" | "hi",
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
          defaultLanguage: data.defaultLanguage || "en",
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 mt-1">Manage your business profile and billing</p>
      </div>

      {/* Business Profile */}
      <div className="bg-glass rounded-2xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Business Profile</h3>
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
            <label className="block text-sm text-white/50 mb-1">
              Google Place ID
            </label>
            <input
              type="text"
              value={form.googlePlaceId}
              onChange={(e) =>
                setForm({ ...form, googlePlaceId: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">
              Default Language
            </label>
            <div className="flex gap-2">
              {[
                { value: "en", label: "English" },
                { value: "hi", label: "Hinglish" },
              ].map((lang) => (
                <button
                  key={lang.value}
                  onClick={() =>
                    setForm({
                      ...form,
                      defaultLanguage: lang.value as "en" | "hi",
                    })
                  }
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
            onClick={() => saveMutation.mutate(form)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-violet-500 transition-all"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
          {saveMutation.isSuccess && (
            <p className="text-sm text-emerald-400">✓ Saved successfully</p>
          )}
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-glass rounded-2xl p-6 mb-6 border border-white/5 relative overflow-hidden">
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
          Deleting your account will deactivate all QR codes and remove your
          data. This action cannot be undone.
        </p>
        <button className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all border border-red-500/30">
          Delete Account
        </button>
      </div>
    </div>
  );
}
