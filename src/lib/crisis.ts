// src/lib/crisis.ts
//
// Crisis keyword detection for Saathi.
// Called in createPost and createComment before any DB write.
//
// DESIGN: phrase matching, not single-word matching.
// "kill" alone generates too many false positives ("killing it at work").
// Full phrases have near-zero false-positive rate on a support platform.
//
// Phrase list covers:
//   - English suicidal ideation (direct and indirect)
//   - English self-harm
//   - Hindi / Hinglish equivalents
//
// NOT listed here: words that are also valid support-seeking language
// e.g. "I feel like dying" is borderline — genuine distress but also
// hyperbolic expression. Only high-confidence crisis phrases are included.

export const CRISIS_PHRASES = [
  // ── English: suicidal ideation ──────────────────────────────────
  "want to die",
  "want to kill myself",
  "kill myself",
  "killing myself",
  "end my life",
  "end it all",
  "take my own life",
  "taking my own life",
  "take my life",
  "don't want to be alive",
  "dont want to be alive",
  "don't want to live",
  "dont want to live",
  "not want to live",
  "wish i was dead",
  "wish i were dead",
  "better off dead",
  "better off without me",
  "no reason to live",
  "cant go on",
  "can't go on",
  "cant do this anymore",
  "can't do this anymore",
  "no point in living",
  "no point anymore",
  "giving up on life",
  "goodbye forever",
  "final goodbye",
  "don't want to exist",
  "dont want to exist",

  // ── English: self-harm ───────────────────────────────────────────
  "hurt myself",
  "hurting myself",
  "cutting myself",
  "cut myself",
  "harming myself",
  "harm myself",
  "self harm",
  "self-harm",

  // ── Hindi / Hinglish ─────────────────────────────────────────────
  "marna chahta",       // want to die (m)
  "marna chahti",       // want to die (f)
  "marna chahta hoon",
  "marna chahti hoon",
  "mar jaana chahta",
  "mar jaana chahti",
  "mar jaunga",         // I will die
  "mar jaungi",
  "khud ko khatam",     // end myself
  "zindagi khatam",     // end life
  "jeena nahi chahta",  // don't want to live (m)
  "jeena nahi chahti",  // don't want to live (f)
  "jeena nahi hai",
  "jeena nahi",
  "jina nahi chahta",
  "jina nahi chahti",
  "khud ko hurt",       // hurt myself (Hinglish)
  "khud ko nuksaan",    // harm myself
] as const;

/**
 * Returns true if the text contains a crisis signal.
 *
 * Normalises to lowercase and collapses whitespace before matching,
 * so "Want  To  Kill  Myself" matches "want to kill myself".
 *
 * Exported for direct use in tests. The server actions (posts.ts,
 * comments.ts) are the only production callers.
 */
export function containsCrisisContent(text: string): boolean {
  const normalised = text.toLowerCase().replace(/\s+/g, " ").trim();
  return CRISIS_PHRASES.some((phrase) => normalised.includes(phrase));
}
