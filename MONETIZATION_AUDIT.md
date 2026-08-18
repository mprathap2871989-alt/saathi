# Solacial — Monetization Readiness Audit

**Scope:** the current production schema and server-side architecture as of commit `549c858` (post Phase-1 tasks 1–2: real content blocklist, category pre-selection). This audit evaluates *architectural* readiness only — no monetization code, tables, or UI are being proposed for implementation. Everything below is grounded in the actual `prisma/schema.prisma`, `src/actions/*.ts`, and `package.json` as they exist today, not a hypothetical redesign.

**Guiding principle carried through every recommendation:** *a person asking for help should never be forced to pay to receive human support.* Every finding below is evaluated against whether it protects or threatens that promise — including checking whether it's protected structurally, not just by policy.

---

## 1. Monetization Readiness Score: **78 / 100**

**What's counted in favor:**
- **Zero blockers to additive extension.** Nothing in the current schema, query layer, or auth model needs to be *rewritten* to support B2B monetization — every recommendation in this audit is additive (new nullable columns, new standalone tables). This is worth a lot: a from-scratch schema that had to be reshaped to fit organizations would score far lower.
- **The auth foundation already has most of what's needed, unused.** Clerk (already the auth provider) ships a full Organizations primitive — org creation, membership, and roles (`admin`/`basic_member`) — as a first-class feature. Solacial doesn't use it today, but the exact sync pattern the app already uses for `User` (Clerk webhook → `prisma.user` row) is the same pattern that would sync `Organization`/`OrganizationMember`. This isn't a new architectural concept to introduce; it's applying a pattern that already exists once, elsewhere in the same codebase.
- **The `User` model has no PII to protect from a monetization pivot, because it was never collected.** `User` stores exactly `clerkId`, an auto-generated anonymous `username`, and moderation flags — no email, name, or contact info. That data lives only in Clerk, not in Solacial's own database. This is a genuine structural fact, not a policy promise: there is currently nothing in Solacial's own schema that *could* be sold, because it was never captured there in the first place.
- **The admin-dashboard aggregation pattern already exists and is exactly the right shape for the safest revenue model.** `getAdminStats()` in `src/actions/admin.ts` already does pure `prisma.<model>.count({ where: {...} })` queries — no row-level content is ever selected. This is precisely the pattern an "Employer Wellbeing aggregate insights" dashboard needs, and it already exists in the codebase for a different purpose.
- **Zero ad/analytics/data-pipeline infrastructure exists anywhere in `package.json`.** No ad SDK, no third-party analytics, no AI-training pipeline. There is nothing to "turn off" to keep the no-selling-conversations promise — it was never built.

**What's held back:**
- **No tenant-isolation concept exists anywhere yet.** Every query in `posts.ts`, `comments.ts`, `admin.ts` assumes a single global pool of content. This is real, un-started work — additive, not corrective, but genuinely not begun.
- **The `isAdmin` boolean is Solacial's only role primitive today.** It's global and binary. Org-scoped admin roles (an org's own moderator, who shouldn't see Solacial's global admin queue) need a real permissions model that doesn't exist yet — though the original V2 roadmap already has a Phase 2 item (`isAdmin` → `role` enum) that's a natural foundation for this, so it isn't starting from zero either.

A from-scratch product with this few technical blockers and this little PII exposure would reasonably score in the 80s; a few points are withheld specifically because "no blockers to build it" is different from "any of it is built," and the score should reflect that honestly.

---

## 2. Required Before Launch

**None of the 12 proposed tables need to exist before launch.**

This deserves justification, because it runs counter to the instinct to "add the tables now so migrations are easier later." In this specific case, that instinct is wrong, for a concrete technical reason: **Postgres supports fast, non-blocking additive schema changes.** Adding a nullable column (`ALTER TABLE "Post" ADD COLUMN "organizationId" TEXT`) or a brand-new standalone table doesn't rewrite existing rows and doesn't lock the table for meaningful time, regardless of whether it happens today or after a year of production traffic. The "painful future migration" this audit was asked to help avoid is a real risk in general — but it's a risk for *destructive or type-changing* changes (renaming a column, changing a type, backfilling a NOT NULL constraint onto existing rows), not for *purely additive* ones. None of the 12 proposed tables require anything destructive.

Given that, building 12 tables — most with zero rows for the foreseeable future — ahead of a single signed customer creates the same problem already flagged once in this codebase's own tech debt log: unused, speculative surface area (see `resend`/`next-safe-action`, installed and unused since V1). Dead schema is the database equivalent of dead dependencies: it's not neutral, it's a small ongoing cost (migration files to maintain, Prisma Studio clutter, onboarding confusion about what's real) with no offsetting value until it's actually used.

**The one thing genuinely worth doing before launch is not a schema change at all — it's a documented decision:**

> **Architecture Decision: tenant isolation via nullable FK, not table duplication.**
> When `organizationId` (or equivalent) is added to `Post`/`Comment`/`Category` in V2, it will be added as a **nullable** column, and `NULL` will mean "public Solacial community" — the exact same content and access pattern as today. No backfill, no default-org assignment, no migration of existing rows required. Every post and comment that exists at launch stays exactly as public and exactly as free as it is today, permanently, by construction — not by a policy decision someone has to remember to honor later.

Write this into `TECHNICAL_DEBT.md` (or a new `DECISIONS.md`) now, while the reasoning is fresh and before any commercial pressure exists to cut corners on it. That's a documentation task, not a code task — zero risk, zero migration, ships with no schema change.

---

## 3. Per-Table Evaluation

| Table | Required before launch? | Timing | Why |
|---|---|---|---|
| `Organization` | No | V2 | Additive standalone table; zero cost to defer. Recommend backing it with Clerk's native Organizations feature (already available, unused) rather than a fully custom implementation — sync pattern mirrors the existing `User` webhook sync. |
| `OrganizationMember` | No | V2 | Same reasoning as `Organization`. Depends on `Organization` existing first. |
| `OrganizationRole` | No, and reconsider building it at all | V2, decide later | A separate normalized role table is likely unnecessary — Clerk already provides org-level roles (`admin`/`basic_member`). Recommend a `role` enum column on `OrganizationMember` instead of a whole extra table, mirroring the `isAdmin`→`role` enum change already planned for `User` in the original Phase 2 roadmap. Don't decide the final shape until a real customer's actual permission needs are known — building a flexible role table for hypothetical needs is exactly the kind of premature complexity this audit's own engineering rules warn against. |
| `VerifiedCommunity` | No | V2 | This is the actual product-shaping concept (an org-scoped private support space) and deserves real design time against a real early customer's needs, not speculative schema now. Standalone table, zero coupling to existing `Post`/`Comment` rows until it's built. |
| `CommunitySubscription` | No | V2/V3 | Pure billing-relationship table. Zero coupling to content tables. Trivially additive whenever the first subscription actually needs representing. |
| `SubscriptionPlan` | No | V2/V3 | Same reasoning. Additionally: actual pricing tiers aren't decided yet — a schema for undecided pricing is guesswork, not architecture. |
| `BillingAccount` | No, and reconsider building it at all | V2/V3 | Recommend **not** hand-rolling billing/subscription state. Use Stripe (or equivalent) as the source of truth, synced via webhook — the exact same external-source-of-truth pattern the codebase already uses for Clerk → `User`. A local `BillingAccount` table, if needed at all, should be a thin cache of Stripe state, not a parallel ledger. |
| `BillingEvent` | No | V2/V3 | If built, this is a Stripe-webhook audit log — standalone, additive, zero risk to defer indefinitely until real billing events exist to log. |
| `Mentor` | No | V3 | Genuinely valuable long-term (Mentor Certification revenue line) but is its own product feature (training content, certification flow, badge display) far downstream of the first paying org customer. No technical dependency on anything shipping sooner. |
| `Volunteer` | No | V3 | Same reasoning as `Mentor`. **Flag for cross-referencing, not immediate action:** this concept overlaps with the "volunteer/community moderator" feature already scoped in the original V2 roadmap's Phase 2 (a `role` enum value on `User`, not a monetization feature). Don't build two separate "volunteer" concepts — when Phase 2's moderator role work happens, revisit whether monetized Mentor status and unpaid community moderation should share a table or stay separate. Deciding now, before either exists, would be guessing. |
| `Verification` | No | V3 | Tied to Mentor certification and "Verified Organization" badging — depends on which actual verification workflow a real customer needs. Standalone, zero cost to defer. |
| `OrganizationAdmin` | **No — recommend against building this at all, ever, as a separate table** | N/A | This repeats the exact anti-pattern already identified as tech debt in `User.isAdmin` (a rigid boolean instead of a scoped role) — except worse, as a whole separate table instead of a column. If `OrganizationMember.role` includes an `org_admin` value (see `OrganizationRole` row above), a dedicated `OrganizationAdmin` table is redundant by construction, not just premature. |

**Summary of the pattern above:** of the 12 proposed tables, only 4 (`Organization`, `OrganizationMember`, `VerifiedCommunity`, `CommunitySubscription`/`SubscriptionPlan`/`BillingAccount`/`BillingEvent` as a billing cluster) represent genuinely distinct future concepts worth eventually building. The rest either collapse into a `role` column on an existing table (`OrganizationRole`, `OrganizationAdmin`) or are correctly scoped much later (`Mentor`, `Volunteer`, `Verification`) because they depend on product decisions (pricing, certification design, which org signs first) that don't exist yet.

---

## 4. Safe to Defer — and Why Delaying Is Actually Safe

Every one of the 12 proposed tables is safe to defer to V2 or V3, for one structural reason that applies uniformly: **none of them require a change to an existing, populated table's shape in a non-additive way.** The two tables in the current schema that will actually accumulate meaningful data before any monetization ships — `Post` and `User` — only ever need *nullable, defaulted* additions (`organizationId String? @default(null)`), which Postgres handles as a fast metadata-only operation whether it happens on day one or after a year of production traffic. There is no version of this roadmap where waiting causes a schema-migration disaster, because nothing proposed here is destructive.

The actual risk of deferring isn't technical — it's product-timing: if a real B2B customer shows up before `VerifiedCommunity` exists, that's a sales conversation, not an emergency migration. That's the correct trade-off to accept deliberately, in exchange for not building four separate revenue-line schemas (Verified Orgs, University, Hospital, NGO) that turn out, on inspection, to be **the same underlying primitive** — see §5 below.

---

## 5. Revenue Opportunities vs. Current Architecture

| Model | Technical readiness | Notes |
|---|---|---|
| **1. Verified Organizations** (subscription) | Ready to build in V2, no blockers | Needs `Organization` + Stripe billing sync. Clerk Organizations feature removes most of the auth work. |
| **2. Employer Wellbeing** (aggregate insights only) | **Strongest-fit model given current architecture** | `getAdminStats()`'s pure-count pattern extends directly: an org-scoped equivalent (`prisma.post.count({ where: { organizationId } })`) never needs to touch row-level `Post.story` content. **Concrete architectural requirement, not just a policy note:** the org-facing insights function must be written so it is *structurally incapable* of returning individual post/comment text — a dedicated `getOrgAggregateInsights()` that only ever returns counts and percentages, enforced at the query layer, never in a shared function that also happens to expose row-level data behind a flag. This is the single most important recommendation in this audit. |
| **3. University Communities** | Same primitive as #1 | This is `VerifiedCommunity` with different branding — no separate schema needed. |
| **4. Hospital Support Communities** (condition-specific) | Same primitive as #1 and #3 | The existing `Category` model (admin-seeded, not user-created) is already a reasonable template for how condition-specific sub-scoping could work — reuse the pattern, don't rebuild it. |
| **5. NGO Platform** | Same primitive again | **Important finding:** models 1, 3, 4, and 5 are the same technical concept — an org-scoped private community — with four different sales narratives. The architecture should build this primitive exactly once (`VerifiedCommunity`), not four times under four names. |
| **6. Mentor Certification** | Correctly deferred to V3 | Genuinely distinct feature (training + certification flow), no dependency on anything shipping sooner, low risk to defer indefinitely until demand signal exists. |
| **7. Professional Directory** | Already scoped, unrelated to monetization work | This is the same feature as ADD #7 ("Verified Resource Directory") already planned for Phase 2 of the original V2 roadmap, as a trust/safety feature, not a revenue one. A referral-fee or featured-placement model could layer onto that *already-planned* `Resource` model later with no new schema today — another point toward "don't build ahead of need." |

---

## 6. Privacy Review

Checked against the four stated non-negotiables, against the actual codebase rather than policy alone:

- **Selling user conversations:** No bulk-export, analytics-warehouse, or data-pipeline infrastructure exists anywhere in `package.json` or the codebase. `Post.story` is only ever read through normal, individually-scoped app queries. There's nothing to disable to prevent this — it was never built. Any future addition of such infrastructure (even for a legitimate purpose, like a data warehouse for the company's own product analytics) should be treated as a decision requiring explicit review against this principle, not an assumed-safe engineering choice.
- **Selling user identities:** Structurally not possible from Solacial's own database today — `User` contains no email, name, or contact info; that data is held only by Clerk, not synced into Solacial's schema beyond `clerkId`. This is a real technical fact worth preserving deliberately: **any future schema change that adds PII fields to `User` should be treated as a privacy-review trigger**, not a routine addition.
- **Ad-targeting based on emotional content:** Zero ad SDKs or tracking infrastructure exist in the dependency tree. Recommend this be treated as an explicit architectural constraint (not just a current-state observation) for the Employer Wellbeing dashboard work in §5 — aggregate stats only, never content, never targeting, by construction.
- **Training external AI models on private conversations without opt-in:** No AI training pipeline exists today. This connects directly to a feature already scoped in the original V2 roadmap: **Phase 5's AI-assisted moderation triage sends flagged report text to an LLM for severity scoring.** That feature's implementation must confirm, contractually, that the LLM provider used does not train on submitted data — this is a concrete requirement to attach to that Phase 5 task specifically, not a hypothetical concern raised here for the first time.

No monetization path evaluated in this audit requires compromising any of the four principles. Where a path could plausibly *drift* into compromising one (Employer Wellbeing's dashboard, specifically), the audit recommends enforcing the boundary at the query layer, not the UI layer, so it can't be bypassed by a future dashboard redesign.

---

## 7. Schema Migration Plan

**Before launch:** no schema migration. §2's recommendation is a documentation-only decision record — zero risk, zero rollback needed, because nothing changes.

**When V2 org work actually begins** (only once a real customer or committed pilot exists — not speculatively), the additive migration order that preserves the guarantees above:

1. **`Organization` table** (standalone, new). Zero coupling to existing data. Rollback: `DROP TABLE` — no other table references it yet at this step.
2. **`OrganizationMember` table** (standalone, new, FK → `Organization` + `User`). Rollback: `DROP TABLE` — doesn't touch `User` rows.
3. **`Post.organizationId String?` and `Comment.organizationId String?`** — nullable, default `NULL`, FK → `Organization`. This is the only step that touches existing populated tables, and it's purely additive: every existing row gets `organizationId = NULL` automatically, meaning every existing post and comment remains exactly as public as it is today with zero backfill required. Rollback: `ALTER TABLE ... DROP COLUMN` — safe, since no application code depends on the column existing until step 4 ships.
4. **Update `getPosts()`/`getPost()` query filters** to scope by `organizationId` (defaulting to `WHERE organizationId IS NULL` for the existing public community routes, unchanged from today's behavior). Ship this in the same release as step 3, behind the assumption that the public routes' existing tests/behavior must be regression-checked first — this is the step with actual application risk, not the schema change itself.
5. **`VerifiedCommunity`, billing tables, role refinements** — all standalone, added whenever the corresponding feature actually ships, in any order, independently rollback-able.

**Zero data loss guarantee:** at every step above, existing `Post`/`Comment`/`User` rows are never modified, only ever gain a new `NULL`-defaulted column. No existing row's visibility, ownership, or content changes as a result of this migration path.

---

## 8. Risk Analysis

- **Technical risk: Low.** No proposed change requires touching existing row data or changing an existing column's type. The one real technical risk is step 4 above (query-filter changes to `getPosts`/`getPost`) — not the schema itself — and that's a normal, testable code change, not a migration risk.
- **Product risk: Medium.** Building four separately-branded revenue lines (§5, models 1/3/4/5) as four separate schemas would create real long-term product risk (divergent feature sets, duplicated admin tooling, confused positioning). Mitigated by this audit's explicit recommendation to build the single `VerifiedCommunity` primitive once.
- **Privacy risk: Medium, concentrated in one specific place.** The Employer Wellbeing dashboard (§5, model 2) is the only revenue model with a real path to leaking individual content into an org-facing view if built carelessly (e.g., a "recent activity" feed that isn't actually aggregated). Mitigated by enforcing aggregation at the query layer specifically, as recommended above — not a general platform risk, a specific one to design against deliberately in that one feature.
- **Trust risk: Low, and mostly self-protecting.** Because the public community's data model doesn't change (nullable FK = public, unchanged), there's no version of this roadmap where an existing free user's content becomes paywalled or org-gated retroactively. The core promise is protected structurally, not just by intent.
- **Regulatory risk: Worth flagging, not currently assessed.** Hospital/condition-specific communities (§5, model 4) likely touch health-data-adjacent regulatory considerations (e.g., HIPAA-adjacent obligations in the US, or equivalent frameworks elsewhere, depending on target market) that are outside the scope of a codebase audit. Recommend a separate legal/compliance review before that specific revenue line is pursued — this audit only confirms the architecture doesn't *prevent* building it, not that it's cleared for that market.

---

## 9. Final Recommendation

### **APPROVED FOR LAUNCH**

**Supporting evidence from the current codebase:**
- No schema change is required before launch — confirmed by tracing every proposed table against the current `Post`/`User`/`Comment` schema and finding zero destructive-migration exposure, because Postgres additive changes are cheap regardless of timing.
- The core promise — free support for individuals — is protected structurally, not just by policy: `User` contains no PII to monetize, no ad/analytics/AI-training infrastructure exists to misuse, and the recommended nullable-FK tenant-isolation pattern means existing public content can never be retroactively paywalled or org-gated by a future migration.
- The one action genuinely worth taking now is a documentation task (§2's decision record), not a code change — zero risk, no migration, no impact on the Phase 1 work already shipped or in progress.
- All 12 proposed tables are correctly deferrable with no compounding cost, because none of them touch existing populated data in a non-additive way.

This conclusion does not block or alter anything in the current Phase 1 execution plan. Recommend returning to the in-progress roadmap (`suspendUser` self-suspend guard, next) with this audit's one action item — writing the tenant-isolation decision record — logged as a small, non-blocking documentation task rather than inserted into the active feature sequence.
