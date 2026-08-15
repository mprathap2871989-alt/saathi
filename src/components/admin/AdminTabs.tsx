"use client";

// src/components/admin/AdminTabs.tsx

import { useState, useTransition } from "react";
import {
  Trash2,
  UserX,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";

import { removePost } from "@/actions/posts";
import { removeComment } from "@/actions/comments";
import { resolveReport } from "@/actions/reports";
import { suspendUser } from "@/actions/user";
import {
  respondToHelpRequest,
  updateHelpRequestStatus,
} from "@/actions/helpRequests";

import { getCategoryById } from "@/lib/categories";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// SERIALISABLE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminReport {
  id: string;
  reason: string;
  createdAt: string;
  reporter: {
    username: string;
  };
  post: {
    id: string;
    title: string;
  } | null;
  comment: {
    id: string;
    text: string;
    postId: string;
  } | null;
}

export interface AdminPost {
  id: string;
  title: string;
  username: string;
  categoryId: string;
  createdAt: string;
  helpfulCount: number;
  commentCount: number;
}

export interface AdminUser {
  id: string;
  username: string;
  createdAt: string;
  isSuspended: boolean;
  postCount: number;
}

export interface AdminHelpRequest {
  id: string;
  message: string;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  username: string;
  isSuspended: boolean;
  post: {
    id: string;
    title: string;
  } | null;
}

interface Props {
  reports: AdminReport[];
  posts: AdminPost[];
  users: AdminUser[];
  helpRequests: AdminHelpRequest[];
}

type Tab = "reports" | "posts" | "users" | "help";

type Toast = {
  message: string;
  type: "success" | "error";
} | null;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminTabs({
  reports: initReports,
  posts: initPosts,
  users: initUsers,
  helpRequests: initHelpRequests,
}: Props) {
  const [tab, setTab] = useState<Tab>("reports");

  const [reports, setReports] = useState(initReports);
  const [posts, setPosts] = useState(initPosts);
  const [users, setUsers] = useState(initUsers);
  const [helpRequests, setHelpRequests] = useState(initHelpRequests);

  const [toast, setToast] = useState<Toast>(null);

  const [isPending, startTransition] = useTransition();

  // Currently opened help request
  const [selectedHelpRequest, setSelectedHelpRequest] =
    useState<AdminHelpRequest | null>(null);

  // Admin response text
  const [responseText, setResponseText] = useState("");

  // ───────────────────────────────────────────────────────────────────────────
  // TOAST
  // ───────────────────────────────────────────────────────────────────────────

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // ───────────────────────────────────────────────────────────────────────────
  // REMOVE POST
  // ───────────────────────────────────────────────────────────────────────────

  const handleRemovePost = (postId: string, reportId?: string) => {
    startTransition(async () => {
      const removeResult = await removePost(postId);

      if (removeResult?.error) {
        showToast(removeResult.error, "error");
        return;
      }

      if (reportId) {
        const resolveResult = await resolveReport(reportId);

        if (resolveResult?.error) {
          showToast(resolveResult.error, "error");
          return;
        }

        setReports((current) =>
          current.filter((report) => report.id !== reportId)
        );
      }

      setPosts((current) =>
        current.filter((post) => post.id !== postId)
      );

      showToast("Post removed.");
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // REMOVE COMMENT
  // ───────────────────────────────────────────────────────────────────────────

  const handleRemoveComment = (
    commentId: string,
    reportId: string
  ) => {
    startTransition(async () => {
      const removeResult = await removeComment(commentId);

      if (removeResult?.error) {
        showToast(removeResult.error, "error");
        return;
      }

      const resolveResult = await resolveReport(reportId);

      if (resolveResult?.error) {
        showToast(resolveResult.error, "error");
        return;
      }

      setReports((current) =>
        current.filter((report) => report.id !== reportId)
      );

      showToast("Comment removed.");
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // DISMISS REPORT
  // ───────────────────────────────────────────────────────────────────────────

  const handleDismiss = (reportId: string) => {
    startTransition(async () => {
      const result = await resolveReport(reportId);

      if (result?.error) {
        showToast(result.error, "error");
        return;
      }

      setReports((current) =>
        current.filter((report) => report.id !== reportId)
      );

      showToast("Report dismissed.");
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // SUSPEND USER
  // ───────────────────────────────────────────────────────────────────────────

  const handleSuspend = (userId: string) => {
    if (
      !confirm(
        "Suspend this user? They will no longer be able to participate in the community."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await suspendUser(userId);

      if (result?.error) {
        showToast(result.error, "error");
        return;
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? {
                ...user,
                isSuspended: true,
              }
            : user
        )
      );

      // Also update the help request display if this user's
      // request is currently visible.
      setHelpRequests((current) =>
        current.map((request) =>
          request.username ===
          users.find((user) => user.id === userId)?.username
            ? {
                ...request,
                isSuspended: true,
              }
            : request
        )
      );

      showToast("User suspended.");
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // OPEN HELP REQUEST
  // ───────────────────────────────────────────────────────────────────────────

  const handleOpenHelpRequest = (
    request: AdminHelpRequest
  ) => {
    setSelectedHelpRequest(request);
    setResponseText(request.adminResponse ?? "");
  };

  // ───────────────────────────────────────────────────────────────────────────
  // CLOSE HELP REQUEST
  // ───────────────────────────────────────────────────────────────────────────

  const handleCloseHelpRequest = () => {
    setSelectedHelpRequest(null);
    setResponseText("");
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RESPOND TO HELP REQUEST
  // ───────────────────────────────────────────────────────────────────────────

  const handleRespondToHelpRequest = () => {
    if (!selectedHelpRequest) {
      return;
    }

    if (!responseText.trim()) {
      showToast("Please enter a response.", "error");
      return;
    }

    startTransition(async () => {
      const result = await respondToHelpRequest(
        selectedHelpRequest.id,
        responseText
      );

      if (result?.error) {
        showToast(result.error, "error");
        return;
      }

      const updatedRequest: AdminHelpRequest = {
        ...selectedHelpRequest,
        adminResponse: responseText.trim(),
        status: "RESPONDED",
      };

      setHelpRequests((current) =>
        current.map((request) =>
          request.id === selectedHelpRequest.id
            ? updatedRequest
            : request
        )
      );

      setSelectedHelpRequest(updatedRequest);

      showToast("Response sent.");
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // UPDATE HELP REQUEST STATUS
  // ───────────────────────────────────────────────────────────────────────────

  const handleHelpRequestStatus = (
    requestId: string,
    status: "NEW" | "IN_REVIEW" | "RESPONDED" | "CLOSED"
  ) => {
    startTransition(async () => {
      const result = await updateHelpRequestStatus(
        requestId,
        status as Parameters<typeof updateHelpRequestStatus>[1]
      );

      if (result?.error) {
        showToast(result.error, "error");
        return;
      }

      setHelpRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status,
              }
            : request
        )
      );

      if (selectedHelpRequest?.id === requestId) {
        setSelectedHelpRequest((current) =>
          current
            ? {
                ...current,
                status,
              }
            : current
        );
      }

      showToast("Status updated.");
    });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // TABS
  // ───────────────────────────────────────────────────────────────────────────

  const tabs: {
    id: Tab;
    label: string;
    count?: number;
  }[] = [
    {
      id: "reports",
      label: "Reports",
      count: reports.length,
    },
    {
      id: "posts",
      label: "All Posts",
      count: posts.length,
    },
    {
      id: "users",
      label: "Users",
      count: users.length,
    },
    {
      id: "help",
      label: "Help Requests",
      count: helpRequests.filter(
        (request) =>
          request.status === "NEW" ||
          request.status === "IN_REVIEW"
      ).length,
    },
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className={cn(
          isPending && "opacity-60 pointer-events-none"
        )}
      >
        {/* ─────────────────────────────────────────────────────────────────────
            TAB BAR
        ───────────────────────────────────────────────────────────────────── */}

        <div className="flex gap-2 mb-5 flex-wrap">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors",
                tab === item.id
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-white border border-stone-200 text-gray-600 hover:bg-stone-50"
              )}
            >
              {item.id === "help" && (
                <MessageCircle size={14} />
              )}

              {item.label}

              {item.count !== undefined && item.count > 0 && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full font-bold",
                    tab === item.id
                      ? "bg-white/20 text-white"
                      : item.id === "reports"
                        ? "bg-red-100 text-red-600"
                        : item.id === "help"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-stone-100 text-gray-500"
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────────────
            REPORTS TAB
        ───────────────────────────────────────────────────────────────────── */}

        {tab === "reports" && (
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-xl border border-stone-200">
                <CheckCircle
                  size={28}
                  className="mx-auto text-emerald-500 mb-2"
                />

                <p className="font-semibold text-gray-700">
                  No pending reports
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Community looks healthy!
                </p>
              </div>
            ) : (
              reports.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-xl border border-red-200 p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle
                      size={16}
                      className="text-red-500 flex-shrink-0 mt-0.5"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                          {r.post
                            ? "Post"
                            : "Comment"}{" "}
                          Report
                        </span>

                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <Clock size={10} />
                          {r.createdAt}
                        </span>
                      </div>

                      <p className="text-sm font-medium text-gray-800 mb-0.5">
                        "{r.reason}"
                      </p>

                      <p className="text-xs text-gray-400">
                        Reported by {r.reporter.username}
                      </p>

                      {r.post && (
                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-1">
                          Post:{" "}
                          <span className="font-medium">
                            {r.post.title}
                          </span>
                        </p>
                      )}

                      {r.comment && (
                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 bg-stone-50 rounded-lg px-2 py-1">
                          "{r.comment.text}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
                    {r.post && (
                      <>
                        <button
                          onClick={() =>
                            handleRemovePost(
                              r.post!.id,
                              r.id
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={12} />
                          Remove Post
                        </button>

                        <Link
                          href={`/post/${r.post.id}`}
                          target="_blank"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 text-gray-600 text-xs rounded-lg hover:bg-stone-50"
                        >
                          <Eye size={12} />
                          View
                        </Link>
                      </>
                    )}

                    {r.comment && (
                      <>
                        <button
                          onClick={() =>
                            handleRemoveComment(
                              r.comment!.id,
                              r.id
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={12} />
                          Remove Comment
                        </button>

                        <Link
                          href={`/post/${r.comment.postId}`}
                          target="_blank"
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 text-gray-600 text-xs rounded-lg hover:bg-stone-50"
                        >
                          <Eye size={12} />
                          View Thread
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() =>
                        handleDismiss(r.id)
                      }
                      className="px-3 py-1.5 bg-stone-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-stone-200 transition-colors ml-auto"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            POSTS TAB
        ───────────────────────────────────────────────────────────────────── */}

        {tab === "posts" && (
          <div className="space-y-2">
            {posts.map((p) => {
              const cat = getCategoryById(p.categoryId);

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-stone-200 p-3 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {p.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-500">
                        {p.username}
                      </span>

                      <span className="text-xs bg-stone-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {cat.emoji} {cat.label}
                      </span>

                      <span className="text-xs text-gray-400">
                        {p.createdAt}
                      </span>
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
                      onClick={() =>
                        handleRemovePost(p.id)
                      }
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}

            {posts.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                No posts found.
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            USERS TAB
        ───────────────────────────────────────────────────────────────────── */}

        {tab === "users" && (
          <div className="space-y-2">
            {users.map((u) => (
              <div
                key={u.id}
                className={cn(
                  "bg-white rounded-xl border p-3 flex items-center gap-3",
                  u.isSuspended
                    ? "border-red-200 bg-red-50/30"
                    : "border-stone-200"
                )}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor: "#2d7a52",
                  }}
                >
                  {u.username[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {u.username}
                  </p>

                  <p className="text-xs text-gray-400">
                    {u.postCount}{" "}
                    {u.postCount === 1
                      ? "post"
                      : "posts"}{" "}
                    · joined {u.createdAt}

                    {u.isSuspended && (
                      <span className="ml-2 text-red-500 font-medium">
                        · SUSPENDED
                      </span>
                    )}
                  </p>
                </div>

                {!u.isSuspended && (
                  <button
                    onClick={() =>
                      handleSuspend(u.id)
                    }
                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors font-medium"
                  >
                    <UserX size={13} />
                    Suspend
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────
            HELP REQUESTS TAB
        ───────────────────────────────────────────────────────────────────── */}

        {tab === "help" && (
          <div className="space-y-3">
            {helpRequests.length === 0 ? (
              <div className="text-center py-14 bg-white rounded-xl border border-stone-200">
                <MessageCircle
                  size={28}
                  className="mx-auto text-emerald-500 mb-2"
                />

                <p className="font-semibold text-gray-700">
                  No help requests
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Users have not requested private support yet.
                </p>
              </div>
            ) : (
              helpRequests.map((request) => (
                <div
                  key={request.id}
                  className={cn(
                    "bg-white rounded-xl border p-4",
                    request.status === "NEW"
                      ? "border-amber-200"
                      : "border-stone-200"
                  )}
                >
                  {/* Request header */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <MessageCircle size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">
                          {request.username}
                        </span>

                        {request.isSuspended && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                            Suspended
                          </span>
                        )}

                        <StatusBadge
                          status={request.status}
                        />
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Clock size={10} />
                        {request.createdAt}
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mt-3 bg-stone-50 rounded-xl p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {request.message}
                    </p>
                  </div>

                  {/* Related post */}
                  {request.post && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        Related post:
                      </span>

                      <Link
                        href={`/post/${request.post.id}`}
                        target="_blank"
                        className="text-xs text-emerald-700 font-medium hover:underline line-clamp-1"
                      >
                        {request.post.title}
                      </Link>
                    </div>
                  )}

                  {/* Existing response */}
                  {request.adminResponse && (
                    <div className="mt-3 border-l-2 border-emerald-500 pl-3">
                      <p className="text-xs font-semibold text-emerald-700 mb-1">
                        Your response
                      </p>

                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {request.adminResponse}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-100">
                    <button
                      onClick={() =>
                        handleOpenHelpRequest(request)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white text-xs font-medium rounded-lg hover:bg-emerald-800 transition-colors"
                    >
                      <MessageCircle size={12} />

                      {request.adminResponse
                        ? "Edit Response"
                        : "Respond"}
                    </button>

                    {request.status === "NEW" && (
                      <button
                        onClick={() =>
                          handleHelpRequestStatus(
                            request.id,
                            "IN_REVIEW"
                          )
                        }
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors"
                      >
                        Mark In Review
                      </button>
                    )}

                    {request.status !== "CLOSED" && (
                      <button
                        onClick={() =>
                          handleHelpRequestStatus(
                            request.id,
                            "CLOSED"
                          )
                        }
                        className="px-3 py-1.5 bg-stone-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-stone-200 transition-colors"
                      >
                        Close
                      </button>
                    )}

                    {request.status === "CLOSED" && (
                      <button
                        onClick={() =>
                          handleHelpRequestStatus(
                            request.id,
                            "IN_REVIEW"
                          )
                        }
                        className="px-3 py-1.5 bg-stone-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-stone-200 transition-colors"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────────────────
          HELP REQUEST RESPONSE MODAL
      ─────────────────────────────────────────────────────────────────────── */}

      {selectedHelpRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <MessageCircle
                    size={18}
                    className="text-emerald-700"
                  />

                  <h2 className="font-serif text-lg font-bold text-gray-900">
                    Private Help Request
                  </h2>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  From {selectedHelpRequest.username}
                </p>
              </div>

              <button
                onClick={handleCloseHelpRequest}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-stone-100 rounded-lg"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* User request */}
            <div className="p-5">
              <div className="bg-stone-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  User's message
                </p>

                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {selectedHelpRequest.message}
                </p>
              </div>

              {selectedHelpRequest.post && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">
                    Related post
                  </p>

                  <Link
                    href={`/post/${selectedHelpRequest.post.id}`}
                    target="_blank"
                    className="text-sm text-emerald-700 hover:underline"
                  >
                    {selectedHelpRequest.post.title}
                  </Link>
                </div>
              )}

              {/* Response */}
              <div className="mt-5">
                <label
                  htmlFor="admin-help-response"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Your response
                </label>

                <textarea
                  id="admin-help-response"
                  value={responseText}
                  onChange={(event) =>
                    setResponseText(event.target.value)
                  }
                  maxLength={5000}
                  rows={7}
                  placeholder="Write a helpful response to the user..."
                  className="w-full rounded-xl border border-stone-300 px-3 py-3 text-sm text-gray-800 outline-none resize-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">
                    Your response will remain private.
                  </span>

                  <span className="text-xs text-gray-400">
                    {responseText.length}/5000
                  </span>
                </div>
              </div>

              {/* Modal actions */}
              <div className="flex justify-end gap-2 mt-5">
                <button
                  onClick={handleCloseHelpRequest}
                  className="px-4 py-2 border border-stone-200 text-gray-600 text-sm rounded-xl hover:bg-stone-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleRespondToHelpRequest}
                  disabled={!responseText.trim() || isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-xl hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────
          TOAST
      ─────────────────────────────────────────────────────────────────────── */}

      {toast && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 z-[60]",
            toast.type === "error"
              ? "bg-red-700"
              : "bg-emerald-800"
          )}
        >
          {toast.type === "error" ? (
            <AlertTriangle size={15} />
          ) : (
            <CheckCircle size={15} />
          )}

          {toast.message}
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const config: Record<
    string,
    {
      label: string;
      className: string;
    }
  > = {
    NEW: {
      label: "New",
      className:
        "bg-amber-100 text-amber-700",
    },
    IN_REVIEW: {
      label: "In Review",
      className:
        "bg-blue-100 text-blue-700",
    },
    RESPONDED: {
      label: "Responded",
      className:
        "bg-emerald-100 text-emerald-700",
    },
    CLOSED: {
      label: "Closed",
      className:
        "bg-stone-100 text-stone-600",
    },
  };

  const current = config[status] ?? {
    label: status,
    className:
      "bg-stone-100 text-stone-600",
  };

  return (
    <span
      className={cn(
        "text-xs px-1.5 py-0.5 rounded-full font-medium",
        current.className
      )}
    >
      {current.label}
    </span>
  );
}