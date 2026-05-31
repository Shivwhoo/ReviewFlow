"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Ban, RefreshCw, Sparkles, QrCode, Link2 } from "lucide-react";
import TrainingWizard from "@/components/admin/TrainingWizard";
import QRManageModal from "@/components/admin/QRManageModal";

export default function AdminBusinessesPage() {
  const queryClient = useQueryClient();
  const [trainingUserId, setTrainingUserId] = useState<string | null>(null);
  const [activeQRManageBiz, setActiveQRManageBiz] = useState<any | null>(null);

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/businesses");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: trainingBusiness } = useQuery({
    queryKey: ["admin-business-settings", trainingUserId],
    queryFn: async () => {
      if (!trainingUserId) return null;
      const res = await fetch(`/api/admin/businesses/${trainingUserId}/settings`);
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
    enabled: !!trainingUserId,
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
      const res = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: suspend ? "suspend" : "unsuspend" }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
  });

  const updateTierMutation = useMutation({
    mutationFn: async ({ id, tier }: { id: string; tier: string }) => {
      const res = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "update-tier", subscriptionTier: tier }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
  });

  const resetCreditsMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/admin/businesses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reset-credits" }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Manage Businesses</h1>
        <p className="text-white/40 mt-1">View and manage all registered businesses</p>
      </div>

      <div className="bg-glass rounded-2xl overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left py-3 px-4 text-white/40 font-medium">Business</th>
                <th className="text-left py-3 px-4 text-white/40 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-white/40 font-medium">Plan</th>
                <th className="text-right py-3 px-4 text-white/40 font-medium">Credits</th>
                <th className="text-left py-3 px-4 text-white/40 font-medium">Status</th>
                <th className="text-right py-3 px-4 text-white/40 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : !businesses?.length ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-white/30">
                    No businesses registered yet
                  </td>
                </tr>
              ) : (
                businesses.map((biz: any) => (
                  <tr key={biz._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-white font-medium">
                      <div>{biz.businessName || "—"}</div>
                      {biz.qrCodes && biz.qrCodes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {biz.qrCodes.map((qr: string) => (
                            <span
                              key={qr}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-mono text-violet-300"
                            >
                              <QrCode className="w-2.5 h-2.5" />
                              {qr}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-white/50">{biz.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={biz.subscriptionTier}
                        onChange={(e) =>
                          updateTierMutation.mutate({
                            id: biz._id,
                            tier: e.target.value,
                          })
                        }
                        disabled={updateTierMutation.isPending}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500 capitalize cursor-pointer"
                      >
                        <option value="free" className="bg-zinc-900 text-white">Free</option>
                        <option value="pro" className="bg-zinc-900 text-white">Pro</option>
                        <option value="multi-location" className="bg-zinc-900 text-white">Multi-Location</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right text-white/50">{biz.creditsUsedThisMonth}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        biz.isActive !== false
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}>
                        {biz.isActive !== false ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setTrainingUserId(biz._id)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
                        title="Train AI / Onboard Business"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      {biz.businessId ? (
                        <button
                          onClick={() => setActiveQRManageBiz(biz)}
                          className="p-1.5 rounded-lg text-white/30 hover:text-blue-400 hover:bg-blue-500/10 transition-all cursor-pointer"
                          title="Link & Manage Assigned QR Codes"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="p-1.5 rounded-lg text-white/10 cursor-not-allowed"
                          title="Please train AI / onboard business first to link QR codes"
                        >
                          <QrCode className="w-4 h-4 opacity-30" />
                        </button>
                      )}
                      <button
                        onClick={() => resetCreditsMutation.mutate(biz._id)}
                        disabled={resetCreditsMutation.isPending}
                        className="p-1.5 rounded-lg text-white/30 hover:text-violet-400 hover:bg-violet-500/10 transition-all cursor-pointer"
                        title="Reset Monthly Credits"
                      >
                        <RefreshCw className={`w-4 h-4 ${resetCreditsMutation.isPending ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        onClick={() =>
                          suspendMutation.mutate({
                            id: biz._id,
                            suspend: biz.isActive !== false,
                          })
                        }
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                        title={biz.isActive !== false ? "Suspend" : "Unsuspend"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List */}
        <div className="md:hidden divide-y divide-white/5">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 space-y-3">
                <div className="h-4 bg-white/5 rounded animate-pulse w-2/3" />
                <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-white/5 rounded animate-pulse w-1/3" />
              </div>
            ))
          ) : !businesses?.length ? (
            <div className="py-12 text-center text-white/30 text-sm">
              No businesses registered yet
            </div>
          ) : (
            businesses.map((biz: any) => (
              <div key={biz._id} className="p-5 space-y-4 hover:bg-white/[0.01] transition-all">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white text-base leading-tight truncate">
                      {biz.businessName || "—"}
                    </h3>
                    <p className="text-xs text-white/40 mt-1 font-mono truncate">{biz.email}</p>
                    {biz.qrCodes && biz.qrCodes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {biz.qrCodes.map((qr: string) => (
                          <span
                            key={qr}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-mono text-violet-300"
                          >
                            <QrCode className="w-2.5 h-2.5" />
                            {qr}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    biz.isActive !== false
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}>
                    {biz.isActive !== false ? "Active" : "Suspended"}
                  </span>
                </div>

                {/* Sub details row */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5 text-xs text-white/50">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-white/30 font-bold mb-1">
                      Credits Used
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {biz.creditsUsedThisMonth}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-white/30 font-bold mb-1">
                      Subscription Tier
                    </span>
                    <select
                      value={biz.subscriptionTier}
                      onChange={(e) =>
                        updateTierMutation.mutate({
                          id: biz._id,
                          tier: e.target.value,
                        })
                      }
                      disabled={updateTierMutation.isPending}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500 capitalize cursor-pointer w-full"
                    >
                      <option value="free" className="bg-zinc-900 text-white">Free</option>
                      <option value="pro" className="bg-zinc-900 text-white">Pro</option>
                      <option value="multi-location" className="bg-zinc-900 text-white">Multi-Location</option>
                    </select>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setTrainingUserId(biz._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold text-white/70 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Train AI
                  </button>
                  {biz.businessId ? (
                    <button
                      onClick={() => setActiveQRManageBiz(biz)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold text-white/70 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Manage QRs
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/5 text-xs font-semibold text-white/20 cursor-not-allowed opacity-40"
                      title="Onboard business first to link QR codes"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      Manage QRs
                    </button>
                  )}
                  <button
                    onClick={() => resetCreditsMutation.mutate(biz._id)}
                    disabled={resetCreditsMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-xs font-semibold text-white/70 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resetCreditsMutation.isPending ? "animate-spin" : ""}`} />
                    Reset Credits
                  </button>
                  <button
                    onClick={() =>
                      suspendMutation.mutate({
                        id: biz._id,
                        suspend: biz.isActive !== false,
                      })
                    }
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      biz.isActive !== false
                        ? "border-red-500/20 text-red-400 hover:bg-red-500/10"
                        : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {biz.isActive !== false ? "Suspend" : "Unsuspend"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <AnimatePresence>
        {trainingUserId && (
          <TrainingWizard
            userId={trainingUserId}
            initialBusinessData={trainingBusiness}
            onClose={() => setTrainingUserId(null)}
          />
        )}
        {activeQRManageBiz && (
          <QRManageModal
            businessId={activeQRManageBiz.businessId}
            businessName={activeQRManageBiz.businessName}
            currentlyLinkedQRs={activeQRManageBiz.qrCodes || []}
            onClose={() => setActiveQRManageBiz(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
