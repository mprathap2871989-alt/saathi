// src/actions/user.ts
"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/username-generator";

/**
 * Gets the DB user for the current Clerk session.
 * Creates one automatically if it's their first visit.
 *
 * This function does NOT reject suspended users.
 * Suspension is an expected account state and must be handled safely
 * by pages and actions instead of throwing an unhandled error.
 */
export async function getOrCreateUser(clerkId?: string) {
  const id = clerkId ?? (await auth()).userId;

  if (!id) {
    throw new Error("Not authenticated");
  }

  const existing = await prisma.user.findUnique({
    where: { clerkId: id },
  });

  if (existing) {
    return existing;
  }

  // First-time user â€” generate anonymous username
  const username = await generateUniqueUsername(async (name) => {
    const found = await prisma.user.findUnique({
      where: { username: name },
    });

    return !!found;
  });

  await currentUser();

  return prisma.user.create({
    data: {
      clerkId: id,
      username,
      // Clerk email stored nowhere in our DB â€” we only use clerkId
    },
  });
}

/**
 * Gets the current user and ensures the account is active.
 *
 * Server actions that allow community participation should use this
 * instead of getOrCreateUser().
 */
export async function getActiveUser(clerkId?: string) {
  const user = await getOrCreateUser(clerkId);

  if (user.isSuspended) {
    return {
      user: null,
      error: "Your account has been suspended and cannot participate in the Solacial community.",
    };
  }

  return {
    user,
    error: null,
  };
}

/** Get profile data for the profile page */
export async function getMyProfile() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      posts: {
        where: { isRemoved: false },
        include: {
          category: {
            select: {
              id: true,
              label: true,
              emoji: true,
            },
          },
          _count: {
            select: {
              comments: true,
              helpfulVotes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          helpfulVotes: true,
          comments: true,
        },
      },
    },
  });

  return user;
}

/** Update username (optional customization) */
export async function updateUsername(newUsername: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { error: "Not signed in" };
  }

  const { user, error } = await getActiveUser(clerkId);

  if (!user) {
    return { error };
  }

  if (newUsername.length < 3 || newUsername.length > 30) {
    return { error: "Username must be 3â€“30 characters" };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
    return {
      error: "Only letters, numbers, and underscores allowed",
    };
  }

  const taken = await prisma.user.findUnique({
    where: {
      username: newUsername,
    },
  });

  if (taken && taken.id !== user.id) {
    return { error: "Username already taken" };
  }

  await prisma.user.update({
    where: {
      clerkId,
    },
    data: {
      username: newUsername,
    },
  });

  return { success: true };
}

/** Admin: suspend user */
export async function suspendUser(targetUserId: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { error: "Unauthorized" };
  }

  const admin = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!admin?.isAdmin) {
    return { error: "Unauthorized" };
  }

  if (admin.id === targetUserId) {
    return {
      error: "You cannot suspend your own account.",
    };
  }

  await prisma.user.update({
    where: {
      id: targetUserId,
    },
    data: {
      isSuspended: true,
    },
  });

  return { success: true };
}