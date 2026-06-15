// src/app/post/[id]/not-found.tsx
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function PostNotFound() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">🕊️</div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-2">Story not found</h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          This story may have been removed by our moderation team,<br />
          or the link may be incorrect.
        </p>
        <Link
          href="/community"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white font-medium rounded-full hover:bg-emerald-800 transition-colors text-sm"
        >
          Return to Community
        </Link>
      </main>
    </>
  );
}
