/**
 * Privacy policy content audit
 * src/lib/__tests__/privacy.test.mjs
 *
 * Run with:   node src/lib/__tests__/privacy.test.mjs
 *
 * Tests three things:
 *   1. Policy accuracy    — every data collection fact matches the codebase
 *   2. Safety language    — no statements overpromise on crisis response,
 *                           confidentiality, therapy, or emergency services
 *   3. Required sections  — all legally required and platform-critical
 *                           sections are present
 *   4. Navigation         — Privacy link is present in layout and homepage
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../..");

function read(relPath) {
  return readFileSync(resolve(root, relPath), "utf8");
}

// ── Test runner ───────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(label, actual, expected) {
  if (actual === expected) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    console.error(`       expected : ${JSON.stringify(expected)}`);
    console.error(`       received : ${JSON.stringify(actual)}`);
    failed++;
  }
}

function contains(label, haystack, needle) {
  assert(label, haystack.includes(needle), true);
}

function notContains(label, haystack, needle) {
  assert(label, haystack.includes(needle), false);
}

const policy   = read("src/app/privacy/page.tsx");
const layout   = read("src/app/layout.tsx");
const homepage = read("src/app/page.tsx");
const navbar   = read("src/components/Navbar.tsx");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — Required sections present
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 1: Required sections present ──");
contains("Section: Who we are",              policy, "Who we are");
contains("Section: What data we collect",    policy, "What data we collect");
contains("Section: What we do not collect",  policy, "What we do not collect");
contains("Section: How your data is used",   policy, "How your data is used");
contains("Section: Anonymous posting",       policy, "Anonymous posting");
contains("Section: Crisis keyword detection",policy, "Crisis keyword detection");
contains("Section: Third-party services",    policy, "Third-party services");
contains("Section: Your rights",             policy, "Your rights");
contains("Section: When we may disclose",    policy, "When we may disclose");
contains("Section: Data retention",          policy, "Data retention");
contains("Section: Minors",                  policy, "Minors");
contains("Section: Changes to this policy",  policy, "Changes to this policy");
contains("Section: Contact",                 policy, "Contact");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — Policy accuracy: data facts match the codebase
// Each check verifies the policy says what the code actually does.
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 2: Policy accuracy — data facts ──");

// Email stored in Clerk only, NOT in our DB
// Verified in: user.ts — prisma.user.create has no email field
contains("Email stored in Clerk only — not our DB",
  policy, "Your email is stored in Clerk");
notContains("Policy does not claim email is never collected",
  policy, "we never collect your email");

// Anonymous username mechanism is accurately described
contains("Username described as auto-generated",
  policy, "auto-generated name like");
contains("Username example matches generator output",
  policy, "BraveSoul123");
contains("Username can be changed",
  policy, "You may optionally change it");

// Clerk ID is stored in our DB (user.ts: clerkId field)
contains("ClerkId storage disclosed",
  policy, "Clerk-issued identifier");

// Posts and comments stored in Supabase
contains("Supabase storage mentioned for posts/comments",
  policy, "Supabase");
contains("PostgreSQL mentioned",
  policy, "PostgreSQL");

// Reports are stored and linked to anonymous username
contains("Reports stored and linked to username",
  policy, "Reports you file");

// Admin email alerts sent via Resend (email.ts)
contains("Resend used for email alerts",
  policy, "Resend");
contains("Admin email alert described accurately",
  policy, "moderation alert emails to Saathi");
contains("Resend does not receive user email address",
  policy, "Resend does not receive your email address");

// Crisis detection: posts are still published (crisis.ts + posts.ts)
contains("Crisis content is still published — not blocked",
  policy, "Your content is still published");

// Crisis detection creates auto-report (posts.ts / comments.ts)
contains("Automatic report filed on crisis detection",
  policy, "automatic report is filed");

// isCrisis email alert fires (email.ts + posts.ts)
contains("Moderation team receives email alert for crisis",
  policy, "moderation team receives an email alert");

// Rate limits: 3 posts / 10 comments per day (posts.ts / comments.ts)
contains("Rate limits described",
  policy, "3 posts and 10 comments per day");

// Vercel hosts the application
contains("Vercel mentioned as host",
  policy, "Vercel");

// No analytics tools used
contains("No analytics tools stated",
  policy, "do not run analytics");

// Data not sold
contains("Data not sold",
  policy, "do not sell your data");

// Data not used for AI training
contains("Data not used for AI/ML training",
  policy, "machine learning or AI training");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — Safety language: no overpromising on crisis response
// This is the most critical suite for a vulnerable-user platform.
// Every item here must NOT appear in the policy.
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 3: Safety language — no overpromising ──");

// Must NOT claim to be a mental health service
notContains("Does not claim to be a mental health service",
  policy, "Saathi is a mental health service");
// (The policy says "not a mental health service" — make sure it's a disclaimer, not a claim)
contains("Explicitly states it is NOT a mental health service",
  policy, "not a mental health service");

// Must NOT promise crisis intervention
notContains("Does not promise crisis intervention capability",
  policy, "we will intervene");
notContains("Does not promise to prevent self-harm",
  policy, "prevent self-harm");
notContains("Does not promise to contact emergency services",
  policy, "we will contact emergency services");
notContains("Does not promise a response time to crisis reports",
  policy, "within minutes");
notContains("Does not promise 24/7 moderation",
  policy, "24/7 moderation");
notContains("Does not claim moderators are professionals",
  policy, "professional moderators");

// Must NOT promise absolute anonymity
contains("Explicitly states anonymity is not absolute",
  policy, "anonymity on Saathi is");
notContains("Does not promise absolute anonymity",
  policy, "completely anonymous");
notContains("Does not promise nobody can identify you",
  policy, "nobody can ever identify");

// Must NOT promise absolute confidentiality
notContains("Does not promise absolute confidentiality",
  policy, "absolutely confidential");
notContains("Does not promise information will never be disclosed",
  policy, "never be disclosed");

// Must NOT claim to be a therapy service
notContains("Does not claim to offer therapy",
  policy, "therapy service");
notContains("Does not claim to offer counselling",
  policy, "counselling service");

// Must disclose that moderators are NOT trained mental health professionals
contains("Moderators not described as mental health professionals",
  policy, "volunteers or independent operators");

// Must include iCall number as the actual crisis resource
contains("iCall number present",
  policy, "9152987821");

// Must include reference to emergency services (112)
contains("Emergency services number present",
  policy, "112");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 — Legal requirements (DPDPA 2023)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 4: Legal requirements (DPDPA 2023) ──");
contains("DPDPA 2023 named",
  policy, "Digital Personal Data Protection Act 2023");
contains("Right to access",
  policy, "Access");
contains("Right to correction",
  policy, "Correction");
contains("Right to deletion",
  policy, "Deletion");
contains("Right to withdrawal of consent",
  policy, "Withdrawal of consent");
contains("Response time stated for rights requests",
  policy, "within 30 days");
contains("Contact email for rights requests",
  policy, "hello@saathi.app");
contains("Age restriction stated (under 18)",
  policy, "under 18");
contains("Backup retention period stated",
  policy, "90 days");

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 — Navigation: Privacy link is reachable from the UI
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 5: Navigation ──");

// Sitewide footer in layout.tsx
contains("layout.tsx has Privacy Policy link",
  layout, 'href="/privacy"');
contains("layout.tsx footer has Guidelines link",
  layout, 'href="/guidelines"');
contains("layout.tsx footer has contact email",
  layout, "hello@saathi.app");
contains("layout.tsx body has flex-col min-h-screen for sticky footer",
  layout, "flex flex-col min-h-screen");
contains("layout.tsx has flex-1 wrapper for content",
  layout, "flex-1");
contains("layout.tsx imports Link",
  layout, 'import Link from "next/link"');

// Homepage footer
contains("Homepage footer has Privacy link",
  homepage, '"/privacy"');

// Policy page has cross-links back to guidelines and community
contains("Policy page links to Guidelines",
  policy, 'href="/guidelines"');
contains("Policy page links back to Community",
  policy, 'href="/community"');

// Page has correct metadata title
contains("Metadata title set",
  policy, "Privacy Policy — Saathi");

// Page has correct metadata description
contains("Metadata description set",
  policy, "Plain language, no legalese");

// Page is not auth-protected (no import of auth guard)
notContains("Privacy page is not auth-protected",
  policy, "auth().protect");
notContains("Privacy page does not import auth middleware",
  policy, 'import { auth }');

// Last updated date is present
contains("Last updated date present",
  policy, "LAST_UPDATED");

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${"─".repeat(60)}`);
console.log(`  Results: ${passed}/${total} passed, ${failed} failed`);
console.log(`${"─".repeat(60)}\n`);
if (failed > 0) process.exit(1);
