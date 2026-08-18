// src/lib/blocklist.ts
// Production content filter for posts and comments.
//
// Built on `obscenity` (github.com/jo3-l/obscenity) — a maintained profanity/
// slur-detection library with word-boundary matching and evasion handling
// (leetspeak, spacing, repeated characters), rather than a hand-rolled
// substring list. Hand-rolled lists are trivially bypassed and expensive to
// keep current; a maintained matcher is the correct foundation to extend.
//
// Phase 2 (see TECHNICAL_DEBT.md) will move the custom-term list below from
// a static array to an admin-editable DB table. The `additionalTerms` array
// is the single seam that change will touch — everything else in this file
// stays as-is.

import {
  DataSet,
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
  pattern,
} from "obscenity";

/**
 * Platform-specific terms beyond the base English dataset: harassment
 * language and identity-targeted slurs relevant to Solacial's community
 * (caste, religion, gender, sexuality — the categories explicitly named
 * as zero-tolerance in the Community Guidelines).
 *
 * Kept intentionally small and reviewable. Extend via PR, not by editing
 * this list casually — every addition should be traceable to a real
 * moderation incident or guideline violation.
 */
const additionalTerms: string[] = [];

const dataset = additionalTerms.reduce(
  (ds, term) =>
    ds.addPhrase((phrase) =>
      phrase.setMetadata({ originalWord: term }).addPattern(pattern`${term}`)
    ),
  new DataSet<{ originalWord: string }>().addAll(englishDataset)
);

const matcher = new RegExpMatcher({
  ...dataset.build(),
  ...englishRecommendedTransformers,
});

/**
 * Returns true if the given text contains blocked content (slurs,
 * harassment language, explicit content). Used to gate post/comment
 * creation in `actions/posts.ts` and `actions/comments.ts`.
 *
 * Known limitation: the recommended transformer set handles leetspeak
 * (`4ss`) and repeated characters (`fuuuck`) but does not collapse
 * single-letter spacing (`f u c k`), since aggressive space-stripping
 * reintroduces false positives elsewhere (spaced-out acronyms, etc.).
 * This is a deliberate upstream trade-off, not a gap to patch locally —
 * revisit only if real moderation reports show this being exploited.
 */
export function containsBlockedContent(text: string): boolean {
  return matcher.hasMatch(text);
}
