"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { QrCode, Download, Plus, Link2, Eye, ArrowRight } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">QR Codes</h1>
          <p className="text-white/40 mt-1">Manage and download your QR codes</p>
        </div>
        <button
          onClick={() => setShowClaimDialog(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Claim QR
        </button>
      </div>

      {/* Claim Dialog */}
      {showClaimDialog && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-glass rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            Claim a QR Code
          </h3>
          <p className="text-sm text-white/40 mb-4">
            Enter the QR ID from a pre-printed QR code to link it to your business.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              placeholder="Enter QR ID (e.g., abc123def456)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <button
              onClick={() => claimMutation.mutate(claimId)}
              disabled={!claimId || claimMutation.isPending}
              className="px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-violet-500 transition-all"
            >
              {claimMutation.isPending ? "Claiming..." : "Claim"}
            </button>
            <button
              onClick={() => setShowClaimDialog(false)}
              className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
          </div>
          {claimMutation.isError && (
            <p className="text-sm text-red-400 mt-2">
              {(claimMutation.error as Error).message}
            </p>
          )}
        </motion.div>
      )}

      {/* QR Code List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !qrCodes?.length ? (
        <div className="text-center py-16 bg-glass rounded-2xl">
          <QrCode className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No QR codes yet</p>
          <p className="text-sm text-white/30 mt-1">
            Claim a pre-printed QR code or ask your admin to generate one
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {qrCodes.map((qr: any) => (
            <motion.div
              key={qr.qrId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-glass rounded-xl hover:bg-white/[0.06] transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white font-mono">
                  {qr.qrId}
                </p>
                <p className="text-xs text-white/40">
                  {qr.locationName || "No location"} · {qr.scanCount || 0} scans
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/r/${qr.qrId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button
                  className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="Download QR"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
