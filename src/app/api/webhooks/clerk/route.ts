// src/app/api/webhooks/clerk/route.ts
// Automatically creates a DB user row when someone signs up via Clerk.
// Setup: Clerk Dashboard → Webhooks → Add endpoint → select "user.created"
// Copy the Signing Secret into CLERK_WEBHOOK_SECRET env var.

import { Webhook } from "svix";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/username-generator";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return Response.json(
      { error: "CLERK_WEBHOOK_SECRET not set" },
      { status: 500 }
    );
  }

  // Read the raw body before verification.
  const payload = await req.text();

  // Svix signature headers.
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  // Verify the webhook signature.
  let event: {
    type: string;
    data: {
      id: string;
    };
  };

  try {
    const wh = new Webhook(WEBHOOK_SECRET);

    event = wh.verify(payload, headers) as typeof event;
  } catch {
    return Response.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // We currently only need user.created.
  if (event.type !== "user.created") {
    return Response.json({ ok: true });
  }

  const clerkId = event.data.id;

  // Idempotency:
  // If the user already exists, the webhook has already been processed.
  const existing = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existing) {
    return Response.json({
      ok: true,
      created: false,
      reason: "User already exists",
    });
  }

  try {
    const username = await generateUniqueUsername(async (name) => {
      const found = await prisma.user.findUnique({
        where: { username: name },
      });

      return !!found;
    });

    await prisma.user.create({
      data: {
        clerkId,
        username,
      },
    });

    return Response.json({
      ok: true,
      created: true,
    });
  } catch (error) {
    // A concurrent webhook delivery may have created the same
    // Clerk user between the findUnique() check and create().
    //
    // Because clerkId is @unique in Prisma, the database protects
    // us from creating duplicate users.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const userCreatedByAnotherRequest = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (userCreatedByAnotherRequest) {
        return Response.json({
          ok: true,
          created: false,
          reason: "User was created by another webhook delivery",
        });
      }
    }

    // Genuine database/application failure.
    console.error("Clerk user.created webhook failed:", error);

    return Response.json(
      {
        error: "Failed to create Prisma user",
      },
      { status: 500 }
    );
  }
}