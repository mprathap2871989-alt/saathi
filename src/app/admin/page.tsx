// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BarChart2, Flag, BookOpen, Users } from "lucide-react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AdminTabs from "@/components/admin/AdminTabs";
import type { AdminReport, AdminPost, AdminUser } from "@/components/admin/AdminTabs";
import { prisma } from "@/lib/prisma";
import { getPendingReports } from "@/actions/reports";
import { getPosts } from "@/actions/posts";
import { getAllUsers, getAdminStats } from "@/actions/admin";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin — Saathi" };

export default async function AdminPage() {
  // ── Auth & admin guard ──────────────────────
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user?.isAdmin) {
    redirect("/community"); // silently redirect non-admins
  }

  // ── Fetch data ──────────────────────────────
  const [rawReports, rawPosts, rawUsers, stats] = await Promise.all([
    getPendingReports(),
    getPosts({ limit: 50 }),
    getAllUsers(),
    getAdminStats(),
  ]);

  // ── Serialise for client component ──────────
  const reports: AdminReport[] = rawReports.map((r) => ({
    id:        r.id,
    reason:    r.reason,
    createdAt: timeAgo(r.createdAt),
    reporter:  { username: r.reporter.username },
    post:      r.post ? { id: r.post.id, title: r.post.title } : null,
    comment:   r.comment
      ? { id: r.comment.id, text: r.comment.text, postId: r.comment.postId }
      : null,
  }));

  const posts: AdminPost[] = rawPosts.map((p) => ({
    id:           p.id,
    title:        p.title,
    username:     p.user.username,
    categoryId:   p.categoryId,
    createdAt:    timeAgo(p.createdAt),
    helpfulCount: p._count.helpfulVotes,
    commentCount: p._count.comments,
  }));

  const users: AdminUser[] = rawUsers.map((u) => ({
    id:          u.id,
    username:    u.username,
    createdAt:   timeAgo(u.createdAt),
    isSuspended: u.isSuspended,
    postCount:   u._count.posts,
  }));

  const statCards = [
    { label: "Live Posts",      val: stats.postCount,    icon: <BookOpen size={15}/>, accent: "text-emerald-600" },
    { label: "Active Users",    val: stats.userCount,    icon: <Users    size={15}/>, accent: "text-blue-600"    },
    { label: "Pending Reports", val: stats.reportCount,  icon: <Flag     size={15}/>, accent: stats.reportCount > 0 ? "text-red-600" : "text-gray-400" },
    { label: "Comments",        val: stats.commentCount, icon: <BarChart2 size={15}/>, accent: "text-violet-600" },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-lg">⚙️</span>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-xs text-gray-400">Signed in as {user.username}</p>
          </div>
          {stats.reportCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {stats.reportCount} pending
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {statCards.map(({ label, val, icon, accent }) => (
            <div key={label} className="bg-white rounded-xl border border-stone-200 p-3 text-center">
              <div className={`flex items-center justify-center mb-1 ${accent}`}>{icon}</div>
              <div className="text-2xl font-bold text-gray-900">{val}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Admin tabs (client component) */}
        <AdminTabs reports={reports} posts={posts} users={users} />
      </main>
    </>
  );
}
