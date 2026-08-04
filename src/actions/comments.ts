// src/actions/comments.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { containsBlockedContent } from "@/lib/utils";
import { getOrCreateUser } from "./user";

const CommentSchema = z.object({
  text:   z.string().min(10, "Please write at least 10 characters").max(2000),
  postId: z.string().min(1),
});

export async function createComment(formData: { text: string; postId: string }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Please sign in to leave a response." };

  const parsed = CommentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { text, postId } = parsed.data;

  if (containsBlockedContent(text)) {
    return { error: "Your response contains content that isn't allowed." };
  }

  // Rate limit: 10 comments per day
  const user = await getOrCreateUser(clerkId);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCount = await prisma.comment.count({
    where: { userId: user.id, createdAt: { gte: todayStart } },
  });
  if (todayCount >= 10) {
    return { error: "You've reached the daily limit of 10 responses." };
  }

  // Confirm post exists
  const post = await prisma.post.findUnique({ where: { id: postId, isRemoved: false } });
  if (!post) return { error: "Post not found." };

  await prisma.comment.create({
    data: { text, postId, userId: user.id },
  });

  revalidatePath(`/post/${postId}`);
  return { success: true };
}

export async function removeComment(commentId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user?.isAdmin) return { error: "Unauthorized" };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { postId: true },
  });

  await prisma.comment.update({
    where: { id: commentId },
    data:  { isRemoved: true },
  });

  if (comment) revalidatePath(`/post/${comment.postId}`);
  revalidatePath("/admin");
  return { success: true };
}
