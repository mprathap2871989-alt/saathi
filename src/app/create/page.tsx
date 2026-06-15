"use client";
// src/app/create/page.tsx

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, AlertCircle, CheckCircle, Heart } from "lucide-react";
import { createPost } from "@/actions/posts";
import { CATEGORIES } from "@/lib/categories";
import { getCategoryColors } from "@/lib/categories";
import Navbar from "@/components/Navbar";
import { CrisisBanner } from "@/components/PostCard";
import { cn } from "@/lib/utils";

interface FormErrors {
  category?: string;
  title?:    string;
  story?:    string;
}

export default function CreatePage() {
  const router = useRouter();

  const [category,           setCategory]           = useState("");
  const [title,              setTitle]              = useState("");
  const [story,              setStory]              = useState("");
  const [errors,             setErrors]             = useState<FormErrors>({});
  const [serverErr,          setServerErr]          = useState<string | null>(null);
  const [showCrisisModal,    setShowCrisisModal]    = useState(false);
  const [crisisPostId,       setCrisisPostId]       = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // ── Validation ──────────────────────────────
  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!category)                       e.category = "Please choose a category.";
    if (title.trim().length < 10)        e.title    = "Title must be at least 10 characters.";
    if (title.trim().length > 200)       e.title    = "Title is too long (max 200 chars).";
    if (story.trim().length < 50)        e.story    = "Please share at least 50 characters — the more context, the more support you'll receive.";
    if (story.trim().length > 10_000)    e.story    = "Story is too long (max 10,000 characters).";
    return e;
  };

  const submit = () => {
    setServerErr(null);
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    startTransition(async () => {
      const res = await createPost({
        title:      title.trim(),
        story:      story.trim(),
        categoryId: category,
      });

      if (res?.error) {
        setServerErr(res.error);
      } else if (res?.isCrisis) {
        // Show crisis modal — do NOT redirect immediately.
        // The person sees the iCall number before being moved anywhere.
        setShowCrisisModal(true);
        setCrisisPostId(res.postId ?? null);
      } else if (res?.postId) {
        router.push(`/post/${res.postId}`);
      }
    });
  };

  const selectedCat = CATEGORIES.find((c) => c.id === category);

  return (
    <>
      <Navbar />

      {/* ── Crisis modal ────────────────────────────────────────────────────── */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={22} className="text-amber-600" />
            </div>

            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">
              Your story has been shared.
            </h2>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              We noticed your post may be describing a very difficult moment.
              You are not alone in this. If you are in crisis or feeling unsafe,
              please reach out to a trained counsellor right now — it&apos;s free
              and confidential.
            </p>

            <a
              href="tel:9152987821"
              className="flex items-center justify-center gap-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-lg mb-3 transition-colors"
            >
              <Heart size={18} /> iCall: 9152987821
            </a>

            <p className="text-xs text-gray-400 mb-6">
              Mon–Sat, 8am–10pm · Free · Confidential
            </p>

            <button
              onClick={() => {
                if (crisisPostId) router.push(`/post/${crisisPostId}`);
              }}
              className="text-sm text-emerald-700 underline hover:no-underline"
            >
              Continue to your post →
            </button>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Back */}
        <Link
          href="/community"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-5"
        >
          <ArrowLeft size={15} /> Back to community
        </Link>

        <CrisisBanner />

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6 mt-5">
          <h1 className="font-serif text-2xl font-bold text-gray-900 mb-1">Share Your Story</h1>
          <p className="text-sm text-gray-500 mb-6">
            You&apos;ll post anonymously as a generated name. No one will know who you are.
          </p>

          {/* Server error */}
          {serverErr && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm text-red-700">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {serverErr}
            </div>
          )}

          <div className="space-y-6">
            {/* ── Category ── */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const cl = getCategoryColors(cat.id);
                  const sel = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setCategory(cat.id); setErrors((e) => ({ ...e, category: undefined })); }}
                      className={cn(
                        "p-2.5 rounded-xl border text-left text-sm transition-all",
                        sel
                          ? `${cl.badge} border-current font-semibold shadow-sm`
                          : "border-stone-200 text-gray-600 hover:bg-stone-50 hover:border-stone-300"
                      )}
                    >
                      <span className="mr-1">{cat.emoji}</span> {cat.label}
                    </button>
                  );
                })}
              </div>
              {errors.category && <Error msg={errors.category} />}
            </div>

            {/* ── Title ── */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-1">
                What&apos;s happening? <span className="text-red-400">*</span>
                <span className="text-gray-400 font-normal ml-1">(be specific — it helps people respond)</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setErrors((x) => ({ ...x, title: undefined })); }}
                placeholder="e.g. Failed my board exams and don't know how to tell my parents"
                maxLength={200}
                className={cn(
                  "w-full px-4 py-3 border rounded-xl text-sm outline-none transition-all text-gray-800",
                  "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
                  errors.title ? "border-red-300 bg-red-50/30" : "border-stone-200"
                )}
              />
              <div className="flex justify-between mt-1">
                {errors.title ? <Error msg={errors.title} /> : <span />}
                <span className={cn("text-xs", title.length > 180 ? "text-amber-500" : "text-gray-400")}>
                  {title.length}/200
                </span>
              </div>
            </div>

            {/* ── Story ── */}
            <div>
              <label htmlFor="story" className="block text-sm font-semibold text-gray-800 mb-1">
                Tell us more <span className="text-red-400">*</span>
                <span className="text-gray-400 font-normal ml-1">(share as much as you&apos;re comfortable with)</span>
              </label>
              <textarea
                id="story"
                value={story}
                onChange={(e) => { setStory(e.target.value); setErrors((x) => ({ ...x, story: undefined })); }}
                placeholder="Share the full context. What happened? How are you feeling? What support are you looking for? The more you share, the more helpful the responses will be."
                rows={10}
                className={cn(
                  "w-full px-4 py-3 border rounded-xl text-sm outline-none resize-y leading-relaxed text-gray-800",
                  "focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400",
                  "min-h-[200px]",
                  errors.story ? "border-red-300 bg-red-50/30" : "border-stone-200"
                )}
              />
              <div className="flex justify-between mt-1">
                {errors.story ? <Error msg={errors.story} /> : <span />}
                <span className={cn("text-xs", story.length > 9000 ? "text-amber-500" : "text-gray-400")}>
                  {story.length.toLocaleString()}/10,000
                </span>
              </div>
            </div>

            {/* ── Preview ── */}
            {selectedCat && title && (
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Preview</p>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs text-gray-500 font-medium">YourAnonymousName</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getCategoryColors(selectedCat.id).badge)}>
                    {selectedCat.emoji} {selectedCat.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{title}</p>
              </div>
            )}

            {/* ── Privacy notice ── */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <Shield size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-emerald-800 leading-relaxed">
                Your post is shared anonymously. You&apos;ll be assigned a generated username.
                <span className="block mt-1 text-emerald-700">
                  Tip: avoid sharing details (full name, exact location, workplace) that could identify you if you want full privacy.
                </span>
              </p>
            </div>

            {/* ── Submit ── */}
            <button
              onClick={submit}
              disabled={isPending}
              className={cn(
                "w-full py-3.5 bg-emerald-700 text-white font-semibold rounded-xl hover:bg-emerald-800 transition-all text-sm shadow-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sharing your story…
                </span>
              ) : (
                "Share Your Story"
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By sharing, you agree to our{" "}
              <Link href="/guidelines" className="text-emerald-700 hover:underline">
                Community Guidelines
              </Link>
              . Rate limit: 3 posts per day.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function Error({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}
