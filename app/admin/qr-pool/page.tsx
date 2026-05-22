"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { QrCode, Plus, Trash2, Download } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

export default function QRPoolPage() {
  const queryClient = useQueryClient();
  const [batchCount, setBatchCount] = useState(10);
  const [batchName, setBatchName] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);

  const { data: poolStats } = useQuery({
    queryKey: ["admin-qr-pool"],
    queryFn: async () => {
      const res = await fetch("/api/admin/qr-codes/batch");
      if (!res.ok) return { total: 0, assigned: 0, unassigned: 0, qrCodes: [] };
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { count: number; printedBatch?: string }) => {
      const res = await fetch("/api/admin/qr-codes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-qr-pool"] });
      setShowGenerator(false);
      setBatchCount(10);
      setBatchName("");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">QR Pool</h1>
          <p className="text-white/40 mt-1">Generate and manage QR code batches</p>
        </div>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium hover:from-red-400 hover:to-orange-400 transition-all"
        >
          <Plus className="w-4 h-4" />
          Generate Batch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          title="Total QR Codes"
          value={poolStats?.total ?? 0}
          icon={QrCode}
          color="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Assigned"
          value={poolStats?.assigned ?? 0}
          icon={QrCode}
          color="from-emerald-500 to-teal-500"
        />
        <StatsCard
          title="Unassigned"
          value={poolStats?.unassigned ?? 0}
          icon={QrCode}
          color="from-amber-500 to-orange-500"
        />
      </div>

      {/* Generator */}
      {showGenerator && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-glass rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Generate QR Batch</h3>
          <div className="flex flex-wrap gap-3">
            <input
              type="number"
              value={batchCount}
              onChange={(e) => setBatchCount(parseInt(e.target.value) || 10)}
              min={1}
              max={1000}
              placeholder="Count"
              className="w-24 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/40"
            />
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="Batch name (optional)"
              className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            />
            <button
              onClick={() =>
                generateMutation.mutate({
                  count: batchCount,
                  printedBatch: batchName || undefined,
                })
              }
              disabled={generateMutation.isPending}
              className="px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium disabled:opacity-50 hover:bg-red-400 transition-all"
            >
              {generateMutation.isPending
                ? "Generating..."
                : `Generate ${batchCount} QRs`}
            </button>
          </div>
          {generateMutation.isSuccess && (
            <p className="text-sm text-emerald-400 mt-2">
              ✓ Generated {batchCount} QR codes successfully
            </p>
          )}
        </motion.div>
      )}

      {/* Unassigned QR List */}
      <div className="bg-glass rounded-2xl p-6">
        <h3 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wide">
          Unassigned QR Codes
        </h3>
        {!poolStats?.qrCodes?.length ? (
          <p className="text-white/30 text-sm py-4 text-center">
            No unassigned QR codes. Generate a batch above.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {poolStats.qrCodes
              .filter((qr: any) => !qr.assignedToBusinessId)
              .slice(0, 24)
              .map((qr: any) => (
                <div
                  key={qr.qrId}
                  className="p-3 rounded-xl bg-white/5 text-center"
                >
                  <p className="text-xs font-mono text-white/60 truncate">
                    {qr.qrId}
                  </p>
                  {qr.printedBatch && (
                    <p className="text-[10px] text-white/30 mt-1">
                      {qr.printedBatch}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
