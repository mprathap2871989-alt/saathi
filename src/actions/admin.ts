// src/actions/admin.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user?.isAdmin) throw new Error("Forbidden");
  return user;
}

export async function getAllUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    select: {
      id:          true,
      username:    true,
      createdAt:   true,
      isSuspended: true,
      isAdmin:     true,
      _count:      { select: { posts: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getAdminStats() {
  await requireAdmin();

  const [postCount, userCount, reportCount, commentCount] = await Promise.all([
    prisma.post.count({ where: { isRemoved: false } }),
    prisma.user.count({ where: { isSuspended: false } }),
    prisma.report.count({ where: { resolved: false } }),
    prisma.comment.count({ where: { isRemoved: false } }),
  ]);

  return { postCount, userCount, reportCount, commentCount };
}
