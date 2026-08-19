const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TEST_POST_IDS = [
  "cmskhunwn0001jr04aqdo7e1k",
  "cmsppmgne0001l704i28uyoux",
  "cmspv62vh0001la0452wihkfo",
  "cmspv712a0001l504auq1kwkc",
  "cmsrlgcx50001jp04nggwvbq7",
];

const TEST_COMMENT_IDS = [
  "cmskhvnxl0003jr04ine086a5",
  "cmsppnzid0001jp04nayudbrt",
  "cmsptn5bi0005if04y8r4s8rc",
  "cmsrlhjhc0001l9043dt9djno",
  "cmssnb1s50001l704tagu7v9j",
];

const SEED_USER_IDS = [
  "user_seed_1",
  "user_seed_2",
  "user_seed_3",
  "user_seed_4",
  "user_seed_5",
  "user_seed_6",
  "user_seed_7",
  "user_seed_8",
  "user_seed_9",
  "user_seed_admin",
];

const SEED_POST_IDS = [
  "post_seed_1",
  "post_seed_2",
  "post_seed_3",
  "post_seed_4",
  "post_seed_5",
  "post_seed_6",
  "post_seed_7",
  "post_seed_8",
];

const SEED_COMMENT_IDS = [
  "comment_seed_1",
  "comment_seed_2",
  "comment_seed_3",
  "comment_seed_4",
  "comment_seed_5",
  "comment_seed_6",
  "comment_seed_7",
  "comment_seed_8",
  "comment_seed_9",
  "comment_seed_10",
];

async function main() {
  console.log("Starting Solacial launch-data cleanup...\n");

  await prisma.$transaction(async (tx) => {
    // ------------------------------------------------------------
    // 1. Remove reports attached to the known test posts/comments.
    // ------------------------------------------------------------
    const testPostReports = await tx.report.deleteMany({
      where: {
        postId: {
          in: TEST_POST_IDS,
        },
      },
    });

    console.log(
      `Deleted ${testPostReports.count} test post reports.`
    );

    const testCommentReports = await tx.report.deleteMany({
      where: {
        commentId: {
          in: TEST_COMMENT_IDS,
        },
      },
    });

    console.log(
      `Deleted ${testCommentReports.count} test comment reports.`
    );

    // ------------------------------------------------------------
    // 2. Remove helpful votes from the known test posts/comments.
    // ------------------------------------------------------------
    const testPostVotes = await tx.helpfulVote.deleteMany({
      where: {
        postId: {
          in: TEST_POST_IDS,
        },
      },
    });

    console.log(
      `Deleted ${testPostVotes.count} test post votes.`
    );

    const testCommentVotes = await tx.helpfulVote.deleteMany({
      where: {
        commentId: {
          in: TEST_COMMENT_IDS,
        },
      },
    });

    console.log(
      `Deleted ${testCommentVotes.count} test comment votes.`
    );

    // ------------------------------------------------------------
    // 3. Remove the known test comments.
    // ------------------------------------------------------------
    const testComments = await tx.comment.deleteMany({
      where: {
        id: {
          in: TEST_COMMENT_IDS,
        },
      },
    });

    console.log(
      `Deleted ${testComments.count} test comments.`
    );

    // ------------------------------------------------------------
    // 4. Remove the known test posts.
    // ------------------------------------------------------------
    const testPosts = await tx.post.deleteMany({
      where: {
        id: {
          in: TEST_POST_IDS,
        },
      },
    });

    console.log(
      `Deleted ${testPosts.count} test posts.`
    );

    // ------------------------------------------------------------
    // 5. Remove helpful votes belonging to seeded demo content.
    // ------------------------------------------------------------
    const seedPostVotes = await tx.helpfulVote.deleteMany({
      where: {
        postId: {
          in: SEED_POST_IDS,
        },
      },
    });

    console.log(
      `Deleted ${seedPostVotes.count} seeded post votes.`
    );

    const seedCommentVotes = await tx.helpfulVote.deleteMany({
      where: {
        commentId: {
          in: SEED_COMMENT_IDS,
        },
      },
    });

    console.log(
      `Deleted ${seedCommentVotes.count} seeded comment votes.`
    );

    // ------------------------------------------------------------
    // 6. Remove reports attached to seeded posts/comments.
    // ------------------------------------------------------------
    const seedPostReports = await tx.report.deleteMany({
      where: {
        postId: {
          in: SEED_POST_IDS,
        },
      },
    });

    console.log(
      `Deleted ${seedPostReports.count} seeded post reports.`
    );

    const seedCommentReports = await tx.report.deleteMany({
      where: {
        commentId: {
          in: SEED_COMMENT_IDS,
        },
      },
    });

    console.log(
      `Deleted ${seedCommentReports.count} seeded comment reports.`
    );

    // ------------------------------------------------------------
    // 7. Remove seeded comments.
    // ------------------------------------------------------------
    const seedComments = await tx.comment.deleteMany({
      where: {
        id: {
          in: SEED_COMMENT_IDS,
        },
      },
    });

    console.log(
      `Deleted ${seedComments.count} seeded comments.`
    );

    // ------------------------------------------------------------
    // 8. Remove seeded posts.
    // ------------------------------------------------------------
    const seedPosts = await tx.post.deleteMany({
      where: {
        id: {
          in: SEED_POST_IDS,
        },
      },
    });

    console.log(
      `Deleted ${seedPosts.count} seeded posts.`
    );

    // ------------------------------------------------------------
    // 9. Remove the original development seed users.
    //
    // These are explicitly identified by their user_seed_* IDs.
    // No real user IDs are targeted here.
    // ------------------------------------------------------------
    const seedUsers = await tx.user.deleteMany({
      where: {
        id: {
          in: SEED_USER_IDS,
        },
      },
    });

    console.log(
      `Deleted ${seedUsers.count} seeded demo users.`
    );
  });

  console.log("\nLaunch-data cleanup complete.");
  console.log("Real Solacial user data was not targeted.");
}

main()
  .catch((error) => {
    console.error("\nCleanup failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
