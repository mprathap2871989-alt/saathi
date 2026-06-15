"use client";
// src/components/profile/UsernameEditor.tsx

import { useState, useTransition } from "react";
import { Pencil, Check, X, AlertCircle } from "lucide-react";
import { updateUsername } from "@/actions/user";
import { cn } from "@/lib/utils";

interface Props { currentUsername: string; }

export default function UsernameEditor({ currentUsername }: Props) {
  const [editing,   setEditing]   = useState(false);
  const [value,     setValue]     = useState(currentUsername);
  const [saved,     setSaved]     = useState(currentUsername);
  const [error,     setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const save = () => {
    const trimmed = value.trim();
    if (trimmed === saved) { setEditing(false); return; }
    if (trimmed.length < 3 || trimmed.length > 30) {
      setError("Username must be 3–30 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("Only letters, numbers, and underscores allowed.");
      return;
    }

    startTransition(async () => {
      const res = await updateUsername(trimmed);
      if (res?.error) {
        setError(res.error);
      } else {
        setSaved(trimmed);
        setEditing(false);
        setError(null);
      }
    });
  };

  const cancel = () => {
    setValue(saved);
    setError(null);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900 text-lg">{saved}</span>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
        >
          <Pencil size={12} /> Customise
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          maxLength={30}
          className={cn(
            "text-sm font-semibold border rounded-lg px-3 py-1.5 outline-none w-48",
            "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
            error ? "border-red-300" : "border-stone-300"
          )}
        />
        <button
          onClick={save}
          disabled={isPending}
          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg disabled:opacity-40"
        >
          <Check size={16} />
        </button>
        <button
          onClick={cancel}
          className="p-1.5 text-gray-400 hover:bg-stone-100 rounded-lg"
        >
          <X size={16} />
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 text-red-600 text-xs">
          <AlertCircle size={11} /> {error}
        </div>
      )}
      <p className="text-xs text-gray-400">Letters, numbers, underscores · 3–30 chars</p>
    </div>
  );
}
