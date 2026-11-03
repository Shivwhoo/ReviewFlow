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

// text-base on mobile prevents iOS zoom-on-focus; sm:text-sm keeps desktop compact
const INPUT =
  "w-full rounded-2xl border border-[#17120E]/15 bg-white px-4 py-3 font-body text-base text-[#17120E] placeholder:text-[#17120E]/35 transition focus:border-[#FF8A1F] focus:outline-none focus:ring-2 focus:ring-[#FF8A1F]/30 sm:py-2.5 sm:text-sm";
const LABEL = "mb-1.5 block font-label text-sm font-semibold text-[#17120E]";
const CARD =
  "rounded-3xl border border-[#17120E]/10 bg-white/70 p-5 shadow-[0_8px_20px_-12px_#17120E55] sm:p-6";

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
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF8A1F]" />
        <p className="animate-pulse font-body text-sm text-[#17120E]/55">Loading custom tags...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-wordmark text-3xl font-extrabold tracking-tight text-[#17120E] sm:text-4xl">
          Custom Tags Manager
        </h1>
        <p className="mt-1.5 max-w-2xl font-body text-[15px] text-[#17120E]/60">
          Customize what aspects customers comment on (e.g., "Wait Time", "Value", "Quality"). Max 8 active tags.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* Left Side: Tag Form */}
        <div className={`${CARD} h-fit md:col-span-1`}>
          <h3 className="mb-4 flex items-center gap-2 font-label text-base font-bold tracking-tight text-[#17120E]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#17120E]">
              <Tag className="h-4 w-4 text-[#FF8A1F]" />
            </span>
            {editingIndex === null ? "Add Custom Tag" : "Edit Tag"}
          </h3>

          <form onSubmit={handleAddOrUpdate} className="space-y-4">
            <div>
              <label htmlFor="tag-name" className={LABEL}>
                Tag Name
              </label>
              <input
                id="tag-name"
                type="text"
                placeholder="e.g. Taste, Service, Hygiene"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={INPUT}
                maxLength={25}
                required
              />
            </div>

            <div>
              <label htmlFor="tag-emoji" className={`${LABEL} flex items-center justify-between`}>
                <span>Select Emoji</span>
                <span className="text-xl">{form.emoji}</span>
              </label>
              <input
                id="tag-emoji"
                type="text"
                placeholder="Type or click preset below"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                className={`${INPUT} mb-3 text-center`}
                maxLength={4}
              />
              <div className="grid grid-cols-8 gap-1 rounded-2xl border border-[#17120E]/10 bg-[#FBF6EC] p-2 md:grid-cols-6">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setForm({ ...form, emoji })}
                    aria-label={`Use ${emoji}`}
                    aria-pressed={form.emoji === emoji}
                    className={`flex aspect-square cursor-pointer items-center justify-center rounded-xl text-lg transition-all hover:bg-[#17120E]/8 ${
                      form.emoji === emoji ? "bg-white ring-2 ring-[#FF8A1F]" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#17120E] px-5 py-3 font-button text-sm font-semibold text-[#FBF6EC] shadow-[0_8px_20px_-8px_#17120E99] transition hover:bg-[#0B6E4F] sm:py-2.5"
              >
                <Plus className="h-4 w-4" />
                {editingIndex === null ? "Add Tag" : "Update Tag"}
              </button>
              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  aria-label="Cancel editing"
                  className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#17120E]/15 bg-white text-[#17120E]/70 transition hover:bg-[#17120E]/8 sm:h-10 sm:w-10"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Side: Sortable Active Tags List */}
        <div className={`${CARD} flex min-h-[300px] flex-col md:col-span-2`}>
          <div className="mb-5 flex flex-col gap-3 border-b border-[#17120E]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-label text-base font-bold tracking-tight text-[#17120E]">Active Tags List</h3>
              <p className="mt-0.5 font-body text-xs text-[#17120E]/55 sm:text-sm">
                Drag handles to reorder. Custom tags will show on review page.
              </p>
            </div>
            <div className="w-fit shrink-0 rounded-full bg-[#17120E] px-3.5 py-1.5 font-label text-xs font-bold text-[#FBF6EC]">
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
              <div className="flex-1 space-y-2">
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
                  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#17120E]/20 px-4 py-12 text-center">
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF8A1F]/15">
                      <HelpCircle className="h-6 w-6 text-[#FF8A1F]" />
                    </span>
                    <p className="font-label text-sm font-bold text-[#17120E]">No custom tags set up yet</p>
                    <p className="mt-1 max-w-xs font-body text-xs text-[#17120E]/55">
                      Default tags (Food, Service, Ambience, etc.) will fallback on review page. Try creating one!
                    </p>
                  </div>
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Action Footer */}
          {tags.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 border-t border-[#17120E]/10 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
              {saveMutation.isError && (
                <p role="alert" className="font-body text-xs font-semibold text-red-600">
                  ❌ {saveMutation.error?.message || "Failed to save"}
                </p>
              )}
              {saveMutation.isSuccess && (
                <p role="status" className="flex items-center gap-1 font-body text-xs font-semibold text-[#0B6E4F]">
                  <Check className="h-3.5 w-3.5" /> Tags saved successfully
                </p>
              )}
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saveMutation.isPending}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FF8A1F] px-6 py-3 font-button text-sm font-semibold text-[#17120E] shadow-[0_8px_20px_-8px_#FF8A1F] transition hover:bg-[#ff9a3d] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
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
      className={`flex items-center justify-between gap-2 rounded-2xl border bg-white p-2.5 transition-all hover:bg-white sm:p-3 ${
        isEditing
          ? "border-[#FF8A1F] ring-2 ring-[#FF8A1F]/25"
          : "border-[#17120E]/10 hover:border-[#17120E]/25"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Drag handle: touch-none lets a finger drag the row instead of scrolling the page */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${tag.name}`}
          className="flex h-10 w-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-full text-[#17120E]/40 transition hover:bg-[#17120E]/8 hover:text-[#17120E] active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FBF6EC] text-xl">
          {tag.emoji || "✨"}
        </span>
        <span className="truncate font-label text-sm font-bold text-[#17120E]">{tag.name}</span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${tag.name}`}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-[#17120E] hover:text-[#FBF6EC]"
          title="Edit tag name & emoji"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Remove ${tag.name}`}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[#17120E]/45 transition hover:bg-red-500/10 hover:text-red-600"
          title="Remove tag"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}