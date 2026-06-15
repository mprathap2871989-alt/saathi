/**
 * Email module tests — src/lib/__tests__/email.test.mjs
 *
 * Run with:   node src/lib/__tests__/email.test.mjs
 *
 * Strategy: we cannot call the real Resend API in tests, so we test:
 *   1. reasonIsCrisis()  — pure function, no mocking needed
 *   2. sendReportAlert() — stub the Resend client to simulate success,
 *      API error, and network failure; verify the function never throws
 *      and returns the correct boolean in each case
 *   3. Missing env vars  — verify graceful degradation
 *
 * Suites:
 *   1  — reasonIsCrisis: crisis reason strings
 *   2  — reasonIsCrisis: normal reason strings
 *   3  — sendReportAlert: Resend success path
 *   4  — sendReportAlert: Resend returns { data: null, error: {...} }
 *   5  — sendReportAlert: Resend throws (network failure)
 *   6  — sendReportAlert: missing RESEND_API_KEY
 *   7  — sendReportAlert: missing ADMIN_EMAIL
 *   8  — sendReportAlert: both env vars missing
 *   9  — Email never blocks caller (fire-and-forget contract)
 */

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

async function assertNoThrow(label, fn) {
  try {
    await fn();
    console.log(`  ✅  ${label}`);
    passed++;
  } catch (e) {
    console.error(`  ❌  ${label} — threw: ${e.message}`);
    failed++;
  }
}

// ── Mirror reasonIsCrisis exactly ────────────────────────────────────────────
function reasonIsCrisis(reason) {
  return reason.startsWith("Crisis:");
}

// ── Build sendReportAlert with injectable Resend client ───────────────────────
// We reproduce the logic of email.ts with a configurable Resend stub
// so we can test every branch without network calls.

function makeSendReportAlert({ resendSendFn, apiKey, adminEmail }) {
  return async function sendReportAlert(opts) {
    if (!apiKey) {
      console.warn("[email] RESEND_API_KEY not set — email alerts disabled");
      return false;
    }
    if (!adminEmail) {
      console.warn("[email] ADMIN_EMAIL not set — admin alerts disabled");
      return false;
    }

    const isCrisis = reasonIsCrisis(opts.reason);
    const prefix   = isCrisis ? "🚨 CRISIS REPORT" : "📋 New Report";
    const subject  = `${prefix} — ${opts.contentType} by ${opts.reporterUsername}`;

    try {
      const { error } = await resendSendFn({
        from:    "Saathi Moderation <onboarding@resend.dev>",
        to:      adminEmail,
        subject,
        html:    "<p>test</p>",
      });
      if (error) {
        console.error("[email] Resend API error:", error.name, error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[email] sendReportAlert threw:", err);
      return false;
    }
  };
}

const SAMPLE_CRISIS_OPTS = {
  reportId:         "report_crisis_123",
  reason:           "Crisis: automatic detection — post may indicate risk to life",
  reporterUsername: "BraveSoul42",
  contentType:      "post",
  contentId:        "post_abc",
  contentSnippet:   "I want to kill myself and I don't know what to do",
};

const SAMPLE_NORMAL_OPTS = {
  reportId:         "report_normal_456",
  reason:           "Spam or self-promotion",
  reporterUsername: "CalmRiver99",
  contentType:      "comment",
  contentId:        "post_def",
  contentSnippet:   "Buy my course for 999 rupees only",
};

// ─────────────────────────────────────────────────────────────────────────────
// Suite 1 — reasonIsCrisis: crisis reason strings
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 1: reasonIsCrisis — crisis strings ──");
assert("auto-report post reason",
  reasonIsCrisis("Crisis: automatic detection — post may indicate risk to life"), true);
assert("auto-report comment reason",
  reasonIsCrisis("Crisis: automatic detection — comment may indicate risk to life"), true);
assert("custom Crisis: prefix",
  reasonIsCrisis("Crisis: user reported immediate danger"), true);

// ─────────────────────────────────────────────────────────────────────────────
// Suite 2 — reasonIsCrisis: normal reason strings
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 2: reasonIsCrisis — normal strings ──");
assert("spam reason",          reasonIsCrisis("Spam or self-promotion"),                false);
assert("hate speech reason",   reasonIsCrisis("Hate speech or slurs"),                  false);
assert("harassment reason",    reasonIsCrisis("Harassment or bullying"),                false);
assert("misinformation",       reasonIsCrisis("Misinformation"),                        false);
assert("empty string",         reasonIsCrisis(""),                                      false);
assert("crisis lowercase",     reasonIsCrisis("crisis: something"),                     false); // must start with capital C
assert("contains Crisis mid",  reasonIsCrisis("Report about Crisis: something"),        false); // must START with Crisis:

// ─────────────────────────────────────────────────────────────────────────────
// Suite 3 — sendReportAlert: Resend success path
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 3: sendReportAlert — success path ──");

const successSend = makeSendReportAlert({
  resendSendFn: async () => ({ data: { id: "email_ok" }, error: null }),
  apiKey:       "re_test_key",
  adminEmail:   "admin@saathi.app",
});

assert("crisis report returns true",
  await successSend(SAMPLE_CRISIS_OPTS), true);
assert("normal report returns true",
  await successSend(SAMPLE_NORMAL_OPTS), true);

// Subject line check — verify crisis vs normal prefix
let capturedSubject = "";
const subjectCaptureSend = makeSendReportAlert({
  resendSendFn: async (payload) => { capturedSubject = payload.subject; return { data: { id: "ok" }, error: null }; },
  apiKey:       "re_test_key",
  adminEmail:   "admin@saathi.app",
});
await subjectCaptureSend(SAMPLE_CRISIS_OPTS);
assert("crisis subject starts with 🚨 CRISIS REPORT",
  capturedSubject.startsWith("🚨 CRISIS REPORT"), true);

await subjectCaptureSend(SAMPLE_NORMAL_OPTS);
assert("normal subject starts with 📋 New Report",
  capturedSubject.startsWith("📋 New Report"), true);

// ─────────────────────────────────────────────────────────────────────────────
// Suite 4 — sendReportAlert: Resend returns API error
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 4: sendReportAlert — Resend API error ──");

const apiErrorSend = makeSendReportAlert({
  resendSendFn: async () => ({
    data:  null,
    error: { name: "invalid_from_address", message: "Domain not verified" },
  }),
  apiKey:     "re_test_key",
  adminEmail: "admin@saathi.app",
});

assert("API error returns false (not throw)",
  await apiErrorSend(SAMPLE_CRISIS_OPTS), false);
assert("API error on normal report returns false",
  await apiErrorSend(SAMPLE_NORMAL_OPTS), false);

await assertNoThrow("API error does not throw",
  () => apiErrorSend(SAMPLE_CRISIS_OPTS));

// ─────────────────────────────────────────────────────────────────────────────
// Suite 5 — sendReportAlert: network failure (send throws)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 5: sendReportAlert — network failure ──");

const networkFailSend = makeSendReportAlert({
  resendSendFn: async () => { throw new Error("ECONNREFUSED"); },
  apiKey:       "re_test_key",
  adminEmail:   "admin@saathi.app",
});

assert("network failure returns false",
  await networkFailSend(SAMPLE_CRISIS_OPTS), false);
assert("network failure on normal report returns false",
  await networkFailSend(SAMPLE_NORMAL_OPTS), false);

await assertNoThrow("network failure never throws to caller",
  () => networkFailSend(SAMPLE_CRISIS_OPTS));

// Simulate timeout
const timeoutSend = makeSendReportAlert({
  resendSendFn: async () => {
    await new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), 1)
    );
  },
  apiKey:       "re_test_key",
  adminEmail:   "admin@saathi.app",
});

assert("timeout returns false",
  await timeoutSend(SAMPLE_CRISIS_OPTS), false);

await assertNoThrow("timeout never throws to caller",
  () => timeoutSend(SAMPLE_CRISIS_OPTS));

// ─────────────────────────────────────────────────────────────────────────────
// Suite 6 — sendReportAlert: missing RESEND_API_KEY
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 6: sendReportAlert — missing RESEND_API_KEY ──");

const noApiKeySend = makeSendReportAlert({
  resendSendFn: async () => ({ data: { id: "ok" }, error: null }),
  apiKey:       null,
  adminEmail:   "admin@saathi.app",
});

assert("missing key returns false (not throw)",
  await noApiKeySend(SAMPLE_CRISIS_OPTS), false);
assert("missing key on normal report returns false",
  await noApiKeySend(SAMPLE_NORMAL_OPTS), false);

await assertNoThrow("missing key does not throw",
  () => noApiKeySend(SAMPLE_CRISIS_OPTS));

// ─────────────────────────────────────────────────────────────────────────────
// Suite 7 — sendReportAlert: missing ADMIN_EMAIL
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 7: sendReportAlert — missing ADMIN_EMAIL ──");

const noAdminEmailSend = makeSendReportAlert({
  resendSendFn: async () => ({ data: { id: "ok" }, error: null }),
  apiKey:       "re_test_key",
  adminEmail:   null,
});

assert("missing admin email returns false",
  await noAdminEmailSend(SAMPLE_CRISIS_OPTS), false);

await assertNoThrow("missing admin email does not throw",
  () => noAdminEmailSend(SAMPLE_CRISIS_OPTS));

// ─────────────────────────────────────────────────────────────────────────────
// Suite 8 — sendReportAlert: both env vars missing
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 8: sendReportAlert — both env vars missing ──");

const noEnvSend = makeSendReportAlert({
  resendSendFn: async () => ({ data: { id: "ok" }, error: null }),
  apiKey:       null,
  adminEmail:   null,
});

assert("both missing returns false",
  await noEnvSend(SAMPLE_CRISIS_OPTS), false);

await assertNoThrow("both missing does not throw",
  () => noEnvSend(SAMPLE_CRISIS_OPTS));

// ─────────────────────────────────────────────────────────────────────────────
// Suite 9 — Fire-and-forget contract
// Verify that a void sendReportAlert() inside an async action does not
// prevent the action from returning its own result.
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n── Suite 9: Fire-and-forget contract ──");

// Simulate what posts.ts / reports.ts does: fire void and return { success }
async function simulateCreatePost(sendFn) {
  // This is the pattern used in production:
  void sendFn(SAMPLE_CRISIS_OPTS); // fire-and-forget
  return { success: true, postId: "post_123" };
}

// Even when send is slow (200ms), the action should return immediately
const slowSend = makeSendReportAlert({
  resendSendFn: async () => {
    await new Promise(r => setTimeout(r, 200));
    return { data: { id: "ok" }, error: null };
  },
  apiKey:       "re_test_key",
  adminEmail:   "admin@saathi.app",
});

const start = Date.now();
const result = await simulateCreatePost(slowSend);
const elapsed = Date.now() - start;

assert("action returns success result",  result.success,       true);
assert("action returns postId",          result.postId,        "post_123");
assert("action does not wait for email (< 50ms)", elapsed < 50, true);

// Even when send throws, the action should still return success
const throwingSend = makeSendReportAlert({
  resendSendFn: async () => { throw new Error("Resend is down"); },
  apiKey:       "re_test_key",
  adminEmail:   "admin@saathi.app",
});

const result2 = await simulateCreatePost(throwingSend);
assert("action succeeds even when send throws", result2.success, true);

// ─────────────────────────────────────────────────────────────────────────────
// Results
// ─────────────────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${"─".repeat(60)}`);
console.log(`  Results: ${passed}/${total} passed, ${failed} failed`);
console.log(`${"─".repeat(60)}\n`);
if (failed > 0) process.exit(1);
