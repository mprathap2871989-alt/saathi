// src/actions/reports.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getActiveUser } from "./user";
import { notifyAdminOfNewReport } from "@/lib/email";

// Daily report limit, mirroring the existing daily-count pattern used for
// createPost (3/day) and createComment (10/day).
const DAILY_REPORT_LIMIT = 10;

/** Shared by reportPost/reportComment */
async function hasReachedDailyReportLimit(
  userId: string
): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCount = await prisma.report.count({
    where: {
      reporterId: userId,
      createdAt: {
        gte: todayStart,
      },
    },
  });

  return todayCount >= DAILY_REPORT_LIMIT;
}

/** Report a post */
export async function reportPost(postId: string, reason: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return {
      error: "Please sign in to report content.",
    };
  }

  // Active account check
  const { user, error } = await getActiveUser(clerkId);

  if (!user) {
    return { error };
  }

  // Prevent duplicate reports from same user
  const existing = await prisma.report.findFirst({
    where: {
      postId,
      reporterId: user.id,
      resolved: false,
    },
  });

  if (existing) {
    return { success: true };
  }

  if (await hasReachedDailyReportLimit(user.id)) {
    return {
      error: `You've reached the daily limit of ${DAILY_REPORT_LIMIT} reports. Please try again tomorrow.`,
    };
  }

  const report = await prisma.report.create({
    data: {
      postId,
      reason,
      reporterId: user.id,
    },
  });

  // notifyAdminOfNewReport() handles its own failures,
  // so notification issues cannot fail the report itself.
  await notifyAdminOfNewReport({
    reportType: "post",
    contentId: postId,
    reason,
    createdAt: report.createdAt,
  });

  revalidatePath("/admin");

  return { success: true };
}

/** Report a comment */
export async function reportComment(commentId: string, reason: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return {
      error: "Please sign in to report content.",
    };
  }

  // Active account check
  const { user, error } = await getActiveUser(clerkId);

  if (!user) {
    return { error };
  }

  // Prevent duplicate reports from same user
  const existing = await prisma.report.findFirst({
    where: {
      commentId,
      reporterId: user.id,
      resolved: false,
    },
  });

  if (existing) {
    return { success: true };
  }

  if (await hasReachedDailyReportLimit(user.id)) {
    return {
      error: `You've reached the daily limit of ${DAILY_REPORT_LIMIT} reports. Please try again tomorrow.`,
    };
  }

  const report = await prisma.report.create({
    data: {
      commentId,
      reason,
      reporterId: user.id,
    },
  });

  // notifyAdminOfNewReport() handles its own failures,
  // so notification issues cannot fail the report itself.
  await notifyAdminOfNewReport({
    reportType: "comment",
    contentId: commentId,
    reason,
    createdAt: report.createdAt,
  });

  revalidatePath("/admin");

  return { success: true };
}

/** Admin: get all unresolved reports */
export async function getPendingReports() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return [];
  }

  const admin = await prisma.user.findUnique({
    where: {
      clerkId,
    },
  });

  if (!admin?.isAdmin) {
    return [];
  }

  return prisma.report.findMany({
    where: {
      resolved: false,
    },
    include: {
      reporter: {
        select: {
          username: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          userId: true,
        },
      },
      comment: {
        select: {
          id: true,
          text: true,
          postId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/** Admin: resolve a report (dismiss without action) */
export async function resolveReport(reportId: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { error: "Unauthorized" };
  }

  const admin = await prisma.user.findUnique({
    where: {
      clerkId,
    },
  });

  if (!admin?.isAdmin) {
    return { error: "Unauthorized" };
  }

  await prisma.report.update({
    where: {
      id: reportId,
    },
    data: {
      resolved: true,
    },
  });

  revalidatePath("/admin");

  return { success: true };
}