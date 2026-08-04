"use client";
// src/components/post/CommentForm.tsx

import { useState, useTransition, useRef } from "react";
import { createComment } from "@/actions/comments";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

const AVATAR_COLORS = [
  "bg-emerald-600","bg-blue-600","bg-violet-600",
  "bg-rose-500","bg-amber-600","bg-cyan-600",
];
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

interface Props {
  postId:   string;
  username: string | null; // null = not signed in
}

export default function CommentForm({ postId, username }: Props) {
  const [text,      setText]      = useState("");
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Auto-resize textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const submit = () => {
    if (!username) {
      router.push("/sign-in");
      return;
    }
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      setError("Please write at least 10 characters.");
      return;
    }
    if (trimmed.length > 2000) {
      setError("Response is too long (max 2000 characters).");
      return;
    }

    startTransition(async () => {
      const res = await createComment({ text: trimmed, postId });
      if (res?.error) {
        setError(res.error);
      } else {
        setText("");
        setSuccess(true);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        setTimeout(() => setSuccess(false), 4000);
        router.refresh(); // re-fetch comments from server
      }
    });
  };

  const displayName = username ?? "Anonymous";

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`${avatarColor(displayName)} w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5`}
        >
          {displayName[0].toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
            placeholder={
              username
                ? "Share a supportive response… (Ctrl/Cmd + Enter to send)"
                : "Sign in to share a response…"
            }
            disabled={isPending}
            rows={3}
            className={cn(
              "w-full text-sm border rounded-xl p-3 outline-none resize-none leading-relaxed",
              "placeholder-gray-400 text-gray-800 transition-all min-h-[80px]",
              "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
              error ? "border-red-300 bg-red-50/30" : "border-stone-200",
              isPending && "opacity-70 bg-stone-50"
            )}
          />

          {/* Error */}
          {error && (
            <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs">
              <AlertCircle size={12} /> {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-1.5 mt-1.5 text-emerald-700 text-xs font-medium">
              <CheckCircle size={12} /> Your support was shared. 💚
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between mt-2.5 gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 min-w-0">
              <Shield size={11} className="flex-shrink-0" />
              <span className="truncate">
                Posting as <span className="font-medium text-gray-500">{displayName}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {text.length > 0 && (
                <span className={cn("text-xs", text.length > 1800 ? "text-red-400" : "text-gray-400")}>
                  {text.length}/2000
                </span>
              )}
              <button
                onClick={submit}
                disabled={isPending || text.trim().length === 0}
                className={cn(
                  "px-4 py-1.5 text-xs font-semibold rounded-full transition-all",
                  "bg-emerald-700 text-white hover:bg-emerald-800",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                {isPending ? "Sharing…" : "Share Support"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
