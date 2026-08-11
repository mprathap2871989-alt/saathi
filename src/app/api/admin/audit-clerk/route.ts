// src/app/api/admin/audit-clerk/route.ts

import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ------------------------------------------------------------
    // 1. Authenticate the request
    // ------------------------------------------------------------
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ------------------------------------------------------------
    // 2. Verify that the signed-in user is a Saathi admin
    // ------------------------------------------------------------
    const adminUser = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        username: true,
        isAdmin: true,
      },
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // ------------------------------------------------------------
    // 3. Read ALL Clerk users
    //
    // IMPORTANT:
    // This is read-only. No Clerk mutation methods are used.
    // ------------------------------------------------------------
    const client = await clerkClient();

    const clerkUsers: Awaited<
      ReturnType<typeof client.users.getUserList>
    >["data"] = [];

    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await client.users.getUserList({
        limit,
        offset,
        orderBy: "-created_at",
      });

      clerkUsers.push(...response.data);

      if (clerkUsers.length >= response.totalCount) {
        break;
      }

      offset += response.data.length;

      if (response.data.length === 0) {
        break;
      }
    }

    // ------------------------------------------------------------
    // 4. Read ALL Prisma users
    //
    // IMPORTANT:
    // This is also completely read-only.
    // ------------------------------------------------------------
    const prismaUsers = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        username: true,
        isAdmin: true,
        isSuspended: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // ------------------------------------------------------------
    // 5. Build lookup maps
    // ------------------------------------------------------------
    const prismaByClerkId = new Map(
      prismaUsers.map((user) => [user.clerkId, user])
    );

    const clerkById = new Map(
      clerkUsers.map((user) => [user.id, user])
    );

    // ------------------------------------------------------------
    // 6. Find healthy matches
    // ------------------------------------------------------------
    const matched = clerkUsers
      .filter((clerkUser) => prismaByClerkId.has(clerkUser.id))
      .map((clerkUser) => {
        const prismaUser = prismaByClerkId.get(clerkUser.id)!;

        return {
          clerkId: clerkUser.id,
          prismaUserId: prismaUser.id,
          username: prismaUser.username,
          clerkEmail:
            clerkUser.primaryEmailAddress?.emailAddress ?? null,
          prismaCreatedAt: prismaUser.createdAt,
          clerkCreatedAt: clerkUser.createdAt,
        };
      });

    // ------------------------------------------------------------
    // 7. Clerk users with NO Prisma User
    // ------------------------------------------------------------
    const clerkMissingInPrisma = clerkUsers
      .filter((clerkUser) => !prismaByClerkId.has(clerkUser.id))
      .map((clerkUser) => ({
        clerkId: clerkUser.id,
        email:
          clerkUser.primaryEmailAddress?.emailAddress ?? null,
        createdAt: clerkUser.createdAt,
      }));

    // ------------------------------------------------------------
    // 8. Prisma users with NO Clerk User
    // ------------------------------------------------------------
    const prismaMissingInClerk = prismaUsers
      .filter((prismaUser) => !clerkById.has(prismaUser.clerkId))
      .map((prismaUser) => ({
        prismaUserId: prismaUser.id,
        clerkId: prismaUser.clerkId,
        username: prismaUser.username,
        isAdmin: prismaUser.isAdmin,
        isSuspended: prismaUser.isSuspended,
        createdAt: prismaUser.createdAt,
      }));

    // ------------------------------------------------------------
    // 9. Return audit report
    // ------------------------------------------------------------
    return NextResponse.json({
      audit: {
        readOnly: true,
        timestamp: new Date().toISOString(),
        performedBy: {
          prismaUserId: adminUser.id,
          username: adminUser.username,
        },
      },

      summary: {
        clerkUsers: clerkUsers.length,
        prismaUsers: prismaUsers.length,
        matched: matched.length,
        clerkMissingInPrisma: clerkMissingInPrisma.length,
        prismaMissingInClerk: prismaMissingInClerk.length,
      },

      matched,
      clerkMissingInPrisma,
      prismaMissingInClerk,
    });
  } catch (error) {
    console.error("Clerk/Prisma audit failed:", error);

    return NextResponse.json(
      {
        error: "Audit failed",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}