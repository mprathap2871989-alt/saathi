// src/actions/posts.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { containsBlockedContent } from "@/lib/utils";
import { containsCrisisContent } from "@/lib/crisis";
import { sendReportAlert } from "@/lib/email";
import { getOrCreateUser } from "./user";

// ── Validation ────────────────────────────────
const CreatePostSchema = z.object({
  title:      z.string().min(10, "Title must be at least 10 characters").max(200),
  story:      z.string().min(50, "Please share at least 50 characters").max(10000),
  categoryId: z.string().min(1, "Please choose a category"),
});

// ── Create Post ───────────────────────────────
export async function createPost(formData: {
  title: string;
  story: string;
  categoryId: string;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Please sign in to share your story." };

  const parsed = CreatePostSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { title, story, categoryId } = parsed.data;

  // Profanity filter — hard block, post not created
  if (containsBlockedContent(title) || containsBlockedContent(story)) {
    return { error: "Your post contains content that isn't allowed. Please review our guidelines." };
  }

  // Rate limit: max 3 posts per day per user
  const user = await getOrCreateUser(clerkId);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCount = await prisma.post.count({
    where: { userId: user.id, createdAt: { gte: todayStart } },
  });
  if (todayCount >= 3) {
    return { error: "You've reached the daily limit of 3 posts. Please try again tomorrow." };
  }

  // ── Crisis detection ──────────────────────────────────────────────────────
  // Post is always created — the person needs to feel heard.
  // If crisis content is detected:
  //   1. A Report is auto-filed so it surfaces in the admin queue immediately.
  //   2. isCrisis: true is returned so the create page shows the crisis modal.
  const isCrisis = containsCrisisContent(title) || containsCrisisContent(story);

  const post = await prisma.post.create({
    data: { title, story, categoryId, userId: user.id },
  });

  if (isCrisis) {
    const autoReport = await prisma.report.create({
      data: {
        postId:     post.id,
        reason:     "Crisis: automatic detection — post may indicate risk to life",
        reporterId: user.id,
      },
    });
    // Fire-and-forget — email failure never blocks the post
    void sendReportAlert({
      reportId:         autoReport.id,
      reason:           "Crisis: automatic detection — post may indicate risk to life",
      reporterUsername: user.username,
      contentType:      "post",
      contentId:        post.id,
      contentSnippet:   `${title} — ${story}`.slice(0, 200),
    });
    revalidatePath("/admin");
  }

  revalidatePath("/community");
  revalidatePath(`/category/${categoryId}`);

  return { success: true, postId: post.id, isCrisis };
}

// ── Fetch Posts (feed) ────────────────────────
export async function getPosts({
  categoryId,
  search,
  sort = "latest",
  page = 1,
  limit = 20,
}: {
  categoryId?: string;
  search?: string;
  sort?: "latest" | "helpful";
  page?: number;
  limit?: number;
}) {
  const where = {
    isRemoved: false,
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { story: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const posts = await prisma.post.findMany({
    where,
    include: {
      user:        { select: { username: true } },
      category:    { select: { id: true, label: true, emoji: true } },
      _count:      { select: { comments: true, helpfulVotes: true } },
    },
    orderBy: sort === "helpful"
      ? { helpfulVotes: { _count: "desc" } }
      : { createdAt: "desc" },
    skip:  (page - 1) * limit,
    take:  limit,
  });

  return posts;
}

// ── Fetch Single Post ─────────────────────────
export async function getPost(id: string) {
  const { userId: clerkId } = await auth();

  const post = await prisma.post.findUnique({
    where: { id, isRemoved: false },
    include: {
      user:     { select: { username: true } },
      category: { select: { id: true, label: true, emoji: true } },
      _count:   { select: { helpfulVotes: true } },
      comments: {
        where:   { isRemoved: false },
        include: {
          user:   { select: { username: true } },
          _count: { select: { helpfulVotes: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) return null;

  // Check if current user has voted
  let userHelpfulPost = false;
  if (clerkId) {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (user) {
      const vote = await prisma.helpfulVote.findUnique({
        where: { userId_postId: { userId: user.id, postId: post.id } },
      });
      userHelpfulPost = !!vote;
    }
  }

  return { ...post, userHelpful: userHelpfulPost };
}

// ── Admin: Remove Post ────────────────────────
export async function removePost(postId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user?.isAdmin) return { error: "Unauthorized" };

  await prisma.post.update({
    where: { id: postId },
    data:  { isRemoved: true },
  });

  revalidatePath("/community");
  revalidatePath("/admin");
  return { success: true };
}
