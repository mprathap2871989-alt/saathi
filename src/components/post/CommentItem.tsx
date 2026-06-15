"use client";
// src/components/post/CommentItem.tsx
// Fixed: ReportButton is embedded directly — no broken onReport callback needed.

import { useState, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { toggleCommentHelpful } from "@/actions/votes";
import ReportButton from "@/components/post/ReportButton";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-emerald-600","bg-blue-600","bg-violet-600",
  "bg-rose-500","bg-amber-600","bg-cyan-600",
  "bg-pink-600","bg-indigo-600",
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export interface CommentItemProps {
  id:           string;
  postId:       string;
  username:     string;
  text:         string;
  timeAgoStr:   string;
  helpfulCount: number;
}

export default function CommentItem({
  id, postId, username, text, timeAgoStr, helpfulCount,
}: CommentItemProps) {
  const [count,     setCount]     = useState(helpfulCount);
  const [voted,     setVoted]     = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleHelpful = () => {
    const next = !voted;
    setVoted(next);
    setCount((c) => (next ? c + 1 : c - 1));
    startTransition(async () => {
      const res = await toggleCommentHelpful(id, postId);
      if (!res || "error" in res) {
        // revert on error
        setVoted(!next);
        setCount((c) => (next ? c - 1 : c + 1));
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-stone-100 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`${avatarColor(username)} w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
          {username[0].toUpperCase()}
        </div>
        <span className="text-xs font-semibold text-gray-700">{username}</span>
        <span className="text-xs text-gray-400 ml-auto">{timeAgoStr}</span>
      </div>

      {/* Body */}
      <p className="text-sm text-gray-700 leading-relaxed pl-9 whitespace-pre-wrap break-words">
        {text}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-3 pl-9">
        <button
          onClick={handleHelpful}
          disabled={isPending}
          aria-label={voted ? "Remove helpful mark" : "Mark as helpful"}
          className={cn(
            "flex items-center gap-1 text-xs font-medium transition-colors",
            voted ? "text-amber-600" : "text-gray-400 hover:text-amber-600",
            isPending && "opacity-50 cursor-not-allowed"
          )}
        >
          <ThumbsUp size={12} />
          {count > 0 && <span>{count}</span>}
          <span className="ml-0.5">helpful</span>
        </button>

        {/* ReportButton embedded — no external callback needed */}
        <div className="ml-auto">
          <ReportButton
            type="comment"
            targetId={id}
            postId={postId}
            className="text-gray-300 hover:text-red-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
