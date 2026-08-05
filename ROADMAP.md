# Saathi V2 — Roadmap

Source of truth for what's done, in progress, and next. Updated at the end of every task.
Full rationale for every item lives in `SAATHI_V2_AUDIT.md`.

---

## Completed

- [x] Real content blocklist (`obscenity`-based, replaces `["slur1","slur2"]` placeholder) — Phase 1
- [x] Category pre-selection from `?category=` on `/create` — Phase 1
- [x] Monetization readiness audit — approved, no schema changes required before launch
- [x] `BUSINESS_PRINCIPLES.md` + ADR-0001 (tenant isolation via nullable `organizationId`) — non-blocking documentation, per audit recommendation
- [x] `suspendUser` self-suspend guard (+ fixed `AdminTabs.tsx`'s `handleSuspend` to actually check the result instead of always showing success)
- [x] Report rate limiting (10/day, mirrors `createPost`/`createComment`'s daily-count pattern)
- [x] Admin report-alert emails via `resend` (`src/lib/email.ts`)
- [x] Comment helpful-vote persistence (`getPost()` now fetches per-comment vote state) + concurrent-vote race handling in `votes.ts`
- [x] Category source-of-truth consolidation (`prisma/seed.ts` and `SETUP.md` now derive from `src/lib/categories.ts` instead of duplicating category data)

## Current

- **Task:** none in progress — awaiting next task selection
- **Phase:** Phase 1 — Quick Wins

## Upcoming (Phase 1 — Quick Wins)

- [ ] Decide fate of unused `next-safe-action` dependency
- [ ] "DEMO DATA" watermark on seeded content in non-production
- [ ] Username-generator word list audit
- [ ] Consolidate category source-of-truth (`seed.ts` imports from `lib/categories.ts`)
- [ ] Remove `saathi.jsx` prototype from repo

## Upcoming (Phase 2 — Trust Improvements)

- [ ] Verified/Trusted Responder signal
- [ ] Verified Resource Directory
- [ ] Volunteer/Community Moderator role (`isAdmin` → `role` migration)

## Upcoming (Phase 3 — Safety Improvements)

- [ ] Crisis keyword detection + `Report.priority`
- [ ] Priority-sorted admin queue UI
- [ ] Immediate crisis-report alert email

## Upcoming (Phase 4 — Community Improvements)

- [ ] Comment-reply email notifications
- [ ] Hindi localization activation (safety-critical copy first)

## Upcoming (Phase 5 — AI Improvements)

- [ ] AI-assisted moderation triage (advisory sort only, fail-open)

## Upcoming (Phase 6 — Scale Improvements)

- [ ] Infrastructure-level rate limiting (Upstash Redis)
- [ ] Sentry wiring at existing `error.tsx` call site
- [ ] Full-text search migration (only if measured need)
- [ ] Exact pagination counts (only if measured need)
