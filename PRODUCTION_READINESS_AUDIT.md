# Saathi — Production Readiness Audit

**Scope:** operational readiness only, at commit `dde426a` (both Phase 1 release blockers resolved:
C1 middleware auth fix, C2 Next.js security upgrade — see `PHASE1_RELEASE_AUDIT.md`). This audit is
read-only. No code, schema, or configuration was changed to produce it, except where explicitly
noted as a genuine launch blocker (none were found).

---

## Step 1 — Production Environment Audit

| Item | Status | Notes |
|---|---|---|
| `DATABASE_URL` | **Missing (env var, expected — not committed)** | Documented correctly in `.env.example` with the pooled-connection pattern (port 6543, `?pgbouncer=true`) appropriate for Vercel serverless functions. Must be set in Vercel's project settings before first deploy. |
| `DIRECT_URL` | **Missing (env var, expected)** | Documented correctly, used only by the Prisma CLI for migrations, never by the running app. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | **Missing (env var, expected) — needs attention** | `.env.example` shows `pk_test_.../sk_test_...` placeholders. **Real risk if copied literally:** production must use `pk_live_.../sk_live_...` keys from a Clerk *production* instance, a separate user pool from the development instance. This isn't a code gap — it's a "don't paste the wrong key" operational risk, flagged explicitly in the checklist. |
| `CLERK_WEBHOOK_SECRET` | **Missing (env var, expected)** | Can only be obtained *after* creating the webhook endpoint in Clerk's dashboard, which itself requires the production URL to exist — this is inherently a post-first-deploy step, correctly sequenced as such in `SETUP.md` §9d. |
| `RESEND_API_KEY` / `ADMIN_EMAIL` / `EMAIL_FROM` | **Missing (env var, expected)** | All three correctly documented; `EMAIL_FROM` has a working zero-setup default (`onboarding@resend.dev`), with its single-recipient-until-domain-verified limitation already logged in `TECHNICAL_DEBT.md`. |
| `NEXT_PUBLIC_APP_URL` | **Missing (env var, expected) — highest-impact item to get right** | `next.config.ts`'s `experimental.serverActions.allowedOrigins` includes `localhost:3000` (correct for dev) but production origin-checking for Server Actions depends on this being set to the real deployed URL. Every single mutating action in this app — post creation, comments, votes, reports, every admin action — goes through a Server Action. Getting this wrong doesn't produce a subtle bug; it breaks the entire interactive surface of the app at once. Called out explicitly in the checklist. |
| Build command | **Configured correctly** | `next build`, Vercel's standard default for a Next.js project — no `vercel.json` override present or needed. |
| Install command | **Configured correctly** | Standard `npm install`, no custom install step. `package-lock.json` is present and committed, so Vercel will use `npm ci`-equivalent deterministic installs. |
| `postinstall` / `prisma generate` hook | **Needs attention (minor, not blocking)** | No explicit `"postinstall": "prisma generate"` script exists in `package.json`. Vercel has built-in detection that runs `prisma generate` automatically for projects with `@prisma/client` as a dependency, which very likely covers this — but Prisma's own official recommendation for *any* platform is an explicit `postinstall` script rather than relying on platform auto-detection. Not adding this now (would be a `package.json` change, outside this audit's read-only scope, and not a confirmed blocker) — flagged as a cheap, low-risk addition worth making in a future small task. |
| Node version | **Needs attention (minor)** | No `engines` field in `package.json`. Next.js 15.2.x requires Node ≥18.18. Vercel's own default Node version is very likely compatible, but "very likely" isn't the same as "verified" — worth explicitly checking Vercel's project settings rather than assuming, and pinning `engines.node` is a cheap way to make this unambiguous going forward. |

**Nothing here required a code change to document.** The one item worth elevating beyond "minor": `NEXT_PUBLIC_APP_URL` — not because it's misconfigured (it can't be misconfigured yet; it's simply unset, as expected pre-deploy), but because getting it wrong at deploy time has an unusually large blast radius for this specific app.

---

## Step 2 — Database Production Readiness

- **Schema:** reviewed against every model (`User`, `Category`, `Post`, `Comment`, `HelpfulVote`, `Report`) — no destructive operations, no development-only assumptions found. Soft-delete (`isRemoved`) is used consistently for user-generated content rather than hard deletes, which is itself a safety property (moderation actions are reversible at the data layer even though no "undo" UI exists yet).
- **Migrations:** **no `prisma/migrations/` directory exists.** This project has only ever used `prisma db push`. This is a genuine, real gap — `db push` has no migration history, no per-change audit trail, and no targeted rollback mechanism — but it is *not* a beta-blocking gap for a single-environment, pre-launch database with no production data yet to protect. `SETUP.md` already documents the correct path forward (`prisma migrate dev --name init` to establish a baseline, then `migrate deploy` for every change after) — the gap is that this hasn't been done yet, not that it's undocumented. Recommend doing this once, immediately after the beta's first stable week, before the first *real* post-launch schema change — not before launch itself.
- **Seed scripts:** `prisma/seed.ts` correctly separates full dev-seed (demo users/posts/comments, categories) from a `--categories-only` production mode (`npm run db:seed:categories`), added in a prior Phase 1 task specifically for this purpose. Verified idempotent — categories use `upsert`, safe to re-run.
- **Database connection handling:** `src/lib/prisma.ts` uses the correct, standard Next.js + Prisma singleton pattern (`globalForPrisma` guard against hot-reload connection exhaustion in dev, disabled in production where each serverless invocation is expected to get its own instance). No changes needed — this was already reviewed and praised in the original codebase audit and remains correct.
- **Backup considerations:** not something this codebase controls — this is a Supabase account/plan setting (automatic daily backups on paid tiers). Documented in the checklist as something to *confirm is enabled*, not something the code needs to implement.
- **Rollback approach:** given no migration history exists yet, the honest rollback story for the beta period is "restore a Supabase backup," not "revert migration N." Stated plainly in the checklist rather than implying a rollback mechanism exists that doesn't yet.

**Overall migration readiness: acceptable for a first beta, with one explicitly-logged follow-up** (establish a real migration baseline soon after launch, before the database has real user data whose loss would actually matter).

---

## Step 3 — Authentication Production Audit

**Clerk configuration:** `.env.example` correctly documents every required key and the exact webhook setup sequence. The one real operational risk — using test keys (`pk_test_`/`sk_test_`) instead of live keys in production — is a copy-paste risk, not a code defect, and is called out explicitly in the checklist.

**Middleware behavior — re-verified fresh, not assumed from prior sessions:**

```
src/middleware.ts:
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});
```

This is the corrected, C1-fixed version, confirmed present at the current commit — not stale documentation of a fix that happened but wasn't checked. `isProtectedRoute` matches `/create(.*)`, `/profile(.*)`, `/admin(.*)`; everything else (`/`, `/community`, `/post/[id]`, `/category/[slug]`, `/guidelines`) is correctly left public.

**Route-level verification, current codebase (static review — live re-verification against a running server was already performed as part of the C1/C2 fix tasks and isn't repeated here, since neither middleware.ts nor the auth-gating logic has changed since):**

| Route | Expected | Confirmed by |
|---|---|---|
| `/` | Public | Not matched by `isProtectedRoute` |
| `/community` | Public | Not matched by `isProtectedRoute` |
| `/create` | Protected | Matched; `auth.protect()` runs |
| `/profile` | Protected | Matched; `auth.protect()` runs |
| `/admin` | Protected by middleware **and** independently by the page component | Matched by middleware; `admin/page.tsx` additionally calls `auth()` + checks `isAdmin` server-side and redirects non-admins — confirmed present, unchanged, a real second layer, not just middleware |

**Admin authorization remains server-side, confirmed again at this commit, not assumed:** every admin-only server action — `removePost`, `removeComment`, `resolveReport`, `getPendingReports`, `suspendUser`, and both functions in `admin.ts` — independently re-checks `isAdmin` against the database before doing anything, regardless of what middleware or the page component already checked. This defense-in-depth pattern, praised in the original codebase audit, is unchanged by every fix made since.

**No authentication concerns block beta launch.** The only genuine unknowns are operational (which Clerk instance/keys get used), not architectural.

---

## Step 4 — Community Safety Audit

### What works today

- **Content filtering:** `containsBlockedContent()` (via `obscenity`, a maintained profanity/slur-detection library) gates both post and comment creation. Real, tested, not a placeholder — this was the Phase 1 fix that replaced a literal `["slur1","slur2"]` stub.
- **Reporting:** users can report posts and comments, with per-user-per-item dedupe (silent, no error shown for a repeat report on the same item) and a 10/day rate limit across all reports (prevents queue-flooding).
- **Admin notification:** a report triggers an email to `ADMIN_EMAIL` via Resend, so moderation doesn't depend on the admin remembering to check `/admin` proactively.
- **Moderation actions:** admin can remove a post, remove a comment, resolve (dismiss) a report, and suspend a user — all server-side gated, all functioning.
- **Self-suspend guard:** an admin cannot suspend their own account (fixed in Phase 1 after being identified as a real footgun).
- **Rate limiting on content creation:** 3 posts/day, 10 comments/day per user, independent of the reporting rate limit.

### What's missing before beta — assessed, not assumed critical by default

- **No un-suspend mechanism.** Once suspended, a user stays suspended unless the admin manually runs a SQL `UPDATE` via Supabase's SQL Editor. **Assessment: acceptable for beta**, not a blocker — it's a manual, documented (in the checklist) fallback using the same operational pattern already required for admin bootstrap (`SETUP.md` §9c), not a new kind of risk. Worth a real UI before the user base is large enough that suspension mistakes become common, but not before a first beta with expected-low volume.
- **No admin-editable blocklist.** Extending the block list today requires a code change and redeploy. **Assessment: acceptable for beta** — already logged in `TECHNICAL_DEBT.md`, scheduled for Phase 2, revisit-triggered by actual moderation experience rather than built preemptively.

### What can explicitly wait until after beta

- Tiered/volunteer moderator roles (`isAdmin` boolean → `role` enum) — already scoped in `TECHNICAL_DEBT.md` with a careful migration plan, correctly deferred to Phase 2.
- AI-assisted moderation triage — already scoped in the original V2 roadmap as Phase 5, explicitly metrics-gated on real report volume, not something a pre-launch beta needs.
- Crisis-keyword priority routing — a real, valuable idea from the earlier product roadmap, but out of scope for *this* audit's mandate (operational readiness, not new safety features) and not something a single admin's manual daily `/admin` check can't reasonably cover at beta volume.

**No new moderation features were built in this audit, per its own constraints.** Everything above is existing-state assessment.

---

## Step 6 — Metrics Readiness

**What's already observable, with zero new dependencies:**

- Registrations, resolved report count, live post count, live comment count — `getAdminStats()` already computes exactly these four numbers today, displayed on `/admin`.
- Individual report detail (who reported what, when, why) — `getPendingReports()`.
- Per-user last-sign-in — not in Saathi's own database at all, but Clerk's own dashboard already tracks and displays this per user, at zero cost, since Clerk is already the identity provider.

**What requires manual querying, not a dashboard, but is genuinely available today:**

- First-post-per-user, replies-per-post, category distribution — all straightforward `SELECT`/`GROUP BY` queries against the existing schema via Prisma Studio or Supabase's SQL Editor. No new table, no new instrumentation.

**What's intentionally not tracked, and shouldn't be for beta:**

- No analytics pipeline, no tracking pixel, no session/pageview logging exists anywhere in this codebase — confirmed in the original codebase audit (`package.json` has zero analytics dependencies) and unchanged since. This isn't a gap; it's a deliberate, documented product principle (`BUSINESS_PRINCIPLES.md`: *"no ad-targeting on emotional content," "no analytics pipeline"*). "Returning users" specifically is the one common beta metric that would normally come from such a pipeline — the honest answer is it's not directly queryable from Saathi's own data today, with Clerk's last-sign-in field offered as a real, already-available substitute rather than a reason to add tracking.

**No analytics dependency, tracking system, or new table is recommended by this audit** — consistent with the task's explicit constraints and Saathi's own stated principles.

---

## Summary Table

| Area | Status |
|---|---|
| Environment configuration | Correctly documented; nothing missing except expected pre-deploy secrets; one operational risk flagged (`NEXT_PUBLIC_APP_URL` correctness) |
| Database | Ready for beta; migration-history gap logged as a near-term (not pre-launch) follow-up |
| Authentication | Fully verified, no gaps; both C1 and C2 fixes confirmed present at this commit |
| Community safety | Core moderation loop works end-to-end and is server-side gated throughout; two known gaps (un-suspend UI, static blocklist) assessed as beta-acceptable, not blockers |
| Metrics | Adequate for beta via existing admin stats + manual queries + Clerk's own dashboard; no new tracking needed or recommended |

See `BETA_LAUNCH_CHECKLIST.md` for the corresponding action items.
