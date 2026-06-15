// src/actions/votes.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "./user";

/** Toggle helpful vote on a post. Returns new count + voted state. */
export async function togglePostHelpful(postId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Please sign in to mark as helpful." };

  const user = await getOrCreateUser(clerkId);

  const existing = await prisma.helpfulVote.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.helpfulVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.helpfulVote.create({
      data: { userId: user.id, postId },
    });
  }

  const count = await prisma.helpfulVote.count({ where: { postId } });

  revalidatePath(`/post/${postId}`);
  revalidatePath("/community");

  return { success: true, helpful: count, userHelpful: !existing };
}

/** Toggle helpful vote on a comment. */
export async function toggleCommentHelpful(commentId: string, postId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Please sign in to mark as helpful." };

  const user = await getOrCreateUser(clerkId);

  const existing = await prisma.helpfulVote.findUnique({
    where: { userId_commentId: { userId: user.id, commentId } },
  });

  if (existing) {
    await prisma.helpfulVote.delete({ where: { id: existing.id } });
  } else {
    await prisma.helpfulVote.create({
      data: { userId: user.id, commentId },
    });
  }

  const count = await prisma.helpfulVote.count({ where: { commentId } });

  revalidatePath(`/post/${postId}`);

  return { success: true, helpful: count, userHelpful: !existing };
}
