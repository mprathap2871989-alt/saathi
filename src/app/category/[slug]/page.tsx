import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { PostCard, CrisisBanner } from "@/components/PostCard";
import { getPosts } from "@/actions/posts";
import { getCategoryById, getCategoryColors, CATEGORIES } from "@/lib/categories";

interface PageProps { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryById(slug);
  return {
    title: `${cat.label} - Saathi Community`,
    description: `Stories, support, and shared experiences in ${cat.label}. ${cat.desc}`,
  };
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.id }));
}

export const revalidate = 120;

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = getCategoryById(slug);

  if (!CATEGORIES.find((c) => c.id === slug)) notFound();

  const posts = await getPosts({ categoryId: slug, limit: 30 });
  const cl = getCategoryColors(slug);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={15} /> All topics
        </Link>

        <div className={`${cl.soft} rounded-2xl p-5 mb-5 border border-white/80 shadow-sm`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-4xl block mb-2">{cat.emoji}</span>
              <h1 className="font-serif text-2xl font-bold text-gray-900">{cat.label}</h1>
              <p className="text-gray-600 text-sm mt-1">{cat.desc}</p>
              <p className="text-xs text-gray-400 mt-2">
                {posts.length} {posts.length === 1 ? "story" : "stories"}
              </p>
            </div>
            <Link
              href={`/create?category=${slug}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-emerald-700 text-white text-xs font-medium rounded-full hover:bg-emerald-800 transition-colors"
            >
              <Plus size={13} /> Share
            </Link>
          </div>
        </div>

        <CrisisBanner />

        <div className="mt-5 space-y-3">
          {posts.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-xl border border-stone-200">
              <span className="text-4xl block mb-3">{cat.emoji}</span>
              <p className="font-semibold text-gray-700">No stories here yet.</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Be the first to share in this space.</p>
              <Link
                href={`/create?category=${slug}`}
                className="inline-block px-5 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-full hover:bg-emerald-800 transition-colors"
              >
                Share Your Story
              </Link>
            </div>
          ) : (
            posts.map((p) => (
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
            ))
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-stone-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">Browse other topics</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.id !== slug).map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.id}`}
                className="px-3 py-1.5 text-xs bg-white border border-stone-200 text-gray-600 rounded-full hover:bg-stone-50 hover:border-stone-300 transition-colors"
              >
                {c.emoji} {c.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}