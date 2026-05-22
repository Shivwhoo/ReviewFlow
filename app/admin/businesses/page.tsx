"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Building2, Ban, RefreshCw } from "lucide-react";

export default function AdminBusinessesPage() {
  const queryClient = useQueryClient();

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["admin-businesses"],
    queryFn: async () => {
      const res = await fetch("/api/admin/businesses");
      if (!res.ok) return [];
      return res.json();
    },
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
        <div className="overflow-x-auto">
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
                    <td className="py-3 px-4 text-white font-medium">{biz.businessName || "—"}</td>
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
                        onClick={() => resetCreditsMutation.mutate(biz._id)}
                        disabled={resetCreditsMutation.isPending}
                        className="p-1.5 rounded-lg text-white/30 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
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
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
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
      </div>
    </div>
  );
}
