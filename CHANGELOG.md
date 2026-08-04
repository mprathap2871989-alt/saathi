# Changelog

All notable changes to Saathi are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/). Newest entries at the top.

## [Unreleased]

### Fixed
- **`/create` now pre-selects a category from the URL.** `category/[slug]/page.tsx`'s "Share your story" link has always pointed to `/create?category=<id>`, but the create page never read that param — users arriving from a category page landed on a blank category picker. `useSearchParams()` now initializes the selected category, validated against the real `CATEGORIES` list so an unknown or hand-typed value safely falls back to no selection instead of a broken state. Required wrapping the form in a `<Suspense>` boundary per the App Router's requirement for `useSearchParams()` — the default-exported `CreatePage` component is now a thin Suspense wrapper around the unchanged form logic (moved into `CreatePageForm`), with no visual or behavioral change to the form itself.
- **Content blocklist now actually filters content.** `containsBlockedContent()` previously checked against a two-word placeholder array (`["slur1", "slur2"]`) and blocked nothing in production. It now uses `obscenity`, a maintained profanity/slur-detection library with word-boundary matching and evasion handling (leetspeak, character repetition), wired in via a new `src/lib/blocklist.ts` module. `posts.ts` and `comments.ts` required no changes — the exported function signature from `src/lib/utils.ts` is unchanged.
