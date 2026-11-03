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
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-wordmark text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
            QR pool
          </h1>
          <p className="mt-1.5 font-body text-[15px] text-[#17120E]/60">
            Generate and manage QR code batches
          </p>
        </div>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          aria-expanded={showGenerator}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#17120E] px-6 py-3 font-button text-sm font-semibold text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99] transition hover:bg-[#0B6E4F] sm:w-auto sm:py-2.5"
        >
          <Plus className="h-4 w-4" />
          Generate Batch
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-3">
        <StatsCard
          title="Total QR Codes"
          value={poolStats?.total ?? 0}
          icon={QrCode}
          color="bg-[#17120E] text-[#FF8A1F]"
        />
        <StatsCard
          title="Assigned"
          value={poolStats?.assigned ?? 0}
          icon={QrCode}
          color="bg-[#0B6E4F] text-[#FBF6EC]"
        />
        <StatsCard
          title="Unassigned"
          value={poolStats?.unassigned ?? 0}
          icon={QrCode}
          color="bg-[#FF8A1F] text-[#17120E]"
        />
      </div>

      {/* Generator */}
      {showGenerator && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-12px_#17120E55] sm:p-6"
        >
          <h3 className="mb-4 font-label text-lg font-bold tracking-tight text-[#17120E]">
            Generate QR batch
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="sm:w-28">
              <label
                htmlFor="batch-count"
                className="mb-1.5 block font-label text-sm font-semibold text-[#17120E]"
              >
                Count
              </label>
              <input
                id="batch-count"
                type="number"
                value={batchCount}
                onChange={(e) => setBatchCount(parseInt(e.target.value) || 10)}
                min={1}
                max={1000}
                placeholder="Count"
                className="w-full rounded-2xl border border-[#17120E]/15 bg-white px-4 py-3 font-body text-base text-[#17120E] transition placeholder:text-[#17120E]/35 focus:border-[#FF8A1F] focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/30 sm:py-2.5 sm:text-sm"
              />
            </div>
            <div className="min-w-0 sm:flex-1">
              <label
                htmlFor="batch-name"
                className="mb-1.5 block font-label text-sm font-semibold text-[#17120E]"
              >
                Batch name
              </label>
              <input
                id="batch-name"
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="Batch name (optional)"
                className="w-full rounded-2xl border border-[#17120E]/15 bg-white px-4 py-3 font-body text-base text-[#17120E] transition placeholder:text-[#17120E]/35 focus:border-[#FF8A1F] focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/30 sm:py-2.5 sm:text-sm"
              />
            </div>
            <div className="flex sm:items-end">
              <button
                onClick={() =>
                  generateMutation.mutate({
                    count: batchCount,
                    printedBatch: batchName || undefined,
                  })
                }
                disabled={generateMutation.isPending}
                className="w-full cursor-pointer rounded-full bg-[#FF8A1F] px-6 py-3 font-button text-sm font-semibold text-[#17120E] shadow-[0_8px_20px_-8px_#FF8A1F] transition hover:bg-[#ff9a3d] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
              >
                {generateMutation.isPending
                  ? "Generating..."
                  : `Generate ${batchCount} QRs`}
              </button>
            </div>
          </div>
          {generateMutation.isSuccess && (
            <p
              role="status"
              className="mt-3 font-body text-sm font-semibold text-[#0B6E4F]"
            >
              ✓ Generated {batchCount} QR codes successfully
            </p>
          )}
        </motion.div>
      )}

      {/* Unassigned QR List */}
      <div className="rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-12px_#17120E55] sm:p-6">
        <h3 className="mb-4 font-label text-lg font-bold tracking-tight text-[#17120E]">
          Unassigned QR codes
        </h3>
        {!poolStats?.qrCodes?.length ? (
          <div className="rounded-3xl border border-dashed border-[#17120E]/20 bg-white/50 px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF8A1F]/15">
              <QrCode className="h-6 w-6 text-[#FF8A1F]" />
            </div>
            <p className="mx-auto max-w-xs font-body text-sm text-[#17120E]/60">
              No unassigned QR codes. Generate a batch above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {poolStats.qrCodes
              .filter((qr: any) => !qr.assignedToBusinessId)
              .slice(0, 24)
              .map((qr: any) => (
                <div
                  key={qr.qrId}
                  className="min-w-0 rounded-2xl border border-[#17120E]/10 bg-[#FBF6EC] p-3 text-center transition hover:bg-white"
                >
                  <p className="truncate font-mono text-xs text-[#17120E]/70">
                    {qr.qrId}
                  </p>
                  {qr.printedBatch && (
                    <p className="mt-1 truncate font-body text-xs text-[#17120E]/50">
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