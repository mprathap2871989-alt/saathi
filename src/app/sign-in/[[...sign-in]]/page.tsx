// src/app/sign-in/[[...sign-in]]/page.tsx
// Clerk hosted sign-in rendered inside Saathi's own layout.

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In — Saathi" };

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-emerald-700 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-base">S</span>
        </div>
        <span className="font-bold text-emerald-800 text-xl tracking-tight">saathi</span>
      </Link>

      <div className="w-full max-w-md text-center mb-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-1">
          Welcome back
        </h1>
        <p className="text-gray-500 text-sm">
          Sign in to share your story or support someone else.
        </p>
      </div>

      {/* Clerk drop-in — styled via Clerk dashboard appearance settings */}
      <SignIn
        appearance={{
          elements: {
            rootBox:       "w-full max-w-md",
            card:          "shadow-sm border border-stone-200 rounded-2xl",
            headerTitle:   "hidden",
            headerSubtitle:"hidden",
          },
        }}
      />

      <p className="text-xs text-gray-400 mt-6 text-center max-w-xs leading-relaxed">
        You will be assigned an anonymous username automatically.
        No real name is shown to anyone on Saathi.
      </p>
    </div>
  );
}
