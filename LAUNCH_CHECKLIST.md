# Saathi — Code Review & MVP Launch Checklist

> Senior advisor review. Be honest. Ship nothing until this is done.

---

## 🔍 Code Review Findings

### 🐛 Bugs Fixed in This Session
| # | Bug | Fix Applied |
|---|-----|-------------|
| 1 | `CommentItem` had a broken `onReport` callback prop that was never wired | Removed prop; `ReportButton` embedded directly inside `CommentItem` |
| 2 | `createPost` returned `{ success, postId }` but create page didn't handle redirect | Added `router.push('/post/${res.postId}')` after success |
| 3 | `getPost` could return `null` and page didn't guard before rendering | Added `notFound()` call |
| 4 | `getMyProfile` returns `null` on first visit before user row exists | Added `getOrCreateUser()` call at top of profile page |
| 5 | Category page had no `notFound()` guard for unknown slugs | Added CATEGORIES lookup before fetch |

---

### ⚠️ Missing Functionality

#### HIGH PRIORITY (fix before launch)
1. **Clerk webhook for user creation**
   The `getOrCreateUser()` is called lazily on first DB-hitting action.
   But if a user signs up and immediately browses without posting, they have no DB row.
   **Fix:** Create a Clerk webhook at `/api/webhooks/clerk` that calls `getOrCreateUser` on `user.created` event.

   ```ts
   // src/app/api/webhooks/clerk/route.ts
   import { Webhook } from 'svix';
   import { prisma } from '@/lib/prisma';
   import { generateUniqueUsername } from '@/lib/username-generator';

   export async function POST(req: Request) {
     const payload = await req.text();
     const headers = Object.fromEntries(req.headers);
     const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
     const event = wh.verify(payload, headers) as any;
     if (event.type === 'user.created') {
       const username = await generateUniqueUsername(async (name) => {
         return !!(await prisma.user.findUnique({ where: { username: name } }));
       });
       await prisma.user.create({
         data: { clerkId: event.data.id, username },
       });
     }
     return Response.json({ ok: true });
   }
   ```

2. **`createPost` pre-selects category from URL param**
   The create page doesn't read `?category=` from the URL even though category pages link there.
   **Fix:** Add `useSearchParams()` in the create page to read and pre-select the category.

   ```ts
   const searchParams = useSearchParams();
   const [category, setCategory] = useState(searchParams.get('category') ?? '');
   ```

3. **Rate limiting is in-app only — no infrastructure protection**
   The 3 posts/day and 10 comments/day limits exist in server actions.
   A determined bad actor could bypass them by rotating Clerk accounts.
   **Fix (Phase 2):** Add Upstash Redis rate limiting at the middleware level.

4. **No email notifications**
   Users have no way to know when someone responds to their post.
   This kills return visits — the most important metric for MVP success.
   **Fix:** After `createComment`, send a Resend email to the post author.
   Simple implementation, huge impact. Add before launch, not after.

   ```bash
   npm install resend
   ```

5. **Admin route is protected only by a DB flag**
   If an attacker sets `isAdmin: true` on their own account via a DB injection,
   they get full admin access. The middleware only checks authentication, not admin role.
   **Current risk level:** LOW (DB is not publicly accessible) but acknowledge it.
   **Fix (Phase 2):** Add admin email allowlist in env vars as second check.

6. **`getPosts` has no total count — pagination is "blind"**
   The Pagination component shows "Next" even when there are exactly 15 results
   and no further pages. Users will click Next and see an empty page.
   **Fix:** Add a `getPostCount` query alongside `getPosts` and pass `hasMore` correctly.

   ```ts
   // In posts.ts — add alongside getPosts
   export async function getPostCount(where: Prisma.PostWhereInput) {
     return prisma.post.count({ where });
   }
   ```

7. **`getPost` makes N+1 comment vote queries**
   Currently fetching all comments then the current user's helpful votes separately.
   At scale this is slow.
   **Fix:** Fetch user's comment votes in a single `prisma.helpfulVote.findMany` call filtered by `commentId IN [commentIds]`.

---

### 🔒 Security Concerns

| Severity | Issue | Fix |
|----------|-------|-----|
| 🔴 HIGH | No CSRF protection on server actions | Next.js 14+ handles this natively for same-origin requests. Verify `allowedOrigins` in `next.config.ts` matches your domain. |
| 🔴 HIGH | `containsBlockedContent()` blocklist is empty in production | Add a real profanity/slur blocklist before launch. Use the `bad-words` npm package as a starting point. |
| 🟡 MED | Server actions don't sanitize HTML — XSS possible if rendered as `dangerouslySetInnerHTML` | All story/comment text is rendered via React's `{text}` (not `dangerouslySetInnerHTML`), so XSS is blocked. Keep it this way. |
| 🟡 MED | `suspendUser` action takes an internal DB user ID — not a Clerk ID | A malicious admin could suspend any user including themselves accidentally. Low risk but add a guard: `if (targetUserId === adminUser.id) return { error: 'Cannot suspend yourself' }` |
| 🟡 MED | No input length check at the DB layer | Prisma `@db.VarChar(200)` on title truncates silently. Zod validation in server action is the real gate — this is correct. |
| 🟢 LOW | Seeded users have predictable Clerk IDs (`clerk_seed_*`) | These are dev-only. `prisma db push` + `db:seed` is only run in development. Production DB should only get `prisma migrate deploy`. |

---

### 🛡️ Trust & Safety Concerns

| Priority | Concern | Recommendation |
|----------|---------|----------------|
| 🔴 CRITICAL | **No crisis keyword detection** | Before launch, add a server-side check: if a post/comment contains words like "suicide", "kill myself", "end my life", automatically append the iCall number to the confirmation response AND flag the post for admin review. |
| 🔴 CRITICAL | **No moderator alert system** | When a report is filed, nobody is notified. An admin must manually check the dashboard. **Fix:** Send an email to the admin address via Resend when a report is submitted. |
| 🟡 HIGH | **No cool-down on report submission** | A troll could submit 100 reports to flood the admin queue. **Fix:** Add rate limiting — max 5 reports per user per hour. |
| 🟡 HIGH | **Seeded data uses real-feeling stories** | If testers take screenshots of seed data and share it externally, it could be mistaken for real user data. Add a visible "DEMO DATA" watermark in development mode. |
| 🟡 MED | **No distinction between "crisis" and "standard" reports** | A crisis report ("person may be in immediate danger") should trigger an instant admin email, not sit in a queue. Implement priority routing. |
| 🟢 LOW | **Username generation could produce unfortunate combinations** | "SilentPain", "DyingHope" etc. are possible with current word lists. Audit and remove dark combinations from the adjective/noun lists. |

---

### 🚨 Production Blockers

These **must** be resolved before going live:

- [ ] **`CLERK_WEBHOOK_SECRET` env var** — Create the webhook in Clerk dashboard, copy the signing secret, add to Vercel env vars
- [ ] **`containsBlockedContent()` is a stub** — Add a real blocklist (minimum: slurs, explicit content)
- [ ] **Crisis keyword detection** — Add before launch (30 min of work, enormous safety value)
- [ ] **Admin email notification on report** — Add Resend; 1 hour of work
- [ ] **Admin email is a DB flag only** — Set your account as admin immediately after first deploy
- [ ] **`NEXT_PUBLIC_APP_URL`** — Update to Vercel URL before deploying; affects Clerk redirect
- [ ] **`prisma migrate` vs `prisma db push`** — Production should use `prisma migrate deploy`, not `db push`. Generate and commit migrations before deploying.
- [ ] **Remove seed users from production** — The seeded Clerk IDs don't exist in production Clerk; create a production-only seed that only seeds categories, not users/posts.

---

## ✅ MVP Launch Checklist

### Phase 0 — Before You Write Code (1 day)
- [ ] Read Community Guidelines aloud to 3 people and get their honest reaction
- [ ] Decide your crisis response protocol in writing: what exactly happens when someone posts a crisis message?
- [ ] Identify 10 real early users who will post within the first week
- [ ] Write 5 seed stories yourself as the founder (more authentic than generated ones)

### Phase 1 — Local Setup (2–4 hours)
- [ ] `npx create-next-app@latest saathi --typescript --tailwind --app --src-dir`
- [ ] Copy all generated files to correct locations
- [ ] `npm install`
- [ ] Create `.env.local` from `.env.example`
- [ ] Supabase: create project → Settings → Database → copy Transaction pooler URL (`DATABASE_URL`) and Direct URL (`DIRECT_URL`)
- [ ] Clerk: create app, copy keys, set redirect URLs
- [ ] `npx prisma generate`
- [ ] `npx prisma db push`
- [ ] `npm run db:seed` (development only)
- [ ] `npm run dev` → verify all pages load
- [ ] Test full flow: sign up → create post → comment → helpful vote → report

### Phase 2 — Bug Fixes Before Deploy (4 hours)
- [ ] Add Clerk webhook route (`/api/webhooks/clerk`)
- [ ] Add `?category=` pre-selection in create page
- [ ] Add real profanity blocklist (use `bad-words` package)
- [ ] Add crisis keyword detection in `createPost` and `createComment`
- [ ] Add `getPostCount` for correct pagination
- [ ] Fix `suspendUser` self-suspend guard
- [ ] Add admin email alert on new report (Resend, 20 lines)
- [ ] Test all server actions return sensible errors

### Phase 3 — Deploy (1–2 hours)
- [ ] Push to GitHub
- [ ] Import on Vercel
- [ ] Add all env vars in Vercel dashboard:
  - `DATABASE_URL`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `CLERK_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_APP_URL`
- [ ] Trigger deploy
- [ ] Run `npx prisma migrate deploy` locally against production DB (uses `DIRECT_URL` automatically)
- [ ] Seed categories only (not users/posts) in production
- [ ] Sign up on the live site
- [ ] Set yourself as admin via **Supabase Dashboard → SQL Editor**:
  ```sql
  UPDATE "User" SET "isAdmin" = true WHERE "clerkId" = 'user_your_clerk_id';
  ```
- [ ] Create Clerk webhook pointing to `https://yourdomain.com/api/webhooks/clerk`
- [ ] Test report flow end-to-end on production

### Phase 4 — Soft Launch (Week 1)
- [ ] Share with 10 trusted people only
- [ ] Seed the platform with 5–10 authentic stories (write them yourself)
- [ ] Check admin panel daily — respond to every report within 2 hours
- [ ] Read every comment posted — understand the tone
- [ ] Note what categories get the most posts (informs Phase 2)
- [ ] Note any phrasing that feels wrong or unsafe

### Phase 5 — Public Launch Readiness
**Don't go public until:**
- [ ] At least 20 genuine posts exist
- [ ] At least 30 genuine comments exist  
- [ ] You have responded to every report within 2 hours for 2 weeks
- [ ] You have a written crisis response protocol
- [ ] You have at least 1 moderator volunteer (not just yourself)
- [ ] You have Resend email alerts working for reports

---

## 📊 MVP Success Metrics (Week 1–4)

Track these manually in a spreadsheet. Don't obsess over dashboards yet.

| Metric | Week 1 Target | Week 4 Target | What it tells you |
|--------|--------------|---------------|-------------------|
| New posts | 5 | 30 | People trust the platform enough to share |
| Comments per post | 1.5 | 2.5 | Community is responding |
| Return visits | — | 40% of users return | People feel connection |
| Helpful votes per post | 3 | 8 | Content is resonating |
| Reports filed | < 3 | < 10 | Community is healthy |
| Admin action rate | 100% | 100% | You are staying on top of moderation |

**The one metric that matters most:**
> Did someone post, receive a real human response, and feel less alone?

Ask your early users directly. Read the comments. That's your product-market fit signal.

---

## 🗺️ What Comes After the MVP

**Phase 2 (Month 2–3):**
- Email digests ("Someone responded to your story")
- Volunteer moderator system (trusted community members)
- Crisis keyword auto-detection with iCall link
- Basic analytics (which categories are growing)
- Language toggle (Hindi UI)

**Phase 3 (Month 4–6):**
- Verified resource directory (therapists, NGOs — no marketplace, just listings)
- Community challenges ("One thing that helped me this week")
- Post bookmarking
- Weekly email digest for community members

**Never build** (without serious reconsideration):
- Real-time chat (safety, moderation complexity)
- Direct messages (harassment vector)
- Follower/popularity systems (defeats the mission)
- Paid features before the community trusts you

---

*The goal is not a feature-complete product. The goal is for one person to feel genuinely less alone because Saathi exists.*
