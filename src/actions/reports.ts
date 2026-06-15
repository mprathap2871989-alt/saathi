// src/actions/reports.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";
import { sendReportAlert } from "@/lib/email";

/** Report a post */
export async function reportPost(postId: string, reason: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Please sign in to report content." };

  const user = await getOrCreateUser(clerkId);

  // Prevent duplicate reports from same user
  const existing = await prisma.report.findFirst({
    where: { postId, reporterId: user.id, resolved: false },
  });
  if (existing) return { success: true }; // silent dedupe

  // Fetch content for the email snippet before creating the report
  const post = await prisma.post.findUnique({
    where:  { id: postId },
    select: { id: true, title: true, story: true },
  });

  const report = await prisma.report.create({
    data: { postId, reason, reporterId: user.id },
  });

  // Fire-and-forget — email failure never blocks the report
  if (post) {
    void sendReportAlert({
      reportId:         report.id,
      reason,
      reporterUsername: user.username,
      contentType:      "post",
      contentId:        post.id,
      contentSnippet:   `${post.title} — ${post.story}`.slice(0, 200),
    });
  }

  revalidatePath("/admin");
  return { success: true };
}

/** Report a comment */
export async function reportComment(commentId: string, reason: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Please sign in to report content." };

  const user = await getOrCreateUser(clerkId);

  const existing = await prisma.report.findFirst({
    where: { commentId, reporterId: user.id, resolved: false },
  });
  if (existing) return { success: true };

  // Fetch comment + parent post ID for the email link
  const comment = await prisma.comment.findUnique({
    where:  { id: commentId },
    select: { id: true, text: true, postId: true },
  });

  const report = await prisma.report.create({
    data: { commentId, reason, reporterId: user.id },
  });

  // Fire-and-forget
  if (comment) {
    void sendReportAlert({
      reportId:         report.id,
      reason,
      reporterUsername: user.username,
      contentType:      "comment",
      contentId:        comment.postId,  // link goes to the parent post thread
      contentSnippet:   comment.text.slice(0, 200),
    });
  }

  revalidatePath("/admin");
  return { success: true };
}

/** Admin: get all unresolved reports */
export async function getPendingReports() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return [];

  const admin = await prisma.user.findUnique({ where: { clerkId } });
  if (!admin?.isAdmin) return [];

  return prisma.report.findMany({
    where: { resolved: false },
    include: {
      reporter: { select: { username: true } },
      post:     { select: { id: true, title: true, userId: true } },
      comment:  { select: { id: true, text: true, postId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Admin: resolve a report (dismiss without action) */
export async function resolveReport(reportId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const admin = await prisma.user.findUnique({ where: { clerkId } });
  if (!admin?.isAdmin) return { error: "Unauthorized" };

  await prisma.report.update({
    where: { id: reportId },
    data:  { resolved: true },
  });

  revalidatePath("/admin");
  return { success: true };
}
