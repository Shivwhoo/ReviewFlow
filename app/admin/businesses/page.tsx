"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Ban, RefreshCw, Sparkles, QrCode, Link2, ExternalLink, Tag } from "lucide-react";
import TrainingWizard from "@/components/admin/TrainingWizard";
import QRManageModal from "@/components/admin/QRManageModal";
import AdminTagsModal from "@/components/admin/AdminTagsModal";

export default function AdminBusinessesPage() {
  const queryClient = useQueryClient();
  const [trainingUserId, setTrainingUserId] = useState<string | null>(null);
  const [activeQRManageBiz, setActiveQRManageBiz] = useState<any | null>(null);
  const [activeTagsBiz, setActiveTagsBiz] = useState<any | null>(null);

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
      <div className="mb-6 sm:mb-8">
        <h1 className="font-wordmark text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
          Manage businesses
        </h1>
        <p className="mt-1.5 font-body text-[15px] text-[#17120E]/60">
          View and manage all registered businesses
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#17120E]/10 bg-white/70 shadow-[0_8px_20px_-12px_#17120E55]">
        {/* Desktop Table View */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full font-body text-sm">
            <thead>
              <tr className="border-b border-[#17120E]/10">
                <th className="px-4 py-3.5 text-left font-label text-xs font-semibold text-[#17120E]/55">Business</th>
                <th className="px-4 py-3.5 text-left font-label text-xs font-semibold text-[#17120E]/55">Email</th>
                <th className="px-4 py-3.5 text-left font-label text-xs font-semibold text-[#17120E]/55">Plan</th>
                <th className="px-4 py-3.5 text-right font-label text-xs font-semibold text-[#17120E]/55">Credits</th>
                <th className="px-4 py-3.5 text-left font-label text-xs font-semibold text-[#17120E]/55">Status</th>
                <th className="px-4 py-3.5 text-right font-label text-xs font-semibold text-[#17120E]/55">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-5 animate-pulse rounded-full bg-[#17120E]/[0.07]" />
                    </td>
                  </tr>
                ))
              ) : !businesses?.length ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-[#17120E]/50">
                    No businesses registered yet
                  </td>
                </tr>
              ) : (
                businesses.map((biz: any) => (
                  <tr key={biz._id} className="border-b border-[#17120E]/10 transition hover:bg-white">
                    <td className="px-4 py-3 font-semibold text-[#17120E]">
                      <div className="max-w-[220px] truncate">{biz.businessName || "—"}</div>
                      {biz.qrCodes && biz.qrCodes.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {biz.qrCodes.map((qr: string) => (
                            <span
                              key={qr}
                              className="inline-flex items-center gap-1 rounded-full bg-[#17120E]/[0.06] px-2 py-0.5 font-mono text-[11px] font-medium text-[#17120E]/70"
                            >
                              <QrCode className="h-3 w-3" />
                              {qr}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-[#17120E]/60">{biz.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={biz.subscriptionTier}
                        onChange={(e) =>
                          updateTierMutation.mutate({
                            id: biz._id,
                            tier: e.target.value,
                          })
                        }
                        disabled={updateTierMutation.isPending}
                        aria-label={`Plan for ${biz.businessName || biz.email}`}
                        className="cursor-pointer rounded-full border border-[#17120E]/15 bg-white px-3 py-1.5 font-body text-xs font-semibold capitalize text-[#17120E] transition focus:border-[#FF8A1F] focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/30 disabled:opacity-50"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="multi-location">Multi-Location</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right text-[#17120E]/70">{biz.creditsUsedThisMonth}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        biz.isActive !== false
                          ? "bg-[#0B6E4F]/10 text-[#0B6E4F]"
                          : "bg-red-500/10 text-red-600"
                      }`}>
                        {biz.isActive !== false ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setTrainingUserId(biz._id)}
                          aria-label={`Train AI for ${biz.businessName || biz.email}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-[#17120E] hover:text-[#FBF6EC]"
                          title="Train AI / Onboard Business"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                        {biz.qrCodes && biz.qrCodes.length > 0 ? (
                          <a
                            href={`/r/${biz.qrCodes[0]}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`View review page for ${biz.businessName || biz.email}`}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-[#17120E] hover:text-[#FBF6EC]"
                            title="View Review Page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        ) : (
                          <button
                            disabled
                            aria-label="View review page (no QR code assigned yet)"
                            className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full text-[#17120E]/20"
                            title="No QR code assigned yet"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                        {biz.businessId ? (
                          <button
                            onClick={() => setActiveQRManageBiz(biz)}
                            aria-label={`Manage QR codes for ${biz.businessName || biz.email}`}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-[#17120E] hover:text-[#FBF6EC]"
                            title="Link & Manage Assigned QR Codes"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            disabled
                            aria-label="Manage QR codes (onboard business first)"
                            className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full text-[#17120E]/20"
                            title="Please train AI / onboard business first to link QR codes"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTagsBiz(biz)}
                          aria-label={`Manage custom tags for ${biz.businessName || biz.email}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-[#17120E] hover:text-[#FBF6EC]"
                          title="Manage Custom Tags"
                        >
                          <Tag className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => resetCreditsMutation.mutate(biz._id)}
                          disabled={resetCreditsMutation.isPending}
                          aria-label={`Reset monthly credits for ${biz.businessName || biz.email}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-[#17120E] hover:text-[#FBF6EC] disabled:opacity-50"
                          title="Reset Monthly Credits"
                        >
                          <RefreshCw className={`h-4 w-4 ${resetCreditsMutation.isPending ? "animate-spin" : ""}`} />
                        </button>
                        <button
                          onClick={() =>
                            suspendMutation.mutate({
                              id: biz._id,
                              suspend: biz.isActive !== false,
                            })
                          }
                          aria-label={`${biz.isActive !== false ? "Suspend" : "Unsuspend"} ${biz.businessName || biz.email}`}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-red-500/10 hover:text-red-600"
                          title={biz.isActive !== false ? "Suspend" : "Unsuspend"}
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Card List */}
        <div className="divide-y divide-[#17120E]/10 md:hidden">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 p-5">
                <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#17120E]/[0.07]" />
                <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#17120E]/[0.07]" />
                <div className="h-3 w-1/3 animate-pulse rounded-full bg-[#17120E]/[0.07]" />
              </div>
            ))
          ) : !businesses?.length ? (
            <div className="py-14 text-center font-body text-sm text-[#17120E]/50">
              No businesses registered yet
            </div>
          ) : (
            businesses.map((biz: any) => (
              <div key={biz._id} className="space-y-4 p-5 transition hover:bg-white">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-label text-base font-bold leading-tight tracking-tight text-[#17120E]">
                      {biz.businessName || "—"}
                    </h3>
                    <p className="mt-1 truncate font-body text-xs text-[#17120E]/55">{biz.email}</p>
                    {biz.qrCodes && biz.qrCodes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {biz.qrCodes.map((qr: string) => (
                          <span
                            key={qr}
                            className="inline-flex items-center gap-1 rounded-full bg-[#17120E]/[0.06] px-2 py-0.5 font-mono text-[11px] font-medium text-[#17120E]/70"
                          >
                            <QrCode className="h-3 w-3" />
                            {qr}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                    biz.isActive !== false
                      ? "bg-[#0B6E4F]/10 text-[#0B6E4F]"
                      : "bg-red-500/10 text-red-600"
                  }`}>
                    {biz.isActive !== false ? "Active" : "Suspended"}
                  </span>
                </div>

                {/* Sub details row */}
                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#17120E]/10 bg-[#FBF6EC] p-4 font-body text-xs text-[#17120E]/55">
                  <div>
                    <span className="mb-1 block text-xs text-[#17120E]/55">
                      Credits used
                    </span>
                    <span className="font-number text-xl font-extrabold text-[#17120E]">
                      {biz.creditsUsedThisMonth}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <label
                      htmlFor={`tier-${biz._id}`}
                      className="mb-1 block text-xs text-[#17120E]/55"
                    >
                      Subscription tier
                    </label>
                    <select
                      id={`tier-${biz._id}`}
                      value={biz.subscriptionTier}
                      onChange={(e) =>
                        updateTierMutation.mutate({
                          id: biz._id,
                          tier: e.target.value,
                        })
                      }
                      disabled={updateTierMutation.isPending}
                      className="w-full cursor-pointer rounded-full border border-[#17120E]/15 bg-white px-3 py-2.5 font-body text-base font-semibold capitalize text-[#17120E] transition focus:border-[#FF8A1F] focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/30 disabled:opacity-50"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="multi-location">Multi-Location</option>
                    </select>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => setTrainingUserId(biz._id)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#17120E]/15 bg-white px-4 py-2.5 font-button text-xs font-semibold text-[#17120E] transition hover:bg-[#17120E]/8"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Train AI
                  </button>
                  {biz.qrCodes && biz.qrCodes.length > 0 ? (
                    <a
                      href={`/r/${biz.qrCodes[0]}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#17120E]/15 bg-white px-4 py-2.5 font-button text-xs font-semibold text-[#17120E] transition hover:bg-[#17120E]/8"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Page
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex cursor-not-allowed items-center gap-1.5 rounded-full border border-[#17120E]/15 bg-white px-4 py-2.5 font-button text-xs font-semibold text-[#17120E] opacity-40"
                      title="No QR code assigned yet"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Page
                    </button>
                  )}
                  {biz.businessId ? (
                    <button
                      onClick={() => setActiveQRManageBiz(biz)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#17120E]/15 bg-white px-4 py-2.5 font-button text-xs font-semibold text-[#17120E] transition hover:bg-[#17120E]/8"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Manage QRs
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex cursor-not-allowed items-center gap-1.5 rounded-full border border-[#17120E]/15 bg-white px-4 py-2.5 font-button text-xs font-semibold text-[#17120E] opacity-40"
                      title="Onboard business first to link QR codes"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Manage QRs
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTagsBiz(biz)}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#17120E]/15 bg-white px-4 py-2.5 font-button text-xs font-semibold text-[#17120E] transition hover:bg-[#17120E]/8"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    Custom Tags
                  </button>
                  <button
                    onClick={() => resetCreditsMutation.mutate(biz._id)}
                    disabled={resetCreditsMutation.isPending}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#17120E]/15 bg-white px-4 py-2.5 font-button text-xs font-semibold text-[#17120E] transition hover:bg-[#17120E]/8 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${resetCreditsMutation.isPending ? "animate-spin" : ""}`} />
                    Reset Credits
                  </button>
                  <button
                    onClick={() =>
                      suspendMutation.mutate({
                        id: biz._id,
                        suspend: biz.isActive !== false,
                      })
                    }
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border bg-white px-4 py-2.5 font-button text-xs font-semibold transition ${
                      biz.isActive !== false
                        ? "border-red-500/40 text-red-600 hover:bg-red-600 hover:text-white"
                        : "border-[#0B6E4F]/40 text-[#0B6E4F] hover:bg-[#0B6E4F] hover:text-white"
                    }`}
                  >
                    <Ban className="h-3.5 w-3.5" />
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
        {activeTagsBiz && (
          <AdminTagsModal
            userId={activeTagsBiz._id}
            businessName={activeTagsBiz.businessName || "Business"}
            initialTags={activeTagsBiz.customTags || []}
            onClose={() => setActiveTagsBiz(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}