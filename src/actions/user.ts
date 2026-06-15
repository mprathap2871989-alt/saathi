// src/actions/user.ts
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/username-generator";

/**
 * Gets the DB user for the current Clerk session.
 * Creates one automatically if it's their first visit.
 * Call this at the start of any server action that needs the user.
 */
export async function getOrCreateUser(clerkId?: string) {
  const id = clerkId ?? (await auth()).userId;
  if (!id) throw new Error("Not authenticated");

  const existing = await prisma.user.findUnique({ where: { clerkId: id } });
  if (existing) {
    if (existing.isSuspended) throw new Error("Account suspended");
    return existing;
  }

  // First time — generate anonymous username
  const username = await generateUniqueUsername(async (name) => {
    const found = await prisma.user.findUnique({ where: { username: name } });
    return !!found;
  });

  const clerkUser = await currentUser();

  return prisma.user.create({
    data: {
      clerkId:  id,
      username,
      // Clerk email stored nowhere in our DB — we only use clerkId
    },
  });
}

/** Get profile data for the profile page */
export async function getMyProfile() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      posts: {
        where:   { isRemoved: false },
        include: {
          category: { select: { id: true, label: true, emoji: true } },
          _count:   { select: { comments: true, helpfulVotes: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { helpfulVotes: true, comments: true },
      },
    },
  });

  return user;
}

/** Update username (optional customization) */
export async function updateUsername(newUsername: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not signed in" };

  if (newUsername.length < 3 || newUsername.length > 30) {
    return { error: "Username must be 3–30 characters" };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
    return { error: "Only letters, numbers, and underscores allowed" };
  }

  const taken = await prisma.user.findUnique({ where: { username: newUsername } });
  if (taken) return { error: "Username already taken" };

  await prisma.user.update({
    where: { clerkId },
    data:  { username: newUsername },
  });

  return { success: true };
}

/** Admin: suspend user */
export async function suspendUser(targetUserId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const admin = await prisma.user.findUnique({ where: { clerkId } });
  if (!admin?.isAdmin) return { error: "Unauthorized" };

  await prisma.user.update({
    where: { id: targetUserId },
    data:  { isSuspended: true },
  });

  return { success: true };
}
