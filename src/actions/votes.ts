// src/actions/votes.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";

// The findUnique -> create/delete sequence below isn't atomic: two
// near-simultaneous toggles (double-click, two tabs) can both read "no
// existing vote" and both attempt create(). The DB unique constraint on
// HelpfulVote (@@unique([userId, postId]) / @@unique([userId, commentId]))
// is the real source of truth and already prevents a duplicate row either
// way — these two checks just let the losing request resolve gracefully
// instead of throwing an uncaught exception that would leave that client's
// optimistic UI stuck. Duck-typed on `.code` rather than
// `instanceof Prisma.PrismaClientKnownRequestError` — functionally
// equivalent, avoids importing the Prisma error-class export for two
// narrowly-scoped checks.
function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "P2002";
}
function isRecordNotFoundError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "P2025";
}

/** Toggle helpful vote on a post. Returns new count + voted state. */
export async function togglePostHelpful(postId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Please sign in to mark as helpful." };

  const user = await getOrCreateUser(clerkId);

  const existing = await prisma.helpfulVote.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  let userHelpful: boolean;
  if (existing) {
    try {
      await prisma.helpfulVote.delete({ where: { id: existing.id } });
      userHelpful = false;
    } catch (err) {
      if (!isRecordNotFoundError(err)) throw err;
      userHelpful = false; // already removed by a concurrent request — same end state
    }
  } else {
    try {
      await prisma.helpfulVote.create({ data: { userId: user.id, postId } });
      userHelpful = true;
    } catch (err) {
      if (!isUniqueConstraintError(err)) throw err;
      userHelpful = true; // already created by a concurrent request — same end state
    }
  }

  const count = await prisma.helpfulVote.count({ where: { postId } });

  revalidatePath(`/post/${postId}`);
  revalidatePath("/community");

  return { success: true, helpful: count, userHelpful };
}

/** Toggle helpful vote on a comment. */
export async function toggleCommentHelpful(commentId: string, postId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Please sign in to mark as helpful." };

  const user = await getOrCreateUser(clerkId);

  const existing = await prisma.helpfulVote.findUnique({
    where: { userId_commentId: { userId: user.id, commentId } },
  });

  let userHelpful: boolean;
  if (existing) {
    try {
      await prisma.helpfulVote.delete({ where: { id: existing.id } });
      userHelpful = false;
    } catch (err) {
      if (!isRecordNotFoundError(err)) throw err;
      userHelpful = false;
    }
  } else {
    try {
      await prisma.helpfulVote.create({ data: { userId: user.id, commentId } });
      userHelpful = true;
    } catch (err) {
      if (!isUniqueConstraintError(err)) throw err;
      userHelpful = true;
    }
  }

  const count = await prisma.helpfulVote.count({ where: { commentId } });

  revalidatePath(`/post/${postId}`);

  return { success: true, helpful: count, userHelpful };
}
