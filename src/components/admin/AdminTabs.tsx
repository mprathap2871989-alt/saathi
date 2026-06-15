"use client";
// src/components/admin/AdminTabs.tsx

import { useState, useTransition } from "react";
import { Trash2, UserX, Eye, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { removePost } from "@/actions/posts";
import { removeComment } from "@/actions/comments";
import { resolveReport } from "@/actions/reports";
import { suspendUser } from "@/actions/user";
import { getCategoryById } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { reasonIsCrisis } from "@/lib/email";
import Link from "next/link";

// ── Serialisable types (no Date objects) ─────
export interface AdminReport {
  id:        string;
  reason:    string;
  createdAt: string;
  reporter:  { username: string };
  post:      { id: string; title: string } | null;
  comment:   { id: string; text: string; postId: string } | null;
}

export interface AdminPost {
  id:           string;
  title:        string;
  username:     string;
  categoryId:   string;
  createdAt:    string;
  helpfulCount: number;
  commentCount: number;
}

export interface AdminUser {
  id:          string;
  username:    string;
  createdAt:   string;
  isSuspended: boolean;
  postCount:   number;
}

interface Props {
  reports: AdminReport[];
  posts:   AdminPost[];
  users:   AdminUser[];
}

type Tab = "reports" | "posts" | "users";

export default function AdminTabs({ reports: initReports, posts: initPosts, users: initUsers }: Props) {
  const [tab,      setTab]      = useState<Tab>("reports");
  const [reports,  setReports]  = useState(initReports);
  const [posts,    setPosts]    = useState(initPosts);
  const [users,    setUsers]    = useState(initUsers);
  const [toast,    setToast]    = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemovePost = (postId: string, reportId?: string) => {
    startTransition(async () => {
      await removePost(postId);
      setPosts((p) => p.filter((x) => x.id !== postId));
      if (reportId) setReports((r) => r.filter((x) => x.id !== reportId));
      showToast("Post removed.");
    });
  };

  const handleRemoveComment = (commentId: string, reportId: string) => {
    startTransition(async () => {
      await removeComment(commentId);
      setReports((r) => r.filter((x) => x.id !== reportId));
      showToast("Comment removed.");
    });
  };

  const handleDismiss = (reportId: string) => {
    startTransition(async () => {
      await resolveReport(reportId);
      setReports((r) => r.filter((x) => x.id !== reportId));
      showToast("Report dismissed.");
    });
  };

  const handleSuspend = (userId: string) => {
    if (!confirm("Suspend this user? They will no longer be able to post.")) return;
    startTransition(async () => {
      await suspendUser(userId);
      setUsers((u) => u.map((x) => x.id === userId ? { ...x, isSuspended: true } : x));
      showToast("User suspended.");
    });
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "reports", label: "Reports",   count: reports.length },
    { id: "posts",   label: "All Posts", count: posts.length   },
    { id: "users",   label: "Users",     count: users.length   },
  ];

  return (
    <div className={cn(isPending && "opacity-60 pointer-events-none")}>
      {/* Tab bar */}
      <div className="flex gap-2 mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors",
              tab === t.id
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-white border border-stone-200 text-gray-600 hover:bg-stone-50"
            )}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-bold",
                tab === t.id
                  ? "bg-white/20 text-white"
                  : t.id === "reports"
                    ? "bg-red-100 text-red-600"
                    : "bg-stone-100 text-gray-500"
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Reports tab ── */}
      {tab === "reports" && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-xl border border-stone-200">
              <CheckCircle size={28} className="mx-auto text-emerald-500 mb-2" />
              <p className="font-semibold text-gray-700">No pending reports</p>
              <p className="text-sm text-gray-400 mt-1">Community looks healthy!</p>
            </div>
          ) : (
            reports.map((r) => {
              const crisis = reasonIsCrisis(r.reason);
              return (
              <div key={r.id} className={cn(
                "rounded-xl border p-4",
                crisis
                  ? "bg-amber-50 border-amber-400 shadow-sm"
                  : "bg-white border-red-200"
              )}>
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle size={16} className={cn(
                    "flex-shrink-0 mt-0.5",
                    crisis ? "text-amber-600" : "text-red-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {crisis && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                          🚨 Crisis
                        </span>
                      )}
                      <span className={cn(
                        "text-xs font-bold uppercase tracking-wide",
                        crisis ? "text-amber-700" : "text-red-600"
                      )}>
                        {r.post ? "Post" : "Comment"} Report
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-0.5">
                        <Clock size={10} /> {r.createdAt}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-0.5">"{r.reason}"</p>
                    <p className="text-xs text-gray-400">
                      Reported by {r.reporter.username}
                    </p>
                    {r.post && (
                      <p className="text-xs text-gray-600 mt-1.5 line-clamp-1">
                        Post: <span className="font-medium">{r.post.title}</span>
                      </p>
                    )}
                    {r.comment && (
                      <p className={cn(
                        "text-xs text-gray-600 mt-1.5 line-clamp-2 rounded-lg px-2 py-1",
                        crisis ? "bg-amber-100/60" : "bg-stone-50"
                      )}>
                        "{r.comment.text}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
                  {r.post && (
                    <>
                      <button
                        onClick={() => handleRemovePost(r.post!.id, r.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={12} /> Remove Post
                      </button>
                      <Link
                        href={`/post/${r.post.id}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 text-gray-600 text-xs rounded-lg hover:bg-stone-50"
                      >
                        <Eye size={12} /> View
                      </Link>
                    </>
                  )}
                  {r.comment && (
                    <>
                      <button
                        onClick={() => handleRemoveComment(r.comment!.id, r.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={12} /> Remove Comment
                      </button>
                      <Link
                        href={`/post/${r.comment.postId}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 text-gray-600 text-xs rounded-lg hover:bg-stone-50"
                      >
                        <Eye size={12} /> View Thread
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => handleDismiss(r.id)}
                    className="px-3 py-1.5 bg-stone-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-stone-200 transition-colors ml-auto"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Posts tab ── */}
      {tab === "posts" && (
        <div className="space-y-2">
          {posts.map((p) => {
            const cat = getCategoryById(p.categoryId);
            return (
              <div key={p.id} className="bg-white rounded-xl border border-stone-200 p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">{p.username}</span>
                    <span className="text-xs bg-stone-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {cat.emoji} {cat.label}
                    </span>
                    <span className="text-xs text-gray-400">{p.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link
                    href={`/post/${p.id}`}
                    target="_blank"
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    <Eye size={14} />
                  </Link>
                  <button
                    onClick={() => handleRemovePost(p.id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
          {posts.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">No posts found.</div>
          )}
        </div>
      )}

      {/* ── Users tab ── */}
      {tab === "users" && (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className={cn(
              "bg-white rounded-xl border p-3 flex items-center gap-3",
              u.isSuspended ? "border-red-200 bg-red-50/30" : "border-stone-200"
            )}>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: "#2d7a52" }}
              >
                {u.username[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{u.username}</p>
                <p className="text-xs text-gray-400">
                  {u.postCount} {u.postCount === 1 ? "post" : "posts"} · joined {u.createdAt}
                  {u.isSuspended && <span className="ml-2 text-red-500 font-medium">· SUSPENDED</span>}
                </p>
              </div>
              {!u.isSuspended && (
                <button
                  onClick={() => handleSuspend(u.id)}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium"
                >
                  <UserX size={13} /> Suspend
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-800 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50">
          <CheckCircle size={15} /> {toast}
        </div>
      )}
    </div>
  );
}
