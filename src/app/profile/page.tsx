// src/app/profile/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, BookOpen, ThumbsUp, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";
import { PostCard } from "@/components/PostCard";
import UsernameEditor from "@/components/profile/UsernameEditor";
import { getMyProfile } from "@/actions/user";
import { getOrCreateUser } from "@/actions/user";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Profile — Saathi",
  description: "Your anonymous Saathi profile.",
};

const AVATAR_COLORS = [
  "bg-emerald-600","bg-blue-600","bg-violet-600",
  "bg-rose-500","bg-amber-600","bg-cyan-600",
  "bg-pink-600","bg-indigo-600",
];
function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export default async function ProfilePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  // Auto-create profile on first visit
  await getOrCreateUser(clerkId);
  const profile = await getMyProfile();

  if (!profile) redirect("/sign-in");

  const activePosts = profile.posts.filter((p) => !p.isRemoved);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-5">My Profile</h1>

        {/* ── Profile card ── */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 mb-5">
          {/* Avatar + username */}
          <div className="flex items-center gap-4 mb-5">
            <div className={`${avatarColor(profile.username)} w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
              {profile.username[0].toUpperCase()}
            </div>
            <div>
              <UsernameEditor currentUsername={profile.username} />
              <p className="text-xs text-gray-400 mt-1">
                Member since {timeAgo(profile.createdAt)}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon:<BookOpen  size={14}/>, label:"Stories Shared",     val: activePosts.length            },
              { icon:<ThumbsUp  size={14}/>, label:"Helpful Given",       val: profile._count.helpfulVotes   },
              { icon:<MessageCircle size={14}/>, label:"Responses Made",  val: profile._count.comments       },
            ].map(({ icon, label, val }) => (
              <div key={label} className="bg-stone-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-700">{val}</div>
                <div className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
                  {icon} {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Privacy notice ── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3 mb-6 text-sm">
          <Shield size={15} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-blue-800">
            Your profile is completely private. Only you can see this page.
            Your posts appear in the community under your anonymous name only.
          </p>
        </div>

        {/* ── My stories ── */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">My Stories</h2>
          <Link
            href="/create"
            className="text-sm text-emerald-700 font-medium hover:underline"
          >
            + New story
          </Link>
        </div>

        {activePosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
            <span className="text-4xl block mb-3">✍️</span>
            <p className="font-semibold text-gray-700 mb-1">You haven&apos;t shared a story yet.</p>
            <p className="text-sm text-gray-400 mb-4">
              Sharing your story anonymously can feel surprisingly relieving.
            </p>
            <Link
              href="/create"
              className="inline-block px-5 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-full hover:bg-emerald-800 transition-colors"
            >
              Share Your First Story
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activePosts.map((p) => (
              <PostCard
                key={p.id}
                id={p.id}
                username={profile.username}
                categoryId={p.categoryId}
                title={p.title}
                story={p.story}
                helpfulCount={p._count.helpfulVotes}
                commentCount={p._count.comments}
                createdAt={p.createdAt}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
