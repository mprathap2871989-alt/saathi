# Technical Debt Log

Issues discovered during implementation that are **intentionally deferred**. Nothing here
gets fixed opportunistically — it gets scheduled into a phase and moved to CHANGELOG.md
when actually done. Carried over from the initial codebase audit (`SAATHI_V2_AUDIT.md`)
plus anything newly discovered during execution.

---

## Deferred from audit

| Item | Description | Scheduled Phase | Source |
|---|---|---|---|
| Category source-of-truth duplication | Same 13 categories hardcoded in `lib/categories.ts`, `prisma/seed.ts`, `SETUP.md` SQL | Phase 1 | Audit §2.2 #3 |
| Comment vote state bug | `getPost()` doesn't fetch per-comment vote state; `CommentItem` always mounts `voted=false` | Phase 1 (scheduling TBD) | Audit §2.2 #2 |
| Blocklist not DB-editable | Phase 1 fix is a static in-code array; admin-editable DB table deferred | Phase 2 | Audit ADD #8 |
| `isAdmin` boolean vs `role` enum | Needs careful two-step additive-then-deprecate migration | Phase 2 | Audit ADD #6 |
| Middleware admin-role caching | Current per-action DB check is secure but costs a round trip; optimization only, not a security fix | Phase 6 | Audit §1.2 |
| `getPosts` search uses ILIKE (`contains`) | Fine at current scale; sequential scan won't scale indefinitely | Phase 6, metrics-gated | Audit §1.3 |
| Pagination `hasMore` heuristic | `posts.length === limit` is a correct but imprecise heuristic vs. exact `COUNT(*)` | Phase 6, metrics-gated | Audit §1.5 |
| `error.tsx` has no real error tracking | Comment already marks the call site; Sentry (or equivalent) not yet wired | Phase 6 | Audit §1.5 |
| `next-safe-action` dependency unused | Installed, never imported; decision (adopt vs. remove) not yet made | Phase 1 | Audit §1.7 |

## Newly discovered during execution

_(none yet)_
