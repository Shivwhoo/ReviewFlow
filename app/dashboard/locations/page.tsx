"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, QrCode, Pencil } from "lucide-react";

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Locations</h1>
          <p className="text-white/40 mt-1">Manage your business locations</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-medium hover:from-violet-500 hover:to-fuchsia-500 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-glass rounded-2xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">New Location</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Location name (e.g., Downtown Branch)"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Address"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <input
              type="text"
              value={form.googlePlaceId}
              onChange={(e) =>
                setForm({ ...form, googlePlaceId: e.target.value })
              }
              placeholder="Google Place ID"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <div className="flex gap-3">
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={
                  !form.name ||
                  !form.address ||
                  !form.googlePlaceId ||
                  createMutation.isPending
                }
                className="px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium disabled:opacity-50 hover:bg-violet-500 transition-all"
              >
                {createMutation.isPending ? "Creating..." : "Create Location"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Location List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !locations?.length ? (
        <div className="text-center py-16 bg-glass rounded-2xl">
          <MapPin className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40">No locations yet</p>
          <p className="text-sm text-white/30 mt-1">
            Add your first location to start assigning QR codes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {locations.map((loc: any) => (
            <motion.div
              key={loc._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-glass rounded-xl hover:bg-white/[0.06] transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{loc.name}</p>
                <p className="text-xs text-white/40 truncate">{loc.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30 flex items-center gap-1">
                  <QrCode className="w-3 h-3" />
                  {loc.qrCount || 0}
                </span>
                <button
                  onClick={() => {
                    if (confirm("Delete this location?"))
                      deleteMutation.mutate(loc._id);
                  }}
                  className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
