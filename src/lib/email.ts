// src/lib/email.ts
//
// Minimal Resend wrapper. Not a notification framework — one small function
// per email type, added as real use cases need them. Currently: admin
// report alerts. Comment-reply notifications (Phase 4) will add their own
// function here rather than generalize prematurely.
//
// Reliability contract: every function in this file must never throw.
// Email is a side effect, not part of the core moderation flow — a failed
// send should be logged and swallowed, never block or roll back the action
// that triggered it.

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const EMAIL_FROM = process.env.EMAIL_FROM ?? "Solacial Moderation <onboarding@resend.dev>";

export interface ReportAlertDetails {
  reportType: "post" | "comment";
  contentId:  string;
  reason:     string;
  createdAt:  Date;
}

/**
 * Notifies the configured admin of a newly-submitted report. Intentionally
 * minimal: no reporter identity, no full post/comment content — just enough
 * for an admin to know a report exists and go review it in the dashboard.
 *
 * Never throws. Missing configuration (RESEND_API_KEY/ADMIN_EMAIL unset) or
 * a failed send are both logged and swallowed — reporting must never be
 * blocked or rolled back by a notification failure.
 */
export async function notifyAdminOfNewReport(details: ReportAlertDetails): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!resend || !adminEmail) {
    console.warn(
      "[email] Skipping admin report alert — RESEND_API_KEY or ADMIN_EMAIL is not configured."
    );
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const adminUrl = `${appUrl}/admin`;

  try {
    const { error } = await resend.emails.send({
      from:    EMAIL_FROM,
      to:      adminEmail,
      subject: `New report: ${details.reportType}`,
      text: [
        `A ${details.reportType} was reported on Solacial.`,
        ``,
        `Type:      ${details.reportType}`,
        `Content ID: ${details.contentId}`,
        `Reason:    ${details.reason}`,
        `Reported:  ${details.createdAt.toISOString()}`,
        ``,
        `Review it: ${adminUrl}`,
      ].join("\n"),
    });

    if (error) {
      console.error("[email] Failed to send admin report alert:", error);
    }
  } catch (err) {
    console.error("[email] Failed to send admin report alert:", err);
  }
}
