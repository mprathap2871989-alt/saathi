// src/app/sign-up/[[...sign-up]]/page.tsx

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Shield } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Join Saathi" };

export default function SignUpPage() {
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
          Join Saathi
        </h1>
        <p className="text-gray-500 text-sm">
          You don&apos;t have to figure everything out alone.
        </p>
      </div>

      <SignUp
        appearance={{
          elements: {
            rootBox:        "w-full max-w-md",
            card:           "shadow-sm border border-stone-200 rounded-2xl",
            headerTitle:    "hidden",
            headerSubtitle: "hidden",
          },
        }}
      />

      {/* Anonymous reassurance */}
      <div className="mt-6 w-full max-w-md bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Shield size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-emerald-800 leading-relaxed">
          <span className="font-semibold">Your anonymity is protected.</span>{" "}
          You&apos;ll be assigned a generated username like BraveSoul123.
          Your real name is never shown to anyone on Saathi.
        </p>
      </div>
    </div>
  );
}
