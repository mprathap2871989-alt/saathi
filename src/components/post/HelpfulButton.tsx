"use client";
// src/components/post/HelpfulButton.tsx

import { useState, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { togglePostHelpful } from "@/actions/votes";
import { cn } from "@/lib/utils";

interface Props {
  postId:             string;
  initialCount:       number;
  initialUserHelpful: boolean;
}

export default function HelpfulButton({ postId, initialCount, initialUserHelpful }: Props) {
  const [count,       setCount]       = useState(initialCount);
  const [voted,       setVoted]       = useState(initialUserHelpful);
  const [isPending,   startTransition] = useTransition();

  const toggle = () => {
    const next = !voted;
    // Optimistic update
    setVoted(next);
    setCount((c) => (next ? c + 1 : c - 1));

    startTransition(async () => {
      const res = await togglePostHelpful(postId);
      if (!res || "error" in res) {
        // Revert on failure
        setVoted(!next);
        setCount((c) => (next ? c - 1 : c + 1));
      } else {
        setCount(res.helpful);
        setVoted(res.userHelpful);
      }
    });
  };

  const label =
    count === 0
      ? "Mark as helpful"
      : `${count} ${count === 1 ? "person" : "people"} found this helpful`;

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={voted ? "Remove helpful mark" : "Mark as helpful"}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 select-none",
        voted
          ? "bg-amber-500 text-white shadow-sm hover:bg-amber-600"
          : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200",
        isPending && "opacity-60 cursor-not-allowed"
      )}
    >
      <ThumbsUp size={15} className={cn("transition-transform", voted && "scale-110")} />
      <span>{label}</span>
    </button>
  );
}
