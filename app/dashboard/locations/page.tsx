"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, QrCode, Pencil } from "lucide-react";

// text-base on mobile stops iOS from zooming into focused inputs; sm:text-sm keeps desktop compact
const INPUT =
  "w-full rounded-2xl border border-[#17120E]/12 bg-[#FBF6EC]/70 px-4 py-3 font-body text-base text-[#17120E] placeholder:text-[#17120E]/40 transition focus:border-[#FF8A1F] focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/30 sm:py-2.5 sm:text-sm";

export default function LocationsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", googlePlaceId: "" });

  const { data: locations, isLoading } = useQuery({
    queryKey: ["business-locations"],
    queryFn: async () => {
      const res = await fetch("/api/business/locations");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/business/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create location");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-locations"] });
      setForm({ name: "", address: "", googlePlaceId: "" });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/business/locations?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-locations"] });
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-wordmark text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
            Locations
          </h1>
          <p className="mt-1.5 font-body text-[15px] text-[#17120E]/60">
            Manage your business locations
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#17120E] px-6 py-3 font-button text-sm font-semibold text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99] transition hover:bg-[#0B6E4F] sm:w-auto sm:py-2.5"
        >
          <Plus className="h-4 w-4" />
          Add location
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-12px_#17120E55] sm:p-6"
        >
          <h3 className="mb-4 font-label text-lg font-bold tracking-tight text-[#17120E]">
            New location
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Location name (e.g., Downtown Branch)"
              aria-label="Location name"
              className={INPUT}
            />
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Address"
              aria-label="Address"
              className={INPUT}
            />
            <input
              type="text"
              value={form.googlePlaceId}
              onChange={(e) =>
                setForm({ ...form, googlePlaceId: e.target.value })
              }
              placeholder="Google Place ID"
              aria-label="Google Place ID"
              className={INPUT}
            />
            <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-full px-6 py-3 font-button text-sm font-semibold text-[#17120E]/70 transition hover:bg-[#17120E]/8 hover:text-[#17120E] sm:py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={
                  !form.name ||
                  !form.address ||
                  !form.googlePlaceId ||
                  createMutation.isPending
                }
                className="rounded-full bg-[#FF8A1F] px-6 py-3 font-button text-sm font-semibold text-[#17120E] shadow-[0_8px_20px_-8px_#FF8A1F] transition hover:bg-[#ff9a3d] disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5"
              >
                {createMutation.isPending ? "Creating..." : "Create location"}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Location List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-[84px] animate-pulse rounded-3xl bg-[#17120E]/[0.07]" />
          ))}
        </div>
      ) : !locations?.length ? (
        <div className="rounded-3xl border border-dashed border-[#17120E]/20 bg-white/50 px-6 py-14 text-center sm:py-16">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF8A1F]/15">
            <MapPin className="h-7 w-7 text-[#FF8A1F]" />
          </span>
          <p className="font-label text-lg font-bold tracking-tight text-[#17120E]">
            No locations yet
          </p>
          <p className="mx-auto mt-1.5 max-w-xs font-body text-sm text-[#17120E]/60">
            Add your first location to start assigning QR codes
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#17120E] px-6 py-3 font-button text-sm font-semibold text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99] transition hover:bg-[#0B6E4F]"
          >
            <Plus className="h-4 w-4" />
            Add location
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {locations.map((loc: any) => (
            <motion.div
              key={loc._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-3xl border border-[#17120E]/10 bg-white/70 p-4 shadow-[0_8px_20px_-14px_#17120E55] transition hover:border-[#17120E]/20 hover:bg-white sm:gap-4 sm:p-5"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B6E4F]/10 sm:h-12 sm:w-12">
                <MapPin className="h-5 w-5 text-[#0B6E4F]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-label text-[15px] font-bold tracking-tight text-[#17120E]">
                  {loc.name}
                </p>
                <p className="truncate font-body text-xs text-[#17120E]/55 sm:text-sm">
                  {loc.address}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="flex items-center gap-1 rounded-full bg-[#17120E]/[0.06] px-2.5 py-1 font-body text-xs font-semibold text-[#17120E]/70">
                  <QrCode className="h-3 w-3" />
                  {loc.qrCount || 0}
                </span>
                <button
                  onClick={() => {
                    if (confirm("Delete this location?"))
                      deleteMutation.mutate(loc._id);
                  }}
                  aria-label={`Delete ${loc.name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-red-500/10 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}