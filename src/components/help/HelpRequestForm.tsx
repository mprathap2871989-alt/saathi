"use client";

// src/components/help/HelpRequestForm.tsx

import { FormEvent, useState, useTransition } from "react";
import { CheckCircle, Send, AlertTriangle } from "lucide-react";
import { createHelpRequest } from "@/actions/helpRequests";

const MAX_MESSAGE_LENGTH = 5000;

export default function HelpRequestForm() {
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setSuccess(false);

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      setError("Please describe what you need help with.");
      return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setError(
        `Your message must be ${MAX_MESSAGE_LENGTH} characters or less.`
      );
      return;
    }

    startTransition(async () => {
      const result = await createHelpRequest(trimmedMessage);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setMessage("");
      setSuccess(true);
    });
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Send size={15} className="text-emerald-700" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            Send a private request
          </h2>

          <p className="text-xs text-gray-400 mt-0.5">
            Only you and the Saathi admin can see this message.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setSuccess(false);
            setError(null);
          }}
          placeholder="Tell us what you need help with..."
          rows={6}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={isPending}
          className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </span>

          <button
            type="submit"
            disabled={isPending || !message.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-xl hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={14} />

            {isPending ? "Sending..." : "Send Request"}
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
            <AlertTriangle
              size={15}
              className="text-red-500 flex-shrink-0 mt-0.5"
            />

            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
            <CheckCircle
              size={15}
              className="text-emerald-600 flex-shrink-0 mt-0.5"
            />

            <p className="text-xs text-emerald-700">
              Your request has been sent privately. We&apos;ll respond here.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}