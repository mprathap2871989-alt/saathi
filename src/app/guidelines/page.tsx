// src/app/guidelines/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Community Guidelines — Saathi",
  description: "How we keep Saathi a safe, supportive, and judgment-free space.",
};

const RULES = [
  {
    emoji: "💛",
    title: "Lead with compassion",
    body: "Before you respond, ask: is this what I'd want someone to say to me on my worst day? Empathy first, advice second — and only if the person has asked for it.",
  },
  {
    emoji: "🔒",
    title: "Protect everyone's anonymity",
    body: "Never try to identify who someone is based on their story. Do not share, screenshot, or discuss posts outside of Saathi. Anonymity is what makes honest sharing possible.",
  },
  {
    emoji: "🚫",
    title: "Zero tolerance for harm",
    body: "Harassment, bullying, hate speech, slurs, threats, or any content targeting a person's identity (religion, caste, gender, sexuality, disability) will result in immediate removal and account suspension.",
  },
  {
    emoji: "🌱",
    title: "Share experience, not prescriptions",
    body: '"In my experience…" is more helpful than "you should…". What worked for you may not work for everyone. Offer your perspective as one data point, not the answer.',
  },
  {
    emoji: "⚠️",
    title: "Handle crisis moments carefully",
    body: "If someone appears to be in immediate danger, respond with care and share the iCall helpline: 9152987821. Do not try to manage a crisis yourself — you are not alone in this responsibility.",
  },
  {
    emoji: "📵",
    title: "No spam or self-promotion",
    body: "No links to services, products, social media profiles, or businesses. No unsolicited advice about paid services. This is a support space, not a marketplace.",
  },
  {
    emoji: "🏳️‍🌈",
    title: "Inclusive by default",
    body: "All people are welcome here regardless of gender, sexuality, religion, caste, class, ethnicity, age, or background. Saathi is built for everyone navigating a difficult moment.",
  },
  {
    emoji: "🧘",
    title: "No unsolicited diagnosis",
    body: "Please do not suggest mental health diagnoses, medications, or treatments — even with good intentions. Encourage professional support, but leave medical guidance to professionals.",
  },
  {
    emoji: "🤐",
    title: "Keep it about support, not debate",
    body: "This is not a debate platform. Political arguments, religious debates, or adversarial discourse have no place here. If you disagree with someone's choices, you can choose not to respond.",
  },
];

export default function GuidelinesPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">
            Community Guidelines
          </h1>
          <p className="text-gray-500 leading-relaxed">
            Saathi exists because people choose kindness when it matters most.
            These guidelines protect that trust — for everyone who shares here.
          </p>
        </div>

        {/* Crisis callout */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🆘</span>
          <div>
            <p className="font-semibold text-amber-900 mb-1">Crisis support is always available</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              iCall (India): <a href="tel:9152987821" className="font-bold underline">9152987821</a> · Mon–Sat, 8am–10pm<br />
              Vandrevala Foundation: <a href="tel:18602662345" className="font-bold underline">1860-2662-345</a> · 24/7
            </p>
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-4">
          {RULES.map(({ emoji, title, body }) => (
            <div
              key={title}
              className="bg-white rounded-xl border border-stone-200 p-4 flex items-start gap-4"
            >
              <span className="text-2xl flex-shrink-0">{emoji}</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Enforcement */}
        <div className="mt-8 bg-emerald-900 text-white rounded-2xl p-6">
          <h2 className="font-serif text-lg font-bold mb-3">How we enforce these guidelines</h2>
          <div className="space-y-2 text-sm text-emerald-100">
            {[
              "Every report is reviewed by our moderation team within 24 hours.",
              "First violation: content removed, warning issued.",
              "Repeated or serious violations: account suspended immediately.",
              "No warnings for severe violations (hate speech, threats, crisis mishandling).",
            ].map((point) => (
              <div key={point} className="flex items-start gap-2">
                <span className="text-emerald-400 flex-shrink-0 mt-0.5">→</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Report CTA */}
        <div className="mt-6 text-center p-5 bg-stone-100 rounded-2xl">
          <p className="text-sm text-gray-600 mb-3">
            See something that violates these guidelines?
          </p>
          <p className="text-sm font-medium text-gray-800">
            Use the <span className="font-bold">Report</span> button on any post or comment.
            Reports are anonymous and reviewed within 24 hours.
          </p>
          <Link
            href="/community"
            className="inline-block mt-4 text-emerald-700 text-sm font-medium hover:underline"
          >
            Return to Community →
          </Link>
        </div>
      </main>
    </>
  );
}
