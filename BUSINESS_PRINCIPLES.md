# Solacial — Business Principles

This document exists so that product, engineering, and business decisions stay aligned as
Solacial grows — especially once monetization conversations start involving real organizations,
contracts, and revenue targets. Nothing here is aspirational; each principle is either already
true of the current architecture, or is a firm constraint on what gets built next. Sourced from
`MONETIZATION_AUDIT.md` (approved) — this document is the durable summary of that audit's
non-negotiables, kept up to date independently of any single audit's shelf life.

---

## Core Promise

> **A person asking for help should never be forced to pay to receive human support.**

This is not a pricing decision to be revisited under revenue pressure. It is a constraint on
every future feature, schema change, and business conversation. If a proposal requires
weakening this promise to work, the proposal is rejected — not the promise.

## Business Model

**Organizations pay. People receive support for free.**

Solacial's monetization path is B2B / B2B2C: universities, schools, hospitals, NGOs, corporate
Employee Assistance Programs, government programs, and community organizations may pay for
verified, managed community spaces, aggregate insight dashboards, or certification programs.
Individual users seeking peer support never see a paywall, regardless of whether their
community is public or organization-sponsored.

## Structural Guarantees (Not Just Policy)

These are true today, in the actual codebase, and any change that would make them untrue
must be treated as a principle violation requiring explicit review — not a routine schema
or feature update.

1. **Existing public content can never be retroactively paywalled or org-gated.**
   Enforced by the tenant-isolation approach in `ARCHITECTURE_DECISIONS.md`: a `NULL`
   organization reference means "public Solacial community," permanently, for every post
   and comment that exists today and every one created before organizations exist.

2. **User conversations are never sold.**
   No bulk-export, analytics-warehouse, or data-pipeline infrastructure exists in this
   codebase. Adding any such infrastructure — even for a legitimate internal purpose —
   requires explicit review against this principle before it ships, not an assumption
   that it's safe because the use case seems reasonable.

3. **User identities are never sold.**
   Solacial's own database stores no PII — no email, name, or contact information. That
   data lives only with the auth provider (Clerk), not in Solacial's schema. Any future
   change that adds PII fields to `User` is a privacy-review trigger, not a routine
   addition.

4. **Emotional content is never used for ad targeting.**
   No ad SDK or tracking infrastructure exists in this codebase, and none should be
   added. Any organization-facing analytics or dashboard feature must be built so it
   is structurally incapable of returning individual post or comment content — enforced
   at the query layer, not the UI layer, so it can't be bypassed by a future redesign.

5. **No training external AI models on private conversations without explicit opt-in.**
   Any feature that sends user-generated content to a third-party AI provider (e.g. the
   AI-assisted moderation triage planned for Phase 5) must confirm, contractually, that
   the provider does not train on submitted data. This applies retroactively to every
   such integration, not just ones added after this document exists.

## What Organizations Pay For

Verified/managed community spaces, aggregate wellbeing insights (never individual
conversations), and mentor/professional certification programs. Organizations never
purchase access to individual users' content, identity, or attention.

## What Will Never Be Built

- A paywall, subscription, or any payment requirement on the individual side of the product
- Advertising of any kind
- Sale or licensing of user conversations or identities to any third party
- An organization-facing dashboard or report that exposes individual, attributable
  conversation content — aggregate insights only, enforced at the query layer
- AI training on user content without explicit, informed opt-in

## Ownership

This document should be revisited whenever a new monetization audit is conducted, and
updated to reflect its findings — but the Core Promise and Structural Guarantees sections
should only ever be strengthened, never weakened, without a deliberate and explicit
decision to do so at the leadership level.
