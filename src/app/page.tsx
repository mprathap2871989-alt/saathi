// src/app/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight, Heart, Shield, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import { PostCard, CrisisBanner } from "@/components/PostCard";
import { getPosts } from "@/actions/posts";
import { CATEGORIES } from "@/lib/categories";
import { getCategoryColors } from "@/lib/categories";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saathi — You don't have to figure everything out alone",
  description:
    "A safe, anonymous support community. Share your story, find people who understand, and give and receive support — completely free.",
};

export const revalidate = 300; // ISR: re-render every 5 minutes

async function RecentStories() {
  const posts = await getPosts({ sort: "helpful", limit: 3 });
  if (!posts.length) return null;
  return (
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
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white overflow-hidden">
        {/* Community constellation */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" aria-hidden>
          <svg width="100%" height="100%" viewBox="0 0 900 420" preserveAspectRatio="xMidYMid slice">
            {([[180,70],[480,55],[700,90],[120,190],[360,170],[620,145],[840,160],[260,290],[510,265],[760,285],[90,360],[420,340],[680,360]]) .map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="4.5" fill="white"/>
            ))}
            {([[180,70,480,55],[180,70,120,190],[480,55,700,90],[480,55,360,170],[700,90,620,145],[700,90,840,160],[120,190,360,170],[360,170,620,145],[620,145,840,160],[360,170,260,290],[620,145,510,265],[840,160,760,285],[260,290,510,265],[510,265,760,285],[260,290,90,360],[510,265,420,340],[760,285,680,360],[90,360,420,340],[420,340,680,360]]).map(([x1,y1,x2,y2],i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="0.7"/>
            ))}
          </svg>
        </div>

        <div className="relative max-w-2xl mx-auto px-4 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-7">
            <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" />
            Safe · Anonymous · Judgment-free
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-5">
            You don&apos;t have to figure<br className="hidden sm:block" /> everything out alone.
          </h1>
          <p className="text-emerald-100 text-lg mb-9 leading-relaxed max-w-lg mx-auto">
            Share your story. Find people who understand. Give and receive support — completely anonymously.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/create" className="px-7 py-3 bg-white text-emerald-800 font-semibold rounded-full hover:bg-emerald-50 transition-colors shadow-sm">
              Share Your Story
            </Link>
            <Link href="/community" className="px-7 py-3 bg-emerald-700/50 border border-emerald-500 text-white font-medium rounded-full hover:bg-emerald-700 transition-colors">
              Explore Community
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 mt-10 text-sm text-emerald-200">
            <span className="flex items-center gap-1.5"><Users size={14}/> Thousands supported</span>
            <span className="flex items-center gap-1.5"><Shield size={14}/> Fully anonymous</span>
            <span className="flex items-center gap-1.5"><Heart size={14}/> Always free</span>
          </div>
        </div>
      </section>

      {/* ── Crisis banner ─────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <CrisisBanner />
      </div>

      {/* ── How it works ──────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-12">
        <h2 className="font-serif text-2xl font-bold text-gray-900 text-center mb-1">How Saathi Works</h2>
        <p className="text-gray-500 text-center text-sm mb-8">Three steps. No judgment. No real names.</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step:"1", icon:"✍️", title:"Share Anonymously",  desc:"Write your story. You get a generated name like BraveSoul123. No one knows who you are." },
            { step:"2", icon:"🤝", title:"Receive Support",    desc:"Community members who've been through similar experiences respond with empathy and lived wisdom." },
            { step:"3", icon:"💛", title:"Support Others",     desc:"When you're ready, help someone else. Giving support is part of healing too." },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 text-center">
              <div className="text-3xl mb-3">{icon}</div>
              <div className="text-xs font-bold text-emerald-700 mb-1 tracking-widest">STEP {step}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ────────────────────────── */}
      <section className="bg-stone-100/70 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-1">Find Your Community</h2>
          <p className="text-gray-500 text-sm mb-6">Browse conversations by what you&apos;re going through.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.slice(0, 9).map((cat) => {
              const cl = getCategoryColors(cat.id);
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}`}
                  className={`${cl.soft} rounded-xl p-3.5 hover:scale-[1.02] transition-transform border border-white/80 shadow-sm group`}
                >
                  <span className="text-2xl block mb-1">{cat.emoji}</span>
                  <span className="text-sm font-semibold text-gray-800 block group-hover:text-emerald-800 transition-colors">{cat.label}</span>
                  <span className="text-xs text-gray-500 leading-tight">{cat.desc}</span>
                </Link>
              );
            })}
          </div>
          <Link href="/community" className="mt-5 inline-flex items-center gap-1 text-emerald-700 text-sm font-medium hover:underline">
            See all 13 categories <ChevronRight size={14}/>
          </Link>
        </div>
      </section>

      {/* ── Recent stories ────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-gray-900">Recent Stories</h2>
          <Link href="/community" className="text-emerald-700 text-sm font-medium hover:underline flex items-center gap-1">
            View all <ChevronRight size={14}/>
          </Link>
        </div>
        <Suspense fallback={<StoriesSkeleton />}>
          <RecentStories />
        </Suspense>
      </section>

      {/* ── Safety promise ────────────────────── */}
      <section className="bg-emerald-900 text-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center">Your Safety Is Our Promise</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon:"🔒", title:"Fully Anonymous",    desc:"We generate a pseudonym for you. No real names, no photos, no identifiers." },
              { icon:"🛡️", title:"Moderated Community", desc:"Reported content is reviewed by our moderation team. If you are in crisis, call 112 or iCall: 9152987821." },
              { icon:"❌", title:"Zero Tolerance",      desc:"Harassment, hate speech, and bullying result in immediate removal." },
              { icon:"🤝", title:"Support, Not Likes",  desc:"We use 'Helpful' not 'Like' — keeping focus on support, not popularity." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-emerald-800/50 rounded-xl p-4">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <div className="font-semibold text-sm mb-0.5">{title}</div>
                  <div className="text-sm text-emerald-200 leading-relaxed">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 py-14 text-center">
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-3">Ready to share?</h2>
        <p className="text-gray-500 mb-7 leading-relaxed">
          Your story might be exactly what someone else needs to hear today.<br />
          And this community might be exactly what you need.
        </p>
        <Link href="/create" className="inline-block px-9 py-3.5 bg-emerald-700 text-white font-semibold rounded-full hover:bg-emerald-800 transition-colors shadow-sm">
          Write Your Story
        </Link>
        <p className="text-xs text-gray-400 mt-3">Anonymous by default · Free forever · No algorithm</p>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer className="border-t border-stone-200 py-6 px-4">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <Link href="/" className="font-bold text-emerald-800 text-lg tracking-tight">saathi</Link>
          <div className="flex gap-5">
            {[["Community","/community"],["Guidelines","/guidelines"],["Privacy","/privacy"],["Admin","/admin"]].map(([l,h]) => (
              <Link key={h} href={h} className="hover:text-gray-600 transition-colors">{l}</Link>
            ))}
          </div>
          <span>Made with care 💚</span>
        </div>
      </footer>
    </>
  );
}

function StoriesSkeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white rounded-xl border border-stone-200 p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-9 h-9 bg-stone-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-stone-200 rounded w-32" />
              <div className="h-4 bg-stone-200 rounded w-full" />
              <div className="h-3 bg-stone-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
