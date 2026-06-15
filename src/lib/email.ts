// src/lib/email.ts
//
// Centralised email sending via Resend.
// All exported functions are fire-and-forget safe:
//   - They never throw.
//   - A missing API key, network failure, or Resend error is logged but
//     does NOT propagate to the caller. Report creation, posting, and
//     commenting must always succeed regardless of email state.
//
// Resend v4 API: resend.emails.send() returns { data, error } — never throws.
// We additionally wrap every call in try/catch for belt-and-suspenders safety.
//
// ── Env vars required ────────────────────────────────────────────────────────
// RESEND_API_KEY   — from resend.com → API Keys
// ADMIN_EMAIL      — address that receives all alert emails
// NEXT_PUBLIC_APP_URL — used to build admin dashboard link in email body
//
// ── From address ─────────────────────────────────────────────────────────────
// During development / before domain verification:
//   use "onboarding@resend.dev" (Resend provides this on all accounts)
// After domain verification in Resend dashboard:
//   change to "moderation@yourdomain.com"

import { Resend } from "resend";

// ── Lazy singleton — safe to import in any server context ────────────────────
let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — email alerts disabled");
    return null;
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function getAdminEmail(): string | null {
  if (!process.env.ADMIN_EMAIL) {
    console.warn("[email] ADMIN_EMAIL not set — admin alerts disabled");
    return null;
  }
  return process.env.ADMIN_EMAIL;
}

function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

// ── isCrisis detection helper ────────────────────────────────────────────────
// Checks the reason string set by the auto-report in posts.ts / comments.ts.
// This is the single source of truth for "is this a crisis report" in email.ts.
export function reasonIsCrisis(reason: string): boolean {
  return reason.startsWith("Crisis:");
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ReportAlertOptions {
  reportId:         string;
  reason:           string;
  reporterUsername: string;
  contentType:      "post" | "comment";
  contentId:        string;       // postId for posts; parent postId for comments
  contentSnippet:   string;       // first 200 chars of the content
}

// ── Email template ────────────────────────────────────────────────────────────
function buildReportEmailHtml(opts: ReportAlertOptions, isCrisis: boolean): string {
  const appUrl    = getAppUrl();
  const adminUrl  = `${appUrl}/admin`;
  const contentUrl = `${appUrl}/post/${opts.contentId}`;
  const snippet   = opts.contentSnippet.length >= 200
    ? opts.contentSnippet.slice(0, 200) + "…"
    : opts.contentSnippet;

  const bannerBg    = isCrisis ? "#fef3c7" : "#f0fdf4";
  const bannerBorder = isCrisis ? "#fcd34d" : "#bbf7d0";
  const bannerColor  = isCrisis ? "#92400e" : "#14532d";
  const bannerText   = isCrisis
    ? "🚨 Crisis content detected — immediate review required"
    : "📋 A new report has been filed";
  const ctaBg = isCrisis ? "#d97706" : "#065f46";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${isCrisis ? "🚨 Crisis Report" : "New Report"} — Saathi</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#065f46;padding:20px 24px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
              Saathi Moderation
            </p>
            <p style="margin:4px 0 0;font-size:12px;color:#a7f3d0;">Admin alert</p>
          </td>
        </tr>

        <!-- Banner -->
        <tr>
          <td style="padding:20px 24px 0;">
            <div style="background:${bannerBg};border:1px solid ${bannerBorder};border-radius:8px;padding:12px 16px;">
              <p style="margin:0;font-size:14px;font-weight:600;color:${bannerColor};">
                ${bannerText}
              </p>
            </div>
          </td>
        </tr>

        <!-- Fields -->
        <tr>
          <td style="padding:20px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td style="padding-bottom:14px;">
                  <p style="margin:0 0 3px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;">Reported by</p>
                  <p style="margin:0;font-size:14px;color:#111827;">${opts.reporterUsername}</p>
                </td>
              </tr>

              <tr>
                <td style="padding-bottom:14px;">
                  <p style="margin:0 0 3px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;">Content type</p>
                  <p style="margin:0;font-size:14px;color:#111827;">${opts.contentType === "post" ? "Post" : "Comment"}</p>
                </td>
              </tr>

              <tr>
                <td style="padding-bottom:14px;">
                  <p style="margin:0 0 3px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;">Reason</p>
                  <p style="margin:0;font-size:14px;color:#111827;">${opts.reason}</p>
                </td>
              </tr>

              <tr>
                <td style="padding-bottom:20px;">
                  <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;">Content preview</p>
                  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px 12px;">
                    <p style="margin:0;font-size:13px;color:#374151;font-style:italic;line-height:1.5;">&ldquo;${snippet}&rdquo;</p>
                  </div>
                </td>
              </tr>

            </table>

            <!-- CTA -->
            <a href="${adminUrl}"
               style="display:inline-block;background:${ctaBg};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:11px 22px;border-radius:8px;">
              Open Admin Dashboard →
            </a>

            <p style="margin:12px 0 0;font-size:12px;">
              <a href="${contentUrl}" style="color:#065f46;">View content directly</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #e5e7eb;padding:14px 24px;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              Saathi Moderation Alert · Report ID: ${opts.reportId}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Primary export ────────────────────────────────────────────────────────────

/**
 * Send an admin alert email when a report is filed.
 *
 * Safe to call without await — all errors are caught and logged.
 * Returns true if the email was sent successfully, false otherwise.
 * The return value is for logging/testing only — callers must not
 * branch on it for user-facing behaviour.
 */
export async function sendReportAlert(opts: ReportAlertOptions): Promise<boolean> {
  const resend     = getResend();
  const adminEmail = getAdminEmail();

  if (!resend || !adminEmail) return false;

  const isCrisis = reasonIsCrisis(opts.reason);
  const prefix   = isCrisis ? "🚨 CRISIS REPORT" : "📋 New Report";
  const subject  = `${prefix} — ${opts.contentType} by ${opts.reporterUsername}`;

  try {
    const { error } = await resend.emails.send({
      // Change to your verified domain address before public launch.
      // "onboarding@resend.dev" works for testing on all Resend accounts.
      from:    "Saathi Moderation <onboarding@resend.dev>",
      to:      adminEmail,
      subject,
      html:    buildReportEmailHtml(opts, isCrisis),
    });

    if (error) {
      console.error("[email] Resend API error:", error.name, error.message);
      return false;
    }

    return true;
  } catch (err) {
    // Network failure, timeout, etc. Never propagates.
    console.error("[email] sendReportAlert threw:", err);
    return false;
  }
}
