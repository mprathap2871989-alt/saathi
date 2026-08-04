// src/app/not-found.tsx — global 404

import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-5xl mb-4">🧭</div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 text-sm mb-7 leading-relaxed">
          This page doesn&apos;t exist, or the link may be outdated.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/community"
            className="px-6 py-2.5 bg-emerald-700 text-white font-medium rounded-full hover:bg-emerald-800 transition-colors text-sm"
          >
            Go to Community
          </Link>
          <Link
            href="/"
            className="px-6 py-2.5 border border-stone-300 text-gray-700 font-medium rounded-full hover:bg-stone-100 transition-colors text-sm"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
