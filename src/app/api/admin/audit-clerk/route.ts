// src/app/api/admin/audit-clerk/route.ts

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    const adminUser = clerkId
      ? await prisma.user.findUnique({
          where: { clerkId },
          select: {
            id: true,
            clerkId: true,
            username: true,
            isAdmin: true,
          },
        })
      : null;

    return NextResponse.json({
      debug: {
        clerkId,
        adminUser,
      },
    });
  } catch (error) {
    console.error("Admin audit diagnostic failed:", error);

    return NextResponse.json(
      {
        error: "Diagnostic failed",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}