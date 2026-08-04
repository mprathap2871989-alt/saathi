# Saathi V2 — Roadmap

Source of truth for what's done, in progress, and next. Updated at the end of every task.
Full rationale for every item lives in `SAATHI_V2_AUDIT.md`.

---

## Completed

_(none yet — baseline import only)_

## Current

- **Task:** Replace placeholder content blocklist with a real, production filter
- **Phase:** Phase 1 — Quick Wins
- **Status:** In progress

## Upcoming (Phase 1 — Quick Wins)

- [ ] Real content blocklist (current task)
- [ ] Category pre-selection from `?category=` on `/create`
- [ ] `suspendUser` self-suspend guard
- [ ] Report rate limiting (reuse existing daily-count pattern)
- [ ] Wire `resend` for admin report-alert emails
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
