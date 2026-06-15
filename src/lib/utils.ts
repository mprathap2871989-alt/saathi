// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Filter } from "bad-words";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "2 hours ago", "3 days ago", etc. */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60)     return "just now";
  if (seconds < 3600)   return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400)  return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Truncate story to preview length */
export function storyPreview(text: string, maxLen = 140): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

// ── Profanity filter ──────────────────────────────────────────────────────────
//
// Initialised once at module level. bad-words compiles its word list on
// construction; building it inside containsBlockedContent would rebuild on
// every request.
//
// Import: bad-words@4 uses named exports — `import { Filter } from "bad-words"`
// Types: bundled in the package at dist/index.d.ts — no @types/ needed.
//
// Word list audit: June 2025
// See: src/lib/__tests__/utils.filter.test.mjs for full coverage verification.
// NOT added (false-positive risk too high for a support platform):
//   queer, hijra, chakka, chhakka, kinnar — reclaimed identity / legitimate terms
//   bhangi, chamar — Dalit community names; blocking silences self-identification
//   kutte, kutti   — Hindi for "dogs"; daily innocent usage
//   bhakt, sanghi, jihadi, kafir — political/religious identity words

const _filter = new Filter();

// ── Group 1: Original Hindi custom list ──────────────────────────────────────
_filter.addWords(
  "mc",
  "bc",
  "bhosdike",
  "chutiya",
  "madarchod",
  "bhenchod",
  "randi",
  "harami",
  "kamina",
  "chodu",
  "gaandu",
  "lodu"
);

// ── Group 2: English gap (bad-words@4 library bug) ────────────────────────────
// "wetback" exists in the default list only as "wetback*" (wildcard form).
// The isProfane() method escapes the * into a literal regex character, so the
// wildcard entry never matches. Adding the plain form here fixes that gap.
_filter.addWords(
  "wetback"
);

// ── Group 3: LGBTQ hate slurs not in the default list ────────────────────────
_filter.addWords(
  "tranny",
  "poofter",
  "batty boy"
);

// ── Group 4: Religious and communal slurs ─────────────────────────────────────
_filter.addWords(
  "katua",   // anti-Muslim slur, no legitimate use
  "kaffir"   // racial/religious slur (South African origin, used in India)
);

// ── Group 5: Hindi variants and compounds of already-blocked root words ───────
// These are spelling variants, plural forms, and compounds that share a root
// with Group 1 words but are distinct enough that isProfane misses them.
_filter.addWords(
  "gandu",        // variant spelling of gaandu
  "haramzada",    // compound of harami (m)
  "haramzadi",    // compound of harami (f)
  "haraami",      // alternate spelling of harami
  "haraamkhor",   // compound: harami + khor (one who eats/lives on)
  "kamine",       // vocative/plural of kamina
  "lund",         // anatomical abuse term
  "chut",         // common abuse term
  "choot",        // alternate spelling of chut
  "bhosda",       // root form of bhosdike
  "bhosdiwala",   // compound of bhosda
  "laude",        // common abuse term
  "lawda",        // alternate spelling of laude
  "maderchod",    // alternate spelling of madarchod
  "madarjaat",    // variant compound
  "rande",        // variant/plural of randi
  "randibaaz",    // compound: randi + baaz (one who indulges in)
  "bsdk",         // abbreviation of bhosdike, used to evade filters
  "mkc"           // abbreviation of madarchod, used to evade filters
);

// ── Group 6: Hinglish abuse terms ────────────────────────────────────────────
_filter.addWords(
  "bhadwa",   // pimp (m) — used as severe abuse
  "bhadwi"    // pimp (f) — used as severe abuse
);

// ── Group 7: Caste-based slurs ────────────────────────────────────────────────
// Only terms with no legitimate innocent use in context.
// bhangi and chamar are NOT added — they are community self-identifiers used
// by Dalit users; blocking them would silence the people we are here to support.
_filter.addWords(
  "dhed",        // Dalit caste slur (Gujarat/Maharashtra)
  "chandal",     // Sanskrit-origin caste slur, no modern neutral use
  "neechi jaat"  // phrase: "low caste" — dehumanising, no innocent use as a phrase
);

/**
 * Returns true if the text contains blocked content.
 *
 * Called in createPost (title + story) and createComment (text) before any
 * DB write. The caller is responsible for returning the appropriate user-facing
 * error message — this function only returns a boolean.
 *
 * Fails open: if bad-words throws on edge-case input, we return false so a
 * legitimate post is never silently blocked by a filter crash.
 */
export function containsBlockedContent(text: string): boolean {
  try {
    return _filter.isProfane(text);
  } catch {
    // Log for visibility but never block the user due to a filter error.
    console.error("[containsBlockedContent] filter threw on input:", text.slice(0, 80));
    return false;
  }
}
