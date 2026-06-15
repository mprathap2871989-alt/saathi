"use client";
// src/components/post/ReportButton.tsx

import { useState, useTransition } from "react";
import { Flag, X, CheckCircle, AlertCircle } from "lucide-react";
import { reportPost, reportComment } from "@/actions/reports";
import { cn } from "@/lib/utils";

const REASONS = [
  "Harassment or bullying",
  "Hate speech or discrimination",
  "Spam or self-promotion",
  "Harmful or dangerous content",
  "Impersonation",
  "Crisis — person may be in immediate danger",
  "Other",
];

interface Props {
  type:       "post" | "comment";
  targetId:   string;
  postId?:    string; // required when type === "comment"
  className?: string;
}

export default function ReportButton({ type, targetId, postId, className }: Props) {
  const [open,      setOpen]      = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (reason: string) => {
    startTransition(async () => {
      const res =
        type === "post"
          ? await reportPost(targetId, reason)
          : await reportComment(targetId, reason);

      if (res?.error) {
        setError(res.error);
      } else {
        setDone(true);
        setTimeout(() => { setOpen(false); setDone(false); }, 2000);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => { setOpen(true); setDone(false); setError(null); }}
        className={cn(
          "flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors",
          className
        )}
      >
        <Flag size={13} />
        Report
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Report content"
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
            {done ? (
              <div className="text-center py-4">
                <CheckCircle size={36} className="text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Report submitted</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your report has been received. Our moderation team will review it. If this is an emergency, call 112 or iCall: 9152987821.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">Report {type}</h3>
                  <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 -mt-0.5">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Select the most relevant reason. Reports are anonymous.
                </p>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle size={13} /> {error}
                  </div>
                )}

                <div className="space-y-2">
                  {REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => submit(reason)}
                      disabled={isPending}
                      className={cn(
                        "w-full text-left px-3 py-2.5 text-sm rounded-xl border transition-colors",
                        reason.includes("Crisis")
                          ? "border-red-200 text-red-700 hover:bg-red-50 font-medium"
                          : "border-stone-200 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700",
                        isPending && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 py-1"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
