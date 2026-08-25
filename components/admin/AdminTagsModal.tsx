"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tag, Trash2, Plus, X, Loader2, Save } from "lucide-react";

interface AdminTagsModalProps {
  userId: string;
  businessName: string;
  initialTags: any[];
  onClose: () => void;
}

export default function AdminTagsModal({
  userId,
  businessName,
  initialTags,
  onClose,
}: AdminTagsModalProps) {
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<any[]>(initialTags || []);
  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("✨");

  const saveMutation = useMutation({
    mutationFn: async (updatedTags: any[]) => {
      const res = await fetch(`/api/admin/businesses/${userId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customTags: updatedTags }),
      });
      if (!res.ok) throw new Error("Failed to save tags");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      onClose();
    },
  });

  const handleAdd = () => {
    if (!newTagName.trim()) return;
    const activeCount = tags.filter(t => t.isActive !== false).length;
    if (activeCount >= 8) {
      alert("Max 8 active tags allowed.");
      return;
    }
    const newTag = { name: newTagName.trim(), emoji: newTagEmoji, isActive: true };
    setTags([...tags, newTag]);
    setNewTagName("");
    setNewTagEmoji("✨");
  };

  const handleRemove = (idx: number) => {
    const updated = [...tags];
    updated[idx].isActive = false;
    setTags(updated);
  };

  const activeTags = tags.filter((t) => t.isActive !== false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-glass border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-[150px] h-[150px] bg-fuchsia-600/10 rounded-full blur-[60px] -z-10" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 pr-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-fuchsia-400" />
            Manage Custom Tags
          </h2>
          <p className="text-xs text-white/40 mt-1">
            Assign custom tags for <span className="text-white/70 font-semibold">{businessName}</span>
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tag Name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/40"
              maxLength={25}
            />
            <input
              type="text"
              placeholder="Emoji"
              value={newTagEmoji}
              onChange={(e) => setNewTagEmoji(e.target.value)}
              className="w-16 px-2 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs text-center focus:outline-none focus:ring-1 focus:ring-fuchsia-500/40"
              maxLength={4}
            />
            <button
              onClick={handleAdd}
              className="p-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white transition-all cursor-pointer flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {activeTags.length === 0 ? (
              <p className="text-xs text-white/30 text-center py-4">No active custom tags.</p>
            ) : (
              activeTags.map((tag, idx) => {
                const originalIdx = tags.findIndex(t => t === tag);
                return (
                  <div
                    key={tag.name + originalIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5"
                  >
                    <div className="flex items-center gap-2 text-sm text-white/90">
                      <span>{tag.emoji}</span>
                      <span>{tag.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemove(originalIdx)}
                      className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/5 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => saveMutation.mutate(tags)}
            disabled={saveMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold transition-all shadow-md shadow-fuchsia-500/20 disabled:opacity-50 cursor-pointer"
          >
            {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Tags
          </button>
        </div>
      </motion.div>
    </div>
  );
}
