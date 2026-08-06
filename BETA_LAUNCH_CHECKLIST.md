# Saathi — Beta Launch Checklist

Practical, for a solo founder. Every item here is something to actually do or actually check —
not a restatement of engineering work already done. Full technical detail behind each item
lives in `PHASE1_RELEASE_AUDIT.md` (code/security) and `PRODUCTION_READINESS_AUDIT.md`
(this checklist's source audit).

---

## Before Launch

### Environment

- [ ] `DATABASE_URL` set in Vercel — pooled connection string (port 6543, `?pgbouncer=true`), from Supabase → Settings → Database
- [ ] `DIRECT_URL` set in Vercel — direct/session connection string (port 5432), used only by Prisma CLI for migrations
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — **production** key (`pk_live_...`), not a test key
- [ ] `CLERK_SECRET_KEY` — **production** key (`sk_live_...`), not a test key
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/community`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/community` — all set exactly as in `.env.example`
- [ ] `CLERK_WEBHOOK_SECRET` — from Clerk Dashboard → Webhooks, **after** the webhook endpoint is created (see Authentication section below)
- [ ] `RESEND_API_KEY` and `ADMIN_EMAIL` — set to a real email you'll actually check
- [ ] `EMAIL_FROM` — either leave as the default `onboarding@resend.dev` (works immediately, but only delivers to the email tied to your Resend account) or verify a domain in Resend and set your own sender
- [ ] `NEXT_PUBLIC_APP_URL` — set to your real production URL (e.g. `https://saathi.vercel.app` or your custom domain), **not** `http://localhost:3000`. Getting this wrong will break every Server Action (post creation, comments, votes, reports, admin actions) via Next.js's origin check — this is the single highest-impact env var to double-check.
- [ ] Confirm Vercel is building with **Node 18.18+** (Next.js 15.2's minimum). No `engines` field is currently pinned in `package.json`, so Vercel will use its own default — check your Vercel project's Node version setting explicitly rather than assuming.

### Database

- [ ] Run `npx prisma db push` against production (or `npx prisma migrate deploy` if you've generated migration files — see note below)
- [ ] Run `npm run db:seed:categories` against production — **not** `npm run db:seed`, which also creates demo users/posts/comments you don't want live
- [ ] Verify in Prisma Studio (`npx prisma studio`, pointed at production) that all 13 categories exist and no demo data leaked in
- [ ] **Known gap, not a blocker for a first beta:** no `prisma/migrations/` folder exists yet — this project has only ever used `prisma db push`, which has no migration history and no built-in rollback. Fine for a single-environment beta with no prior production data to protect; before your first *post-launch* schema change, run `npx prisma migrate dev --name init` locally once to establish a real migration baseline, so every change after that goes through `prisma migrate deploy` instead of `db push`.
- [ ] Rollback plan for beta: since there's no migration history yet, "rollback" today means restoring a Supabase database backup (Supabase takes automatic daily backups on paid tiers — confirm your plan includes this) rather than reverting a specific migration. Know where that setting is in your Supabase dashboard before launch, not after something goes wrong.

### Authentication

- [ ] Clerk webhook configured: **Clerk Dashboard → Webhooks → Add Endpoint**, URL `https://<your-domain>/api/webhooks/clerk`, subscribed to `user.created`. This is what auto-creates a `User` row when someone signs up — without it, `getOrCreateUser`'s fallback path still works, but the primary sync path won't.
- [ ] Confirm you're using Clerk's **production instance**, not the development instance (separate user pools — signing up in dev mode won't show up in production, and vice versa)
- [ ] Manually verify: visiting `/create`, `/profile`, or `/admin` while signed out redirects to sign-in (does **not** show a 500 error, and does **not** show the page content)

### Admin Account Setup

- [ ] Sign up on the live production site with your own account first
- [ ] Follow `SETUP.md` §9c: find your `clerkId` in Clerk Dashboard → Users, then run a one-time SQL `UPDATE "User" SET "isAdmin" = true WHERE "clerkId" = '...'` via Supabase's SQL Editor
- [ ] Confirm `/admin` loads and shows your stats dashboard (post/user/report/comment counts) after this
- [ ] **Known gap:** there's no way to un-suspend a user or remove admin status through the UI — both are one-off, same-pattern manual SQL operations via Supabase's SQL Editor if ever needed. Acceptable for a low-volume beta; know this before you need it, not while you need it.

### Moderation Readiness

- [ ] Confirm you (the admin) will actually check `/admin` regularly, or that report-alert emails are arriving — test this end to end: report a real (test) post, confirm the email lands in your inbox
- [ ] Read through `guidelines/page.tsx`'s content once as if you were a new user — confirm it still reflects how you actually intend to moderate
- [ ] Decide your own personal SLA for reports before launch (e.g. "I check `/admin` every morning") — the platform's own guidelines page states content is reviewed, so this is a promise to keep, not just a nice-to-have

---

## Launch Day

### Smoke Tests (do these yourself, on the live production URL, before telling anyone else)

- [ ] Visit `/` and `/community` signed out — both load, no errors
- [ ] Sign up as a brand-new test account
- [ ] Create a post — appears in `/community`, category shows correctly
- [ ] Comment on your own post
- [ ] Mark your own comment/post as helpful, refresh the page, confirm the vote persisted
- [ ] Report a piece of content (your own test post is fine) — confirm the email alert arrives, and the report appears in `/admin`
- [ ] As admin, resolve that test report, confirm it disappears from the pending queue
- [ ] As admin, remove a test post, confirm it disappears from `/community`
- [ ] Sign out, try `/create`, `/profile`, `/admin` again — all three still correctly block access

### Monitoring

- [ ] No error-tracking service (Sentry or similar) is wired up yet — `error.tsx` has a comment marking exactly where it would go, but nothing is connected (logged in `TECHNICAL_DEBT.md`, correctly deferred, not a beta blocker). For launch day, your monitoring is: **Vercel's own function logs** (Vercel Dashboard → your project → Logs) — check these directly if something seems wrong, since nothing will proactively alert you yet.
- [ ] Keep a browser tab open on Vercel's deployment logs for the first few hours after announcing the beta

### Support Process

- [ ] Decide, before launch, where a user can reach you if something breaks for them (email in your bio/guidelines page, or similar) — there's no in-app support/contact mechanism today, and building one is out of scope for this task
- [ ] Watch your `ADMIN_EMAIL` inbox for report alerts as your de facto real-time signal during the first days

---

## After Launch

### User Feedback Review

- [ ] Set a recurring reminder (daily for the first week, then weekly) to actually read through new posts/comments yourself — not just moderate reports, but get a feel for what people are actually using the platform for
- [ ] Note anything that surprises you about how the categories or features are actually being used

### Bug Triage

- [ ] Check Vercel logs for recurring errors, not just the ones a user reports to you directly
- [ ] Log anything found in `TECHNICAL_DEBT.md`, following this repo's existing convention — don't fix opportunistically mid-triage unless it's a genuine active incident

### Moderation Review

- [ ] Weekly: review resolved reports in aggregate — are the same few users generating most reports? Is the blocklist catching what it should?
- [ ] Revisit `TECHNICAL_DEBT.md`'s "Blocklist not DB-editable" item once/if you find yourself wanting to add a term without a redeploy — that's the real signal it's time to schedule that Phase 2 item, not before

---

## Minimum Beta Metrics (see `PRODUCTION_READINESS_AUDIT.md` §6 for full reasoning)

All observable today with zero new dependencies, via Prisma Studio or direct SQL against production:

| Metric | How to check today |
|---|---|
| Registrations | `SELECT COUNT(*) FROM "User"` (or `getAdminStats()`'s existing `userCount`) |
| First post created (per user) | `SELECT "userId", MIN("createdAt") FROM "Post" GROUP BY "userId"` |
| Replies | `SELECT COUNT(*) FROM "Comment"` (or `getAdminStats()`'s existing `commentCount`) |
| Returning users | **Not directly queryable from Saathi's own DB** — but Clerk's own dashboard (Clerk Dashboard → Users → a user's detail page) already shows last-sign-in time per user, at zero additional cost. Good enough for a solo-founder beta; don't build a custom analytics table for this. |
| Reports | `getAdminStats()`'s existing `reportCount`, or the `/admin` dashboard directly |

No analytics dependency, no tracking pixel, no new table. This is checking the database and Clerk's own dashboard by hand — appropriate for beta volume, not something to automate yet.
