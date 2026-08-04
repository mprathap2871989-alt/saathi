# Changelog

All notable changes to Saathi are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/). Newest entries at the top.

## [Unreleased]

### Fixed
- **Content blocklist now actually filters content.** `containsBlockedContent()` previously checked against a two-word placeholder array (`["slur1", "slur2"]`) and blocked nothing in production. It now uses `obscenity`, a maintained profanity/slur-detection library with word-boundary matching and evasion handling (leetspeak, character repetition), wired in via a new `src/lib/blocklist.ts` module. `posts.ts` and `comments.ts` required no changes — the exported function signature from `src/lib/utils.ts` is unchanged.
