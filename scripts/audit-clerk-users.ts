import { config } from "dotenv";
config({ path: ".env.audit" });
import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const secretKey = process.env.CLERK_SECRET_KEY;

  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY is not available.");
  }

  const clerk = createClerkClient({
    secretKey,
  });

  console.log("\n=== Saathi Clerk ↔ Prisma User Audit ===\n");

  // ------------------------------------------------------------
  // 1. Fetch all Clerk users
  // ------------------------------------------------------------

  const clerkUsers: Array<{
    id: string;
    primaryEmail: string | null;
  }> = [];

  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await clerk.users.getUserList({
      limit,
      offset,
    });

    for (const user of response.data) {
      const primaryEmailId = user.primaryEmailAddressId;

      const primaryEmail =
        user.emailAddresses.find(
          (email) => email.id === primaryEmailId
        )?.emailAddress ?? null;

      clerkUsers.push({
        id: user.id,
        primaryEmail,
      });
    }

    if (response.data.length < limit) {
      break;
    }

    offset += limit;
  }

  // ------------------------------------------------------------
  // 2. Fetch all Prisma users
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
  // 3. Build lookup maps
  // ------------------------------------------------------------

  const clerkMap = new Map(
    clerkUsers.map((user) => [user.id, user])
  );

  const prismaMap = new Map(
    prismaUsers.map((user) => [user.clerkId, user])
  );

  // ------------------------------------------------------------
  // 4. Compare
  // ------------------------------------------------------------

  const matched = [];
  const missingFromPrisma = [];
  const missingFromClerk = [];

  for (const clerkUser of clerkUsers) {
    const prismaUser = prismaMap.get(clerkUser.id);

    if (prismaUser) {
      matched.push({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmail,
        saathiUserId: prismaUser.id,
        username: prismaUser.username,
      });
    } else {
      missingFromPrisma.push({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmail,
      });
    }
  }

  for (const prismaUser of prismaUsers) {
    if (!clerkMap.has(prismaUser.clerkId)) {
      missingFromClerk.push(prismaUser);
    }
  }

  // ------------------------------------------------------------
  // 5. Report summary
  // ------------------------------------------------------------

  console.log("SUMMARY");
  console.log("-------");
  console.log(`Clerk users:              ${clerkUsers.length}`);
  console.log(`Prisma users:             ${prismaUsers.length}`);
  console.log(`Matched:                  ${matched.length}`);
  console.log(`Missing from Prisma:      ${missingFromPrisma.length}`);
  console.log(`Missing from Clerk:       ${missingFromClerk.length}`);

  // ------------------------------------------------------------
  // 6. Matched users
  // ------------------------------------------------------------

  console.log("\n\nMATCHED USERS");
  console.log("-------------");

  if (matched.length === 0) {
    console.log("None");
  } else {
    for (const user of matched) {
      console.log(
        `✓ ${user.email ?? "(no email)"} | Clerk: ${user.clerkId} | Saathi: ${user.saathiUserId} | ${user.username}`
      );
    }
  }

  // ------------------------------------------------------------
  // 7. Clerk users missing from Prisma
  // ------------------------------------------------------------

  console.log("\n\nCLERK USERS MISSING FROM PRISMA");
  console.log("-------------------------------");

  if (missingFromPrisma.length === 0) {
    console.log("None — all Clerk users have a Saathi User.");
  } else {
    for (const user of missingFromPrisma) {
      console.log(
        `⚠ ${user.email ?? "(no email)"} | Clerk: ${user.clerkId}`
      );
    }
  }

  // ------------------------------------------------------------
  // 8. Prisma users missing from Clerk
  // ------------------------------------------------------------

  console.log("\n\nPRISMA USERS MISSING FROM CLERK");
  console.log("-------------------------------");

  if (missingFromClerk.length === 0) {
    console.log("None — every Prisma User has a Clerk account.");
  } else {
    for (const user of missingFromClerk) {
      console.log(
        `⚠ Saathi: ${user.id} | Clerk: ${user.clerkId} | ${user.username} | Admin: ${user.isAdmin} | Suspended: ${user.isSuspended}`
      );
    }
  }

  console.log("\n=== AUDIT COMPLETE — NO DATABASE CHANGES MADE ===\n");
}

main()
  .catch((error) => {
    console.error("\nAudit failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });