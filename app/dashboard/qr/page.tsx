"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { QrCode, Download, Plus, Link2, Eye, ArrowRight } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

// text-base on mobile prevents iOS zoom-on-focus; sm:text-sm keeps desktop compact
const INPUT =
  "w-full min-w-0 flex-1 rounded-2xl border border-[#17120E]/12 bg-[#FBF6EC]/70 px-4 py-3 font-body text-base text-[#17120E] placeholder:text-[#17120E]/40 transition focus:border-[#FF8A1F] focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/30 sm:py-2.5 sm:text-sm";

const ICON_BTN =
  "flex h-10 w-10 items-center justify-center rounded-full border border-[#17120E]/10 bg-white text-[#17120E]/60 transition hover:border-[#17120E]/25 hover:bg-[#17120E] hover:text-[#FBF6EC]";

export default function QRManagerPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [claimId, setClaimId] = useState("");
  const [showClaimDialog, setShowClaimDialog] = useState(false);

  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ["business-qr-codes"],
    queryFn: async () => {
      const res = await fetch("/api/business/qr-codes");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session,
  });

  const claimMutation = useMutation({
    mutationFn: async (qrId: string) => {
      const res = await fetch("/api/business/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to claim QR code");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-qr-codes"] });
      setClaimId("");
      setShowClaimDialog(false);
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-wordmark text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
            QR Codes
          </h1>
          <p className="mt-1.5 font-body text-[15px] text-[#17120E]/60">
            Manage and download your QR codes
          </p>
        </div>
        <button
          onClick={() => setShowClaimDialog(true)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#17120E] px-6 py-3 font-button text-sm font-semibold text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99] transition hover:bg-[#0B6E4F] sm:w-auto sm:py-2.5"
        >
          <Plus className="h-4 w-4" />
          Claim QR
        </button>
      </div>

      {/* Claim Dialog */}
      {showClaimDialog && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-12px_#17120E55] sm:p-6"
        >
          <h3 className="mb-1.5 font-label text-lg font-bold tracking-tight text-[#17120E]">
            Claim a QR Code
          </h3>
          <p className="mb-4 font-body text-sm text-[#17120E]/60">
            Enter the QR ID from a pre-printed QR code to link it to your business.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              placeholder="Enter QR ID (e.g., abc123def456)"
              aria-label="QR ID"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={INPUT}
            />
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                onClick={() => setShowClaimDialog(false)}
                className="rounded-full px-6 py-3 font-button text-sm font-semibold text-[#17120E]/70 transition hover:bg-[#17120E]/8 hover:text-[#17120E] sm:py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={() => claimMutation.mutate(claimId)}
                disabled={!claimId || claimMutation.isPending}
                className="rounded-full bg-[#FF8A1F] px-6 py-3 font-button text-sm font-semibold text-[#17120E] shadow-[0_8px_20px_-8px_#FF8A1F] transition hover:bg-[#ff9a3d] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5"
              >
                {claimMutation.isPending ? "Claiming..." : "Claim"}
              </button>
            </div>
          </div>
          {claimMutation.isError && (
            <p role="alert" className="mt-3 font-body text-sm font-semibold text-red-600">
              {(claimMutation.error as Error).message}
            </p>
          )}
        </motion.div>
      )}

      {/* QR Code List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[88px] animate-pulse rounded-3xl bg-[#17120E]/[0.07]" />
          ))}
        </div>
      ) : !qrCodes?.length ? (
        <div className="rounded-3xl border border-dashed border-[#17120E]/20 bg-white/50 px-6 py-14 text-center sm:py-16">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF8A1F]/15">
            <QrCode className="h-7 w-7 text-[#FF8A1F]" />
          </span>
          <p className="font-label text-lg font-bold tracking-tight text-[#17120E]">
            No QR codes yet
          </p>
          <p className="mx-auto mt-1.5 max-w-xs font-body text-sm text-[#17120E]/60">
            Claim a pre-printed QR code or ask your admin to generate one
          </p>
          <button
            onClick={() => setShowClaimDialog(true)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#17120E] px-6 py-3 font-button text-sm font-semibold text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99] transition hover:bg-[#0B6E4F]"
          >
            <Plus className="h-4 w-4" />
            Claim QR
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {qrCodes.map((qr: any) => (
            <motion.div
              key={qr.qrId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-3xl border border-[#17120E]/10 bg-white/70 p-4 shadow-[0_8px_20px_-14px_#17120E55] transition hover:border-[#17120E]/20 hover:bg-white sm:gap-4 sm:p-5"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#17120E]">
                <QrCode className="h-6 w-6 text-[#FF8A1F]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-semibold text-[#17120E]">
                  {qr.qrId}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-body text-xs text-[#17120E]/55">
                  <span className="truncate">{qr.locationName || "No location"}</span>
                  <span className="rounded-full bg-[#17120E]/[0.06] px-2 py-0.5 font-semibold text-[#17120E]/70">
                    {qr.scanCount || 0} scans
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`/r/${qr.qrId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={ICON_BTN}
                  title="Preview"
                  aria-label={`Preview ${qr.qrId}`}
                >
                  <Eye className="h-4 w-4" />
                </a>
                <button
                  className={ICON_BTN}
                  title="Download QR"
                  aria-label={`Download ${qr.qrId}`}
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}