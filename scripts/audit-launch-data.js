const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const [users, posts, comments, helps, reports, votes] =
    await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          username: true,
          isAdmin: true,
          isSuspended: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              helpRequests: true,
              reports: true,
            },
          },
        },
      }),

      prisma.post.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          story: true,
          isRemoved: true,
          createdAt: true,
          user: {
            select: { username: true },
          },
          category: {
            select: { label: true },
          },
          _count: {
            select: {
              comments: true,
              helpfulVotes: true,
              reports: true,
              helpRequests: true,
            },
          },
        },
      }),

      prisma.comment.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          text: true,
          isRemoved: true,
          createdAt: true,
          user: {
            select: { username: true },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),

      prisma.helpRequest.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          message: true,
          status: true,
          adminResponse: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { username: true },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),

      prisma.report.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          reason: true,
          resolved: true,
          createdAt: true,
          reporter: {
            select: { username: true },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
          comment: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      }),

      prisma.helpfulVote.count(),
    ]);

  console.log("\n=== USERS ===");
  console.dir(users, { depth: null });

  console.log("\n=== POSTS ===");
  console.dir(posts, { depth: null });

  console.log("\n=== COMMENTS ===");
  console.dir(comments, { depth: null });

  console.log("\n=== HELP REQUESTS ===");
  console.dir(helps, { depth: null });

  console.log("\n=== REPORTS ===");
  console.dir(reports, { depth: null });

  console.log("\n=== TOTAL HELPFUL VOTES ===");
  console.log(votes);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
