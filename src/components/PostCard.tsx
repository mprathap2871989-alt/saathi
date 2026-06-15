// src/components/PostCard.tsx
// Shared components used across multiple pages.

import Link from "next/link";
import { ThumbsUp, MessageCircle, Clock, Heart, Shield } from "lucide-react";
import { getCategoryById, getCategoryColors } from "@/lib/categories";
import { timeAgo, storyPreview } from "@/lib/utils";

// ─────────────────────────────────────────────
// AVATAR
// Colored circle with username initial. No photos.
// ─────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-emerald-600", "bg-blue-600", "bg-violet-600",
  "bg-rose-500",    "bg-amber-600","bg-cyan-600",
  "bg-pink-600",    "bg-indigo-600",
];

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

type AvatarSize = "sm" | "md" | "lg";

export function Avatar({ username, size = "md" }: { username: string; size?: AvatarSize }) {
  const sizeMap: Record<AvatarSize, string> = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-lg",
  };
  return (
    <div className={`${avatarColor(username)} ${sizeMap[size]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 select-none`}>
      {username[0].toUpperCase()}
    </div>
  );
}

// ─────────────────────────────────────────────
// CATEGORY BADGE
// ─────────────────────────────────────────────
export function CategoryBadge({ categoryId }: { categoryId: string }) {
  const cat = getCategoryById(categoryId);
  const cl  = getCategoryColors(categoryId);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cl.badge}`}>
      {cat.emoji} {cat.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// POST CARD
// ─────────────────────────────────────────────
interface PostCardProps {
  id:           string;
  username:     string;
  categoryId:   string;
  title:        string;
  story:        string;
  helpfulCount: number;
  commentCount: number;
  createdAt:    Date;
}

export function PostCard({
  id, username, categoryId, title, story,
  helpfulCount, commentCount, createdAt,
}: PostCardProps) {
  const cl = getCategoryColors(categoryId);

  return (
    <Link href={`/post/${id}`}
      className={`block bg-white rounded-xl border border-stone-200 border-l-4 ${cl.border} shadow-sm hover:shadow-md transition-all duration-200 p-4 group`}>
      <div className="flex items-start gap-3">
        <Avatar username={username} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">{username}</span>
            <CategoryBadge categoryId={categoryId} />
            <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
              <Clock size={11} /> {timeAgo(createdAt)}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-emerald-800 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {storyPreview(story.split("\n")[0])}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
              <ThumbsUp size={13} /> {helpfulCount} helpful
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <MessageCircle size={13} /> {commentCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────
// CRISIS BANNER
// Shown on all pages. Non-negotiable.
// ─────────────────────────────────────────────
export function CrisisBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm">
      <Heart size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
      <p className="text-amber-800">
        <span className="font-semibold">In crisis or feeling unsafe?</span>{" "}
        Please call iCall:{" "}
        <a href="tel:9152987821" className="font-bold underline hover:no-underline">
          9152987821
        </a>{" "}
        (Mon–Sat, 8am–10pm). You are not alone.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────
export function EmptyState({
  emoji, title, subtitle, action,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-14">
      <span className="text-4xl block mb-3">{emoji}</span>
      <p className="font-semibold text-gray-700">{title}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
