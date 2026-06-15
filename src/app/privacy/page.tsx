import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: June 2025</p>
        </div>

        <div className="prose prose-stone max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Our Commitment</h2>
            <p>Saathi is built on the principle of anonymity. We collect as little information as possible and never sell your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">What We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email address (for account creation via Clerk)</li>
              <li>Posts and comments you choose to share</li>
              <li>Basic usage data to improve the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">What We Never Do</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sell your data to third parties</li>
              <li>Reveal your identity without your consent</li>
              <li>Use your posts for advertising</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Contact</h2>
            <p>Questions? Email us at <a href="mailto:hello@saathi.app" className="text-blue-600 underline">hello@saathi.app</a></p>
          </section>
        </div>
      </main>
    </>
  );
}