// src/actions/helpRequests.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getActiveUser } from "@/actions/user";
import { HelpRequestStatus } from "@prisma/client";

const MAX_MESSAGE_LENGTH = 5000;

export async function createHelpRequest(
  message: string,
  postId?: string
) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return { error: "Not signed in" };
  }

  const { user, error } = await getActiveUser(clerkId);

  if (!user) {
    return { error };
  }

  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    return { error: "Please describe what you need help with." };
  }

  if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
    return {
      error: `Your message must be ${MAX_MESSAGE_LENGTH} characters or less.`,
    };
  }

  if (postId) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return { error: "The selected post could not be found." };
    }
  }

  await prisma.helpRequest.create({
    data: {
      message: trimmedMessage,
      userId: user.id,
      postId: postId || null,
    },
  });

  return { success: true };
}

export async function getMyHelpRequests() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) {
    return [];
  }

  return prisma.helpRequest.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      message: true,
      status: true,
      adminResponse: true,
      createdAt: true,
      updatedAt: true,
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}

async function requireAdmin() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const admin = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      isAdmin: true,
    },
  });

  if (!admin?.isAdmin) {
    throw new Error("Forbidden");
  }

  return admin;
}

export async function getAllHelpRequests() {
  await requireAdmin();

  return prisma.helpRequest.findMany({
    select: {
      id: true,
      message: true,
      status: true,
      adminResponse: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          username: true,
          isSuspended: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });
}

export async function respondToHelpRequest(
  helpRequestId: string,
  response: string
) {
  await requireAdmin();

  const trimmedResponse = response.trim();

  if (!trimmedResponse) {
    return { error: "Please enter a response." };
  }

  if (trimmedResponse.length > MAX_MESSAGE_LENGTH) {
    return {
      error: `Your response must be ${MAX_MESSAGE_LENGTH} characters or less.`,
    };
  }

  const existing = await prisma.helpRequest.findUnique({
    where: { id: helpRequestId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Help request not found." };
  }

  await prisma.helpRequest.update({
    where: {
      id: helpRequestId,
    },
    data: {
      adminResponse: trimmedResponse,
      status: HelpRequestStatus.RESPONDED,
    },
  });

  return { success: true };
}

export async function updateHelpRequestStatus(
  helpRequestId: string,
  status: HelpRequestStatus
) {
  await requireAdmin();

  if (!Object.values(HelpRequestStatus).includes(status)) {
    return { error: "Invalid help request status." };
  }

  const existing = await prisma.helpRequest.findUnique({
    where: { id: helpRequestId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Help request not found." };
  }

  await prisma.helpRequest.update({
    where: {
      id: helpRequestId,
    },
    data: {
      status,
    },
  });

  return { success: true };
}