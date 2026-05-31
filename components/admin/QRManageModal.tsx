"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { QrCode, Trash2, Plus, X, Loader2, Link2, Unlink } from "lucide-react";

interface QRManageModalProps {
  businessId: string;
  businessName: string;
  currentlyLinkedQRs: string[];
  onClose: () => void;
}

export default function QRManageModal({
  businessId,
  businessName,
  currentlyLinkedQRs,
  onClose,
}: QRManageModalProps) {
  const queryClient = useQueryClient();
  const [selectedQR, setSelectedQR] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch unassigned QRs from pool
  const { data: poolStats, isLoading: poolLoading } = useQuery({
    queryKey: ["admin-qr-pool"],
    queryFn: async () => {
      const res = await fetch("/api/admin/qr-codes/batch");
      if (!res.ok) return { total: 0, assigned: 0, unassigned: 0, qrCodes: [] };
      return res.json();
    },
  });

  const unassignedQRs =
    poolStats?.qrCodes?.filter((qr: any) => !qr.assignedToBusinessId) || [];

  const assignMutation = useMutation({
    mutationFn: async (qrId: string) => {
      setErrorMsg("");
      const res = await fetch("/api/admin/qr-codes/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrId, businessId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign QR");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-qr-pool"] });
      setSelectedQR("");
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "An error occurred");
    },
  });

  const unassignMutation = useMutation({
    mutationFn: async (qrId: string) => {
      setErrorMsg("");
      const res = await fetch("/api/admin/qr-codes/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrId, businessId: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to unassign QR");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-qr-pool"] });
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "An error occurred");
    },
  });

  const handleLink = () => {
    if (!selectedQR) return;
    assignMutation.mutate(selectedQR);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-glass border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Decorative Orbs */}
        <div className="absolute top-0 left-0 w-[150px] h-[150px] bg-blue-600/10 rounded-full blur-[60px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[150px] h-[150px] bg-violet-600/10 rounded-full blur-[60px] -z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 pr-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-violet-400" />
            Manage QR Codes
          </h2>
          <p className="text-xs text-white/40 mt-1">
            Link or unlink physical QR Codes for <span className="text-white/70 font-semibold">{businessName}</span>
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Currently Linked QRs */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
            Currently Linked ({currentlyLinkedQRs.length})
          </h3>

          {!currentlyLinkedQRs.length ? (
            <div className="p-6 rounded-xl border border-white/5 bg-white/[0.01] text-center">
              <Link2 className="w-6 h-6 text-white/20 mx-auto mb-2" />
              <p className="text-xs text-white/30">No QR codes linked yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {currentlyLinkedQRs.map((qrId) => (
                <div
                  key={qrId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-mono text-white/80 font-medium">
                      {qrId}
                    </span>
                  </div>
                  <button
                    onClick={() => unassignMutation.mutate(qrId)}
                    disabled={unassignMutation.isPending}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer disabled:opacity-30"
                    title="Unlink QR Code"
                  >
                    {unassignMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign New QR */}
        <div className="border-t border-white/5 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
            Link Additional QR Code
          </h3>

          {poolLoading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-white/30">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              Loading available QR pool...
            </div>
          ) : !unassignedQRs.length ? (
            <p className="text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3.5 leading-normal">
              ⚠️ No unassigned QR codes available in the pool. Generate more inside the **QR Pool** portal first.
            </p>
          ) : (
            <div className="flex gap-2">
              <select
                value={selectedQR}
                onChange={(e) => setSelectedQR(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="" className="bg-zinc-950 text-white">Select a QR code...</option>
                {unassignedQRs.map((qr: any) => (
                  <option
                    key={qr.qrId}
                    value={qr.qrId}
                    className="bg-zinc-950 text-white font-mono"
                  >
                    {qr.qrId} {qr.printedBatch ? `(${qr.printedBatch})` : ""}
                  </option>
                ))}
              </select>

              <button
                onClick={handleLink}
                disabled={!selectedQR || assignMutation.isPending}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-lg shadow-violet-500/10"
              >
                {assignMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Link
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
