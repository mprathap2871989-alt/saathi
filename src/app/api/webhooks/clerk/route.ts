// src/app/api/webhooks/clerk/route.ts
// Automatically creates a DB user row when someone signs up via Clerk.
// Setup: Clerk Dashboard → Webhooks → Add endpoint → select "user.created"
// Copy the Signing Secret into CLERK_WEBHOOK_SECRET env var.

import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";
import { generateUniqueUsername } from "@/lib/username-generator";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return Response.json({ error: "CLERK_WEBHOOK_SECRET not set" }, { status: 500 });
  }

  // Verify the webhook signature
  const payload = await req.text();
  const headers  = {
    "svix-id":        req.headers.get("svix-id")        ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let event: { type: string; data: { id: string } };
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(payload, headers) as typeof event;
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created") {
    const clerkId = event.data.id;

    // Idempotency — don't create duplicates
    const existing = await prisma.user.findUnique({ where: { clerkId } });
    if (!existing) {
      const username = await generateUniqueUsername(async (name) => {
        const found = await prisma.user.findUnique({ where: { username: name } });
        return !!found;
      });
      await prisma.user.create({ data: { clerkId, username } });
    }
  }

  return Response.json({ ok: true });
}
