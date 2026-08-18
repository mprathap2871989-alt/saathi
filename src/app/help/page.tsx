// src/app/help/page.tsx

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/Navbar";
import HelpRequestForm from "@/components/help/HelpRequestForm";
import { getMyHelpRequests } from "@/actions/helpRequests";
import { timeAgo } from "@/lib/utils";

export const metadata = {
  title: "Need Help? â€” Solacial",
};

export default async function HelpPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const requests = await getMyHelpRequests();

  return (
    <>
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="text-xl">ðŸ’¬</span>
            </div>

            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900">
                Need Help?
              </h1>

              <p className="text-sm text-gray-500">
                Send a private message to the Solacial team.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mt-4">
            If you need help with something on Solacial, are unsure what to do,
            or need support with a situation, you can contact us privately
            here. Your request is visible only to you and the Solacial admin.
          </p>
        </div>

        <HelpRequestForm />

        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg font-bold text-gray-900">
              Your Requests
            </h2>

            <span className="text-xs text-gray-400">
              {requests.length}{" "}
              {requests.length === 1 ? "request" : "requests"}
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-xl p-8 text-center">
              <p className="text-sm font-medium text-gray-600">
                No help requests yet.
              </p>

              <p className="text-xs text-gray-400 mt-1">
                If you need assistance, you can send us a private message
                above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white border border-stone-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span
                      className={
                        request.status === "RESPONDED"
                          ? "text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700"
                          : request.status === "CLOSED"
                            ? "text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600"
                            : request.status === "IN_REVIEW"
                              ? "text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700"
                              : "text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700"
                      }
                    >
                      {request.status === "IN_REVIEW"
                        ? "In Review"
                        : request.status === "RESPONDED"
                          ? "Responded"
                          : request.status === "CLOSED"
                            ? "Closed"
                            : "New"}
                    </span>

                    <span className="text-xs text-gray-400">
                      {timeAgo(request.createdAt)}
                    </span>
                  </div>

                  <div className="bg-stone-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {request.message}
                    </p>
                  </div>

                  {request.post && (
                    <p className="text-xs text-gray-400 mt-2">
                      Related post:{" "}
                      <span className="font-medium text-gray-500">
                        {request.post.title}
                      </span>
                    </p>
                  )}

                  {request.adminResponse && (
                    <div className="mt-4 border-l-4 border-emerald-500 bg-emerald-50 rounded-r-lg p-3">
                      <p className="text-xs font-bold text-emerald-700 mb-1">
                        Solacial Admin
                      </p>

                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {request.adminResponse}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}