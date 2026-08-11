import { config } from "dotenv";

// Load the production environment pulled from Vercel.
config({ path: ".env.production.local" });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not available.");
  }

  if (
    !databaseUrl.startsWith("postgresql://") &&
    !databaseUrl.startsWith("postgres://")
  ) {
    throw new Error(
      "DATABASE_URL does not contain a valid PostgreSQL connection URL."
    );
  }

  const admins = await prisma.user.findMany({
    where: {
      isAdmin: true,
    },
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

  console.log("\n=== PRODUCTION PRISMA ADMINS ===\n");

  if (admins.length === 0) {
    console.log("NO ADMIN USERS FOUND");
  } else {
    for (const admin of admins) {
      console.log({
        id: admin.id,
        clerkId: admin.clerkId,
        username: admin.username,
        isAdmin: admin.isAdmin,
        isSuspended: admin.isSuspended,
        createdAt: admin.createdAt,
      });
    }
  }

  console.log("\n=== READ-ONLY CHECK COMPLETE ===\n");
}

main()
  .catch((error) => {
    console.error("Admin inspection failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });