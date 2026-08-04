# Architecture Decision Records

Short, durable records of decisions that shape future schema/architecture work but don't
require code changes themselves. Newest first. See `MONETIZATION_AUDIT.md` for the full
analysis behind ADR-0001.

---

## ADR-0001: Tenant Isolation via Nullable `organizationId`, Not Table Duplication or Backfill

**Status:** Accepted
**Date:** 2026-08-04
**Source:** `MONETIZATION_AUDIT.md`, §2 and §7

### Context

Saathi's monetization path (B2B/B2B2C — see `BUSINESS_PRINCIPLES.md`) will eventually require
organization-scoped private communities alongside the existing public Saathi community. No
organization-related schema exists today; `Post`, `Comment`, and `Category` are entirely
global. The monetization audit evaluated whether any schema change is needed *now* to avoid a
painful migration *later*, and concluded no schema change is required before launch — but the
**approach** those future columns will take needs to be decided now, while the reasoning is
fresh, so it isn't improvised under commercial pressure later.

### Decision

When organization support is built (V2 or later), tenant scoping will be added as:

```
Post.organizationId    String?  // nullable, no default constraint beyond NULL
Comment.organizationId String?  // same
```

**`NULL` means "public Saathi community"** — the exact same content, visibility, and access
pattern that exists today. This applies retroactively to every row that exists at the time the
column is added: no backfill, no default-organization assignment, no migration of existing
content. Public content stays public by construction, not by a migration script someone has to
get right.

Organization membership and roles (`Organization`, `OrganizationMember`) will similarly be
built as new, standalone additive tables — not by reshaping `User` or introducing a parallel
user model. Recommend syncing `Organization`/`OrganizationMember` from Clerk's native
Organizations feature, mirroring the existing Clerk-webhook → `User` sync pattern already used
in this codebase, rather than hand-rolling a parallel org/membership system.

### Consequences

**What this buys us:**
- Every post and comment that exists before organizations exist remains exactly as public and
  exactly as free as it is today, permanently — enforced by the schema, not a policy note.
- The migration itself is a fast, non-blocking Postgres operation (`ADD COLUMN ... DEFAULT
  NULL`) regardless of how much production data exists when it happens — there is no version
  of this plan where waiting makes the eventual migration harder.
- Query changes (scoping `getPosts()`/`getPost()` by `organizationId`) can default to `WHERE
  organizationId IS NULL` for all existing public routes, meaning today's behavior is the
  literal default case going forward, not a special-cased exception.

**What this costs us:**
- Every future query against `Post`/`Comment` that needs to respect tenant boundaries must
  explicitly handle the `NULL` case correctly. This is a normal, testable code-review concern
  for whoever builds the V2 org-scoping work — not a schema risk, but worth naming so it isn't
  missed silently in a future PR.
- A `role` column on `OrganizationMember` (rather than a separate `OrganizationRole` table) is
  the assumed direction per the monetization audit, but the final shape isn't decided until a
  real organization's actual permission needs are known. This ADR doesn't lock that in — only
  the tenant-isolation pattern above.

### Alternatives Considered

- **Backfilling a default "Saathi Public" organization row and assigning it to every existing
  post.** Rejected — adds a migration step with no benefit over `NULL`, and creates a
  meaningless organization row that every query has to know to treat as special anyway.
- **A separate `OrgPost`/`OrgComment` table, parallel to `Post`/`Comment`.** Rejected — doubles
  the moderation, reporting, and voting logic that already exists and works for the public
  community, for no structural benefit over a nullable FK on the existing tables.

### Revisit If

- A real organization signs on and the actual query-scoping and permission-model needs turn out
  to differ meaningfully from what's assumed here.
- Postgres-level performance data on the `organizationId IS NULL` query path suggests an index
  or partial-index strategy is needed at scale (not a concern at current traffic).
