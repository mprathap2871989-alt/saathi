// src/app/privacy/page.tsx
// Static page  no auth required, no DB queries, publicly accessible.

import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Privacy Policy  Saathi",
  description:
    "How Saathi collects, uses, and protects your information. Plain language, no legalese.",
};

// Bump this date whenever a material change is made to the policy.
const LAST_UPDATED = "June 2025";

//  Section components 

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-semibold text-gray-900 text-base mb-3 mt-8 first:mt-0 pb-1.5 border-b border-stone-100">
      {children}
    </h2>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[15px] text-gray-700 leading-relaxed mb-3">{children}</p>
  );
}

function Bullets({ items }: { items: [string, string][] }) {
  return (
    <ul className="space-y-2.5 mb-3">
      {items.map(([label, desc]) => (
        <li key={label} className="flex gap-2.5 text-[15px] text-gray-700 leading-relaxed">
          <span className="text-emerald-600 mt-0.5 flex-shrink-0"></span>
          <span>
            <strong className="font-semibold text-gray-900">{label}: </strong>
            {desc}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 mb-3">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-[15px] text-gray-600 leading-relaxed">
          <span className="text-emerald-600 font-bold flex-shrink-0 mt-0.5"></span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Callout({
  variant,
  children,
}: {
  variant: "warning" | "info";
  children: React.ReactNode;
}) {
  const styles =
    variant === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : "bg-stone-50 border-stone-200 text-gray-700";
  return (
    <div className={`border rounded-xl px-4 py-3.5 mb-4 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

//  Page 

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">

        {/*  Header  */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-400">Last updated: {LAST_UPDATED}</p>
          <p className="text-[15px] text-gray-600 leading-relaxed mt-3">
            We wrote this in plain language. If something is unclear, email us
            at{" "}
            <a
              href="mailto:hello@saathi.app"
              className="text-emerald-700 hover:underline font-medium"
            >
              hello@saathi.app
            </a>{" "}
            and we will explain it.
          </p>
        </div>

        {/*  Vulnerable-user notice  */}
        <Callout variant="warning">
          <strong className="font-semibold">Important:</strong> Saathi is a peer
          support community, not a mental health service. We are not therapists,
          counsellors, or medical professionals. We cannot provide crisis
          intervention or emergency response. If you are in immediate danger,
          call emergency services (112 in India) or iCall: 9152987821.
        </Callout>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-7 space-y-1">

          {/* 1 */}
          <section>
            <SectionHeading>1. Who we are</SectionHeading>
            <Para>
              Saathi is an anonymous peer support community for people navigating
              difficult moments. It is operated as an independent project. For
              questions about this policy, contact us at{" "}
              <a
                href="mailto:hello@saathi.app"
                className="text-emerald-700 hover:underline"
              >
                hello@saathi.app
              </a>
              .
            </Para>
          </section>

          {/* 2 */}
          <section>
            <SectionHeading>2. What data we collect and where it lives</SectionHeading>
            <Para>
              We collect the minimum data needed to run the platform. Here is
              exactly what is stored and where:
            </Para>
            <Bullets
              items={[
                [
                  "Email address",
                  "Collected by Clerk (our sign-in provider) when you create an account. Your email is stored in Clerk's systems only  it is never written to our own database.",
                ],
                [
                  "Anonymous username",
                  "An auto-generated name like "BraveSoul123" assigned at sign-up. This is the only identifier stored in our database and the only name visible to other users. You may optionally change it in your profile settings.",
                ],
                [
                  "Posts and comments",
                  "The text you publish on Saathi. Stored in our database hosted on Supabase (PostgreSQL, hosted in the AWS Mumbai region by default).",
                ],
                [
                  "Helpful votes",
                  "A record of which posts and comments you marked as helpful. Linked to your anonymous username. Stored in our database.",
                ],
                [
                  "Reports you file",
                  "When you report a post or comment, we store the reason text and a link to the content reported. Linked to your anonymous username. Stored in our database.",
                ],
                [
                  "Account status",
                  "Whether your account is active or suspended. Stored in our database.",
                ],
              ]}
            />
            <Para>
              We do not collect your real name, phone number, physical address,
              payment information, or device identifiers. We do not run analytics
              tools (Google Analytics, Mixpanel, etc.) that track your behaviour
              across sessions.
            </Para>
          </section>

          {/* 3 */}
          <section>
            <SectionHeading>3. What we do not collect</SectionHeading>
            <CheckList
              items={[
                "Your real name",
                "Your phone number",
                "Your location",
                "Any payment information (Saathi is free)",
                "Cookies beyond those set by Clerk for session management",
                "Cross-site tracking data",
                "Behavioural analytics",
              ]}
            />
          </section>

          {/* 4 */}
          <section>
            <SectionHeading>4. How your data is used</SectionHeading>
            <Para>
              We use the data we collect solely to operate Saathi:
            </Para>
            <Bullets
              items={[
                [
                  "Displaying content",
                  "Your posts and comments are shown to other signed-in users under your anonymous username.",
                ],
                [
                  "Moderation",
                  "Reports filed by users, and reports automatically generated by our crisis keyword detection system (see Section 6), are reviewed by our moderation team.",
                ],
                [
                  "Admin email alerts",
                  "When a report is filed  by a user or automatically  an email notification is sent to our moderation team's email address via Resend. This email includes the report reason, the reporter's anonymous username, and a snippet of the reported content. No other parties receive this email.",
                ],
                [
                  "Rate limiting",
                  "Post and comment counts are tracked per user to enforce daily limits (3 posts and 10 comments per day).",
                ],
                [
                  "Account management",
                  "Clerk uses your email to manage sign-in and to send account-related emails (e.g. sign-in confirmation). We have no control over these Clerk-initiated emails.",
                ],
              ]}
            />
            <Para>
              We do not sell your data. We do not share it with advertisers. We
              do not use it for machine learning or AI training. We do not share
              it with any third party other than the infrastructure providers
              listed in Section 7.
            </Para>
          </section>

          {/* 5 */}
          <section>
            <SectionHeading>5. Anonymous posting  what it means and what it does not mean</SectionHeading>
            <Para>
              When you post on Saathi, your real name and email address are never
              shown to other users. You appear only as your anonymous username
              (e.g. "BraveSoul123").
            </Para>
            <Para>
              However, anonymity on Saathi is <strong className="font-semibold">not
              absolute</strong>. We want to be honest about this:
            </Para>
            <Bullets
              items={[
                [
                  "Our moderation team can see all content",
                  "Posts, comments, and the anonymous usernames that posted them are visible to Saathi's admin account for moderation purposes.",
                ],
                [
                  "Your Clerk user ID is in our database",
                  "We store a Clerk-issued identifier (a string like "user_abc123") in our database alongside your anonymous username. This means we can link your anonymous username to your Clerk account if required (e.g. to process an account deletion request).",
                ],
                [
                  "Infrastructure providers can see database content",
                  "Supabase and Vercel host the platform. Their staff could technically access stored data in accordance with their own policies.",
                ],
                [
                  "Legal obligations",
                  "We will disclose information if required by law or to prevent imminent harm to a person, as described in Section 9.",
                ],
              ]}
            />
            <Para>
              We strongly advise against including details in your posts that could
              identify you  such as your full name, your workplace, your exact
              location, or identifying details about others.
            </Para>
          </section>

          {/* 6 */}
          <section>
            <SectionHeading>6. Crisis keyword detection</SectionHeading>
            <Para>
              Saathi runs an automated keyword scan on every post and comment
              before it is published. This scan looks for phrases that may
              indicate a person is in immediate distress (for example, phrases
              indicating suicidal ideation or self-harm).
            </Para>
            <Para>
              If the scan detects such a phrase:
            </Para>
            <Bullets
              items={[
                [
                  "Your content is still published",
                  "We do not block or remove content that triggers the crisis detection. The person needs to feel heard.",
                ],
                [
                  "A crisis resource is shown to you",
                  "A screen will appear showing the iCall helpline number (9152987821) before you continue.",
                ],
                [
                  "An automatic report is filed",
                  "A moderation report is created in our system and flagged as a crisis report. Our moderation team receives an email alert and will review it.",
                ],
              ]}
            />
            <Callout variant="warning">
              <strong className="font-semibold">This is not crisis intervention.</strong>{" "}
              The keyword scan is a simple automated text check. It can miss
              content that needs attention and it can flag content that does not.
              Our moderation team are volunteers or independent operators  not
              trained mental health professionals. We cannot guarantee a response
              time or an intervention outcome. If you are in immediate danger,
              call 112 or iCall: 9152987821.
            </Callout>
          </section>

          {/* 7 */}
          <section>
            <SectionHeading>7. Third-party services we use</SectionHeading>
            <Para>
              These are the only external services that process data in
              connection with Saathi:
            </Para>
            <Bullets
              items={[
                [
                  "Clerk (clerk.com)",
                  "Authentication. Stores your email address and manages sign-in sessions. Clerk's privacy policy: clerk.com/legal/privacy",
                ],
                [
                  "Supabase (supabase.com)",
                  "Database hosting. Your posts, comments, votes, and reports are stored in Supabase's PostgreSQL service. Supabase's privacy policy: supabase.com/privacy",
                ],
                [
                  "Vercel (vercel.com)",
                  "Web hosting. Vercel serves the Saathi application and may log standard server request metadata (IP address, browser type, pages visited) in accordance with its own policy. Vercel's privacy policy: vercel.com/legal/privacy-policy",
                ],
                [
                  "Resend (resend.com)",
                  "Email delivery. Used only to send moderation alert emails to Saathi's admin team. Resend receives the report reason, the reporter's anonymous username, and the content snippet included in the alert. Resend does not receive your email address. Resend's privacy policy: resend.com/legal/privacy-policy",
                ],
              ]}
            />
            <Para>
              We do not use any other third-party analytics, advertising, or
              tracking services.
            </Para>
          </section>

          {/* 8 */}
          <section>
            <SectionHeading>8. Your rights</SectionHeading>
            <Para>
              Under the Digital Personal Data Protection Act 2023 (India) and
              other applicable laws, you have the following rights:
            </Para>
            <Bullets
              items={[
                [
                  "Access",
                  "You can request a copy of the personal data we hold about you.",
                ],
                [
                  "Correction",
                  "You can request that inaccurate data be corrected.",
                ],
                [
                  "Deletion",
                  "You can request deletion of your account and all associated data. This removes your Saathi database record and all content linked to your anonymous username. To also delete your Clerk account (which holds your email), you must do so through Clerk's account settings or contact us and we will process it.",
                ],
                [
                  "Withdrawal of consent",
                  "You may stop using Saathi and request account deletion at any time.",
                ],
              ]}
            />
            <Para>
              To exercise any of these rights, email{" "}
              <a
                href="mailto:hello@saathi.app"
                className="text-emerald-700 hover:underline"
              >
                hello@saathi.app
              </a>{" "}
              from the address you used to sign up. We will respond within 30
              days.
            </Para>
          </section>

          {/* 9 */}
          <section>
            <SectionHeading>9. When we may disclose information</SectionHeading>
            <Para>
              We do not sell or voluntarily share your data. We may disclose
              information only in these circumstances:
            </Para>
            <Bullets
              items={[
                [
                  "Legal obligation",
                  "If required by a valid court order, government directive, or applicable law.",
                ],
                [
                  "Prevention of imminent harm",
                  "If we reasonably believe disclosure is necessary to prevent serious and imminent harm to a person. We will use judgment, not automation, for this decision.",
                ],
              ]}
            />
          </section>

          {/* 10 */}
          <section>
            <SectionHeading>10. Data retention</SectionHeading>
            <Para>
              We retain your data for as long as your account is active. If you
              request account deletion:
            </Para>
            <Bullets
              items={[
                [
                  "Saathi database",
                  "Your user record, posts, comments, votes, and reports are deleted within 30 days of a confirmed deletion request.",
                ],
                [
                  "Clerk",
                  "Your email address and sign-in account are held by Clerk per their own retention policy. Deleting your Saathi account does not automatically delete your Clerk account  you must do this separately in Clerk's account settings, or ask us to process it.",
                ],
                [
                  "Backups",
                  "Deleted data may persist in infrastructure backups for up to 90 days before being overwritten.",
                ],
              ]}
            />
          </section>

          {/* 11 */}
          <section>
            <SectionHeading>11. Minors</SectionHeading>
            <Para>
              Saathi is not intended for users under 18 years of age. We do not
              knowingly collect data from minors. If you believe a minor has
              created an account, contact us at{" "}
              <a
                href="mailto:hello@saathi.app"
                className="text-emerald-700 hover:underline"
              >
                hello@saathi.app
              </a>{" "}
              and we will remove it promptly.
            </Para>
          </section>

          {/* 12 */}
          <section>
            <SectionHeading>12. Changes to this policy</SectionHeading>
            <Para>
              If we make material changes to this policy, we will update the
              "Last updated" date at the top of this page and note the change in
              the Community Guidelines. Continued use of Saathi after a policy
              change constitutes acceptance of the updated policy.
            </Para>
          </section>

          {/* 13 */}
          <section>
            <SectionHeading>13. Contact</SectionHeading>
            <Para>
              Questions, requests, or concerns about this policy:
            </Para>
            <Para>
              <a
                href="mailto:hello@saathi.app"
                className="text-emerald-700 hover:underline font-medium"
              >
                hello@saathi.app
              </a>
            </Para>
          </section>

        </div>

        {/*  Footer nav  */}
        <div className="mt-8 pt-6 border-t border-stone-200 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link
            href="/guidelines"
            className="hover:text-gray-700 transition-colors"
          >
            Community Guidelines
          </Link>
          <Link
            href="/community"
            className="hover:text-gray-700 transition-colors"
          >
            Back to Community
          </Link>
        </div>

      </main>
    </>
  );
}
