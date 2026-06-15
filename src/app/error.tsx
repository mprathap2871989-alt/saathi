"use client";
// src/app/error.tsx — global error boundary for unexpected runtime errors

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error tracking service here (e.g. Sentry)
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-5xl mb-4">🌧️</div>
      <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
        Something went wrong
      </h1>
      <p className="text-gray-500 text-sm mb-6 max-w-sm leading-relaxed">
        We hit an unexpected error. This has been logged and we&apos;ll look into it.
        Your data is safe.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-emerald-700 text-white font-medium rounded-full hover:bg-emerald-800 transition-colors text-sm"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 border border-stone-300 text-gray-700 font-medium rounded-full hover:bg-stone-100 transition-colors text-sm"
        >
          Go home
        </Link>
      </div>
      {process.env.NODE_ENV === "development" && error?.message && (
        <pre className="mt-6 text-xs text-left bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 max-w-lg overflow-auto w-full">
          {error.message}
        </pre>
      )}
    </div>
  );
}
