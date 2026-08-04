# 🚀 Saathi — Setup & Deployment Guide
# Database: Supabase PostgreSQL

A solo founder can go from zero to live in **under 4 hours** following this guide.

---

## Prerequisites

- Node.js 20+ installed (`node -v` to check)
- A [Supabase](https://supabase.com) account (free PostgreSQL)
- A [Clerk](https://clerk.com) account (free auth)
- A [Vercel](https://vercel.com) account (free hosting)
- Git installed

---

## Step 1 — Create the Next.js Project

```bash
npx create-next-app@latest saathi \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd saathi

# Install all dependencies
npm install \
  @clerk/nextjs @prisma/client zod lucide-react \
  class-variance-authority clsx tailwind-merge \
  tailwindcss-animate svix resend

npm install -D prisma tsx
```

---

## Step 2 — Copy the Generated Files

Copy every file from the zip into its correct location:

```
.env.example              → root (copy to .env.local and fill in)
package.json              → root (replace)
next.config.ts            → root
tailwind.config.ts        → root (replace)
tsconfig.json             → root
prisma/schema.prisma      → create prisma/ folder first
prisma/seed.ts            → prisma/
src/middleware.ts          → src/
src/app/layout.tsx         → replace existing
src/app/globals.css        → replace existing
src/app/page.tsx           → replace existing
src/app/**/page.tsx        → all page files
src/actions/               → copy entire folder
src/components/            → copy entire folder
src/lib/                   → copy entire folder
src/i18n/                  → copy entire folder
```

---

## Step 3 — Set Up Supabase PostgreSQL

### 3a. Create a project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it **saathi**
3. Set a strong **database password** — save this somewhere safe
4. Choose the region **closest to your users** (e.g. `ap-south-1` Mumbai for India)
5. Click **Create new project** — provisioning takes ~2 minutes

### 3b. Get your connection strings

1. In your Supabase project → **Settings** (left sidebar) → **Database**
2. Scroll to **Connection string** → click the **URI** tab
3. You'll see two separate strings. Copy both:

```
┌─────────────────────────────────────────────────────────────────┐
│  CONNECTION STRING TAB          → Copy this                     │
├─────────────────────────────────────────────────────────────────┤
│  Transaction pooler (port 6543) → DATABASE_URL  (add ?pgbouncer=true)
│  Direct connection  (port 5432) → DIRECT_URL                   │
└─────────────────────────────────────────────────────────────────┘
```

The strings look like this:

```bash
# Transaction pooler — paste as DATABASE_URL (add ?pgbouncer=true at the end)
postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection — paste as DIRECT_URL
postgresql://postgres.[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres
```

> **Why two URLs?**
> Vercel runs your app as serverless functions that open and close DB connections constantly.
> Supabase's Transaction pooler (PgBouncer) handles this efficiently.
> But Prisma's migration CLI needs a persistent direct connection to run safely.
> Two URLs = best of both worlds.

> **Note on Row Level Security (RLS):**
> Supabase enables RLS by default, but it only applies to connections made through
> Supabase's REST/GraphQL API. Prisma connects directly to PostgreSQL using your
> database password — RLS is bypassed automatically. No extra configuration needed.

---

## Step 4 — Set Up Clerk Auth

1. Go to [clerk.com](https://clerk.com) → **Create Application**
2. Name it **Saathi**
3. Enable sign-in methods: **Email** + **Google** (recommended)
4. Go to **API Keys** → copy both keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

---

## Step 5 — Configure Environment Variables

```bash
# Copy the template
cp .env.example .env.local
```

Open `.env.local` and fill in every value:

```bash
# From Supabase → Settings → Database → Connection string
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres"

# From Clerk → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Leave these as-is for local dev
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/community
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/community

# Leave blank for now — fill in after deploy
CLERK_WEBHOOK_SECRET=
RESEND_API_KEY=
ADMIN_EMAIL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 6 — Initialise the Database

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to Supabase (creates all tables)
npx prisma db push

# Verify tables were created
npx prisma studio
# Opens at http://localhost:5555 — you should see all tables

# Seed with sample data (makes the platform feel alive on Day 1)
npm run db:seed
```

Expected seed output:
```
✅ Categories seeded
✅ Users seeded
✅ Posts seeded
✅ Comments seeded
✅ Helpful votes seeded
🎉 Saathi database ready. Run: npm run dev
```

You can also verify in Supabase:
**Supabase Dashboard → Table Editor** — all tables should be visible with data.

---

## Step 7 — Run Locally

```bash
npm run dev
# Open http://localhost:3000
```

Walk through this checklist before deploying:

- [ ] Homepage loads correctly
- [ ] Community feed shows seeded posts
- [ ] Click a post → full story loads
- [ ] Sign up → confirm you get an anonymous username (check Supabase → Table Editor → User)
- [ ] Create a post
- [ ] Leave a comment
- [ ] Mark a post as helpful
- [ ] Report a post → confirm it appears in `/admin` (after setting yourself as admin)
- [ ] Verify `/admin` redirects non-admin users to `/community`

---

## Step 8 — Deploy to Vercel

### Option A — Vercel + Supabase Native Integration (Recommended)

Supabase and Vercel have a one-click integration that auto-populates your database env vars:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Before deploying, go to **Storage** tab → **Connect Database** → **Supabase**
4. This auto-adds `DATABASE_URL` and `DIRECT_URL` to your Vercel project
5. Manually add the remaining vars (Clerk keys, webhook secret, etc.)
6. Click **Deploy**

### Option B — Manual Environment Variables

1. Push code to GitHub
2. Import on Vercel
3. In **Settings → Environment Variables**, add every variable from `.env.local`:

```
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET       ← fill in after Step 9
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
RESEND_API_KEY
ADMIN_EMAIL
NEXT_PUBLIC_APP_URL        ← set to your Vercel URL e.g. https://saathi.vercel.app
```

4. Click **Deploy**

---

## Step 9 — Post-Deploy Setup

### 9a. Run production migrations

After first deploy, run this from your local machine against the production DB:

```bash
# Uses DIRECT_URL — safe for schema migrations
npx prisma migrate deploy

# OR if you haven't created migration files yet:
npx prisma db push
```

> For production, always prefer `prisma migrate deploy` over `db push`.
> Create migrations with `npx prisma migrate dev --name init` locally first.

### 9b. Seed categories in production

The full seed (with sample users/posts) is for development only.
In production, only seed the categories:

```bash
# Run from Supabase → SQL Editor:
INSERT INTO "Category" (id, label, emoji, "desc", "order") VALUES
  ('students',  'Students',         '📚', 'Exams, academic stress, college life',  1),
  ('career',    'Career & Jobs',    '💼', 'Job loss, career confusion, workplace', 2),
  ('relations', 'Relationships',    '💛', 'Heartbreak, dating, boundaries',        3),
  ('family',    'Family Issues',    '🏠', 'Conflicts, estrangement, dynamics',     4),
  ('mens',      'Men''s Support',   '🧭', 'Challenges men navigate alone',         5),
  ('womens',    'Women''s Support', '🌸', 'Women supporting women',               6),
  ('lgbtq',     'LGBTQ+ Support',   '🌈', 'Identity, acceptance, safety',          7),
  ('elderly',   'Elderly Support',  '🌻', 'Isolation, aging, wisdom',              8),
  ('grief',     'Grief & Loss',     '🕊️', 'Loss, bereavement, healing',            9),
  ('financial', 'Financial Stress', '🌱', 'Debt, hardship, recovery',             10),
  ('parenting', 'Parenting',        '👶', 'Parenting challenges and joys',        11),
  ('mental',    'Mental Wellness',  '🧘', 'Anxiety, depression, coping',          12),
  ('other',     'Other',            '💬', 'Everything else',                      13)
ON CONFLICT (id) DO NOTHING;
```

Run this in: **Supabase Dashboard → SQL Editor → New query → Run**

### 9c. Set yourself as admin

1. Sign up on your live Vercel site
2. Go to **Supabase Dashboard → SQL Editor**
3. Run:

```sql
-- First, find your user
SELECT id, username, "clerkId" FROM "User";

-- Then set yourself as admin
UPDATE "User"
SET "isAdmin" = true
WHERE "clerkId" = 'user_your_clerk_id_here';
```

Your Clerk user ID is visible at:
**Clerk Dashboard → Users → click your account → User ID** (starts with `user_`)

### 9d. Set up the Clerk webhook

This auto-creates a DB row when a new user signs up:

1. Go to **Clerk Dashboard → Webhooks → Add Endpoint**
2. Endpoint URL: `https://your-vercel-url.vercel.app/api/webhooks/clerk`
3. Subscribe to event: **user.created**
4. Click **Create** → copy the **Signing Secret**
5. Add to Vercel env vars: `CLERK_WEBHOOK_SECRET=whsec_...`
6. Redeploy Vercel (env var changes require a redeploy)

### 9e. Add Clerk's domain to allowed origins

1. **Clerk Dashboard → Settings → Domains**
2. Add your Vercel URL: `https://your-saathi.vercel.app`

---

## Monthly Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | Free |
| Supabase | Free tier (500MB DB, 2 projects) | Free |
| Clerk | Free tier (10,000 MAU) | Free |
| Resend | Free tier (3,000 emails/month) | Free |
| **Total at launch** | | **$0/month** |

Supabase paid plan ($25/month) becomes relevant at ~500MB database storage or when you need daily backups. You won't hit this for a long time.

---

## Supabase-Specific Tips

### Viewing your data
**Supabase Dashboard → Table Editor** — browse and edit rows visually, like a spreadsheet.

### Running SQL
**Supabase Dashboard → SQL Editor** — run any SQL query. Bookmarks are saved per project.

### Database backups
Free tier: point-in-time recovery for 24 hours.
Pro tier ($25/month): 7-day backups.
For MVP: export regularly with `pg_dump` if you're on the free tier.

### Connection limits
Free tier: 60 direct connections, pooler handles up to 1,000+ connections.
This is more than enough for your MVP.

### Monitoring
**Supabase Dashboard → Reports** — query performance, slow queries, DB size.

---

## Common Issues

**"prepared statement already exists"**
This happens when `?pgbouncer=true` is missing from `DATABASE_URL` in Transaction pooler mode.
PgBouncer doesn't support prepared statements — Prisma needs to know it's using a pooler.
Fix: Ensure `?pgbouncer=true` is appended to your `DATABASE_URL`.

**"SSL connection required"**
Supabase requires SSL. Prisma adds `sslmode=require` automatically for Supabase URLs.
If you see this error, try appending `?sslmode=require` to `DIRECT_URL`.

**"Prisma schema not in sync"**
Run `npx prisma db push` (development) or `npx prisma migrate deploy` (production).

**Tables not appearing in Supabase Table Editor**
Supabase Table Editor only shows tables in the `public` schema.
The Prisma schema uses `public` by default. If missing, check `prisma/schema.prisma` and ensure no custom schema is set.

**"Max client connections reached"**
You're hitting the direct connection limit (60 on free tier).
Make sure `DATABASE_URL` uses the Transaction pooler URL (port 6543), not the direct URL.
Only `DIRECT_URL` should use port 5432.
