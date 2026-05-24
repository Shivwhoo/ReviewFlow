"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Loader2,
  Tag,
  HelpCircle,
  Undo2,
  Check
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ICustomTag {
  name: string;
  emoji: string;
  isActive: boolean;
}

// Preset Emojis for easy clicking
const PRESET_EMOJIS = ["✨", "🍔", "💁", "🏠", "🚗", "🏥", "💈", "🌟", "💼", "🍕", "☕", "💅", "🛠️", "📦", "🛋️", "🥗"];

export default function TagManagerPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [tags, setTags] = useState<ICustomTag[]>([]);
  const [form, setForm] = useState({ name: "", emoji: "✨" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Fetch business settings
  const { data: business, isLoading: settingsLoading } = useQuery({
    queryKey: ["business-settings"],
    queryFn: async () => {
      const res = await fetch("/api/business/settings");
      if (!res.ok) return null;
      const data = await res.json();
      if (!loaded && data.customTags) {
        setTags(data.customTags || []);
        setLoaded(true);
      }
      return data;
    },
    enabled: !!session,
  });

  // Sync state if business settings loads later
  useEffect(() => {
    if (business?.customTags && !loaded) {
      setTags(business.customTags);
      setLoaded(true);
    }
  }, [business, loaded]);

  // PUT mutation to save custom tags
  const saveMutation = useMutation({
    mutationFn: async (updatedTags: ICustomTag[]) => {
      const res = await fetch("/api/business/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customTags: updatedTags }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.details || "Failed to save tags");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["business-settings"], (old: any) => ({
        ...old,
        customTags: data.customTags,
      }));
      setTags(data.customTags || []);
      queryClient.invalidateQueries({ queryKey: ["business-settings"] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeTags = tags.filter((t) => t.isActive !== false);

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const trimmedName = form.name.trim();

    // Check uniqueness among active tags
    const isDuplicate = activeTags.some(
      (t, idx) =>
        t.name.toLowerCase() === trimmedName.toLowerCase() &&
        idx !== editingIndex
    );

    if (isDuplicate) {
      alert("A tag with this name already exists.");
      return;
    }

    if (editingIndex === null) {
      // Create new tag
      if (activeTags.length >= 8) {
        alert("You can define a maximum of 8 active tags.");
        return;
      }
      const newTag: ICustomTag = { name: trimmedName, emoji: form.emoji, isActive: true };
      setTags([...tags, newTag]);
    } else {
      // Update existing tag
      const activeItem = activeTags[editingIndex];
      const actualIdx = tags.findIndex((t) => t === activeItem);

      if (actualIdx !== -1) {
        const updated = [...tags];
        updated[actualIdx] = {
          ...updated[actualIdx],
          name: trimmedName,
          emoji: form.emoji,
        };
        setTags(updated);
      }
      setEditingIndex(null);
    }

    setForm({ name: "", emoji: "✨" });
  };

  const handleEdit = (activeIdx: number) => {
    const activeItem = activeTags[activeIdx];
    setForm({ name: activeItem.name, emoji: activeItem.emoji || "✨" });
    setEditingIndex(activeIdx);
  };

  const handleDelete = (activeIdx: number) => {
    const activeItem = activeTags[activeIdx];
    const actualIdx = tags.findIndex((t) => t === activeItem);

    if (actualIdx !== -1) {
      const updated = [...tags];
      updated[actualIdx] = { ...updated[actualIdx], isActive: false };
      setTags(updated);
    }

    if (editingIndex === activeIdx) {
      setEditingIndex(null);
      setForm({ name: "", emoji: "✨" });
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setForm({ name: "", emoji: "✨" });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activeTags.findIndex((t) => t.name === active.id);
    const newIndex = activeTags.findIndex((t) => t.name === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedActive = arrayMove(activeTags, oldIndex, newIndex);
      const inactiveTags = tags.filter((t) => t.isActive === false);
      setTags([...reorderedActive, ...inactiveTags]);
    }
  };

  const handleSaveAll = () => {
    saveMutation.mutate(tags);
  };

  if (settingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-white/40 text-sm animate-pulse">Loading custom tags...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Custom Tags Manager</h1>
        <p className="text-white/40 mt-1">
          Customize what aspects customers comment on (e.g., "Wait Time", "Value", "Quality"). Max 8 active tags.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Tag Form */}
        <div className="md:col-span-1 bg-glass rounded-2xl p-6 border border-white/5 h-fit">
          <h3 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-violet-400" />
            {editingIndex === null ? "Add Custom Tag" : "Edit Tag"}
          </h3>

          <form onSubmit={handleAddOrUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5">
                Tag Name
              </label>
              <input
                type="text"
                placeholder="e.g. Taste, Service, Hygiene"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                maxLength={25}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 flex justify-between">
                <span>Select Emoji</span>
                <span className="text-xl">{form.emoji}</span>
              </label>
              <input
                type="text"
                placeholder="Type or click preset below"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all mb-3 text-center text-lg animate-fade-in"
                maxLength={4}
              />
              <div className="grid grid-cols-6 gap-1.5 bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm({ ...form, emoji })}
                    className={`text-lg p-1.5 hover:bg-white/10 rounded-lg transition-all cursor-pointer ${
                      form.emoji === emoji ? "bg-white/10 scale-110" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/15 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {editingIndex === null ? "Add Tag" : "Update Tag"}
              </button>
              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium border border-white/10 transition-all cursor-pointer"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Sortable Active Tags List */}
        <div className="md:col-span-2 bg-glass rounded-2xl p-6 border border-white/5 flex flex-col min-h-[300px]">
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-md font-semibold text-white">Active Tags List</h3>
              <p className="text-xs text-white/40 mt-0.5">
                Drag handles to reorder. Custom tags will show on review page.
              </p>
            </div>
            <div className="text-xs text-white/50 font-semibold bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              {activeTags.length} / 8 active
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={activeTags.map((t) => t.name)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 flex-1">
                {activeTags.map((tag, idx) => (
                  <SortableTagItem
                    key={tag.name}
                    id={tag.name}
                    tag={tag}
                    idx={idx}
                    isEditing={editingIndex === idx}
                    onEdit={() => handleEdit(idx)}
                    onDelete={() => handleDelete(idx)}
                  />
                ))}

                {activeTags.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-white/30 border border-dashed border-white/10 rounded-2xl">
                    <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No custom tags set up yet</p>
                    <p className="text-xs text-white/20 mt-1 max-w-xs">
                      Default tags (Food, Service, Ambience, etc.) will fallback on review page. Try creating one!
                    </p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Action Footer */}
          {tags.length > 0 && (
            <div className="mt-6 pt-4 border-t border-white/5 flex justify-end items-center gap-4">
              {saveMutation.isError && (
                <p className="text-xs text-red-400">
                  ❌ {saveMutation.error?.message || "Failed to save"}
                </p>
              )}
              {saveMutation.isSuccess && (
                <p className="text-xs text-emerald-400 flex items-center gap-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Tags saved successfully
                </p>
              )}
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold disabled:opacity-50 transition-all shadow-lg shadow-violet-500/25 cursor-pointer"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Active Tags
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SortableTagItemProps {
  id: string;
  tag: ICustomTag;
  idx: number;
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableTagItem({
  id,
  tag,
  isEditing,
  onEdit,
  onDelete,
}: SortableTagItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3.5 bg-white/5 border rounded-2xl hover:bg-white/[0.08] transition-all ${
        isEditing ? "border-violet-500/50 bg-violet-950/5" : "border-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-white/30 hover:text-white/60 p-1 rounded-lg hover:bg-white/5 transition-all"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xl w-6 h-6 flex items-center justify-center bg-white/5 rounded-lg border border-white/5 shadow-inner">
          {tag.emoji || "✨"}
        </span>
        <span className="text-sm font-semibold text-white">{tag.name}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          className="p-2 text-white/40 hover:text-violet-300 hover:bg-violet-500/10 rounded-xl transition-all cursor-pointer"
          title="Edit tag name & emoji"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
          title="Remove tag"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
