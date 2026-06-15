// src/app/post/[id]/page.tsx
// Fixed: removed broken onReport prop — CommentItem handles it internally now.

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";
import { CrisisBanner, CategoryBadge, Avatar } from "@/components/PostCard";
import HelpfulButton from "@/components/post/HelpfulButton";
import ReportButton from "@/components/post/ReportButton";
import CommentForm from "@/components/post/CommentForm";
import CommentItem from "@/components/post/CommentItem";
import { getPost } from "@/actions/posts";
import { prisma } from "@/lib/prisma";
import { timeAgo, storyPreview } from "@/lib/utils";
import { getCategoryColors } from "@/lib/categories";

interface PageProps { params: { id: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost(params.id);
  if (!post) {
    return {
      title: "Post not found — Saathi",
      robots: { index: false, follow: false },
    };
  }
  return {
    // Title uses post title only — no story content.
    title: `${post.title} — Saathi`,
    // Description is generic — never include story content here.
    // Story content in meta tags gets scraped by WhatsApp/Telegram/iMessage
    // link previews even when noindex is set.
    description: "An anonymous post on Saathi — a peer support community for India.",
    // Block all indexing for individual post pages.
    // Mental health content must never surface in search results.
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
    openGraph: {
      title: "A post on Saathi",
      description: "An anonymous peer support community for India.",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "A post on Saathi",
      description: "An anonymous peer support community for India.",
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const post = await getPost(params.id);
  if (!post) notFound();

  // Resolve current user's username for the CommentForm
  const { userId: clerkId } = await auth();
  let username: string | null = null;
  if (clerkId) {
    const dbUser = await prisma.user.findUnique({
      where:  { clerkId },
      select: { username: true },
    });
    username = dbUser?.username ?? null;
  }

  const cl         = getCategoryColors(post.categoryId);
  const paragraphs = post.story.split("\n").filter(Boolean);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* ── Back ─────────────────────────────── */}
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-5"
        >
          <ArrowLeft size={15} /> Back to community
        </Link>

        <CrisisBanner />

        {/* ── Post card ────────────────────────── */}
        <article
          className={`bg-white rounded-2xl border border-stone-200 border-l-4 ${cl.border} shadow-sm mt-5 p-5 sm:p-6`}
        >
          {/* Author */}
          <div className="flex items-center gap-3 mb-5">
            <Avatar username={post.user.username} size="lg" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{post.user.username}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <CategoryBadge categoryId={post.categoryId} />
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock size={11} /> {timeAgo(post.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-snug mb-5">
            {post.title}
          </h1>

          {/* Story body */}
          <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
            {paragraphs.map((para, i) => <p key={i}>{para}</p>)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-6 pt-5 border-t border-stone-100 flex-wrap">
            <HelpfulButton
              postId={post.id}
              initialCount={post._count.helpfulVotes}
              initialUserHelpful={post.userHelpful}
            />
            <div className="ml-auto">
              <ReportButton type="post" targetId={post.id} />
            </div>
          </div>
        </article>

        {/* ── Comments ─────────────────────────── */}
        <section className="mt-8" aria-label="Responses">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <MessageCircle size={16} className="text-emerald-600" />
            {post.comments.length}{" "}
            {post.comments.length === 1 ? "Response" : "Responses"}
          </h2>

          {/* Comment form */}
          <CommentForm postId={post.id} username={username} />

          {/* Comment list */}
          <div className="mt-4 space-y-3">
            {post.comments.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-stone-100">
                <p className="text-sm text-gray-500 font-medium">No responses yet.</p>
                <p className="text-xs text-gray-400 mt-1">Be the first to offer support.</p>
              </div>
            )}

            {post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                id={comment.id}
                postId={post.id}
                username={comment.user.username}
                text={comment.text}
                timeAgoStr={timeAgo(comment.createdAt)}
                helpfulCount={comment._count.helpfulVotes}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
