// src/app/community/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { PostCard, CrisisBanner } from "@/components/PostCard";
import FeedFilters from "@/components/feed/FeedFilters";
import Pagination from "@/components/feed/Pagination";
import { getPosts } from "@/actions/posts";
import { getCategoryById } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Community — Saathi",
  description: "Read stories, offer support, and connect with people who understand.",
};

const POSTS_PER_PAGE = 15;

interface PageProps {
  searchParams: {
    search?:   string;
    category?: string;
    sort?:     string;
    page?:     string;
  };
}

async function PostsList({ searchParams }: PageProps) {
  const { search, category, sort, page } = searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const posts = await getPosts({
    categoryId: category,
    search:     search?.trim(),
    sort:       sort === "helpful" ? "helpful" : "latest",
    page:       currentPage,
    limit:      POSTS_PER_PAGE,
  });

  const hasMore = posts.length === POSTS_PER_PAGE;

  if (!posts.length) {
    const hasFilters = !!(search || category);
    return (
      <>
        <EmptyFeed hasFilters={hasFilters} />
        {currentPage > 1 && (
          <Pagination
            currentPage={currentPage}
            hasMore={false}
            search={search}
            category={category}
            sort={sort}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            id={p.id}
            username={p.user.username}
            categoryId={p.categoryId}
            title={p.title}
            story={p.story}
            helpfulCount={p._count.helpfulVotes}
            commentCount={p._count.comments}
            createdAt={p.createdAt}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        hasMore={hasMore}
        search={search}
        category={category}
        sort={sort}
      />
    </>
  );
}

export default function CommunityPage({ searchParams }: PageProps) {
  const { category } = searchParams;
  const activeCat = category ? getCategoryById(category) : null;

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">Community</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeCat
                ? <>{activeCat.emoji} {activeCat.label}</>
                : "All stories · All topics"}
            </p>
          </div>
          <Link
            href="/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-full hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <Plus size={14} /> Share
          </Link>
        </div>

        <CrisisBanner />

        {/* Filters (client island — updates URL params) */}
        <div className="mt-5">
          <Suspense fallback={<div className="h-28 bg-stone-100 rounded-xl animate-pulse" />}>
            <FeedFilters
              currentSearch={searchParams.search}
              currentCategory={searchParams.category}
              currentSort={searchParams.sort}
            />
          </Suspense>
        </div>

        {/* Posts list (server rendered, re-fetched on URL change) */}
        <div className="mt-5">
          <Suspense fallback={<FeedSkeleton />}>
            <PostsList searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </>
  );
}

function EmptyFeed({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
      <span className="text-4xl block mb-3">{hasFilters ? "🔍" : "💬"}</span>
      <p className="font-semibold text-gray-700">
        {hasFilters ? "No stories match your search" : "No stories yet"}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {hasFilters
          ? "Try different filters or search terms"
          : "Be the first to share your story"}
      </p>
      <Link href="/create" className="inline-block mt-4 text-emerald-700 text-sm font-medium hover:underline">
        Share your story →
      </Link>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-stone-200 p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-stone-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-3 bg-stone-200 rounded w-24" />
                <div className="h-3 bg-stone-200 rounded w-16 ml-auto" />
              </div>
              <div className="h-4 bg-stone-200 rounded w-full" />
              <div className="h-3 bg-stone-200 rounded w-4/5" />
              <div className="h-3 bg-stone-200 rounded w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
