// prisma/seed.ts
// Run: npm run db:seed

import { PrismaClient } from "@prisma/client";

// Production safety guard — seed must never run against the production database
if (process.env.NODE_ENV === "production") {
  console.error("❌ Seed script must not run in production. Exiting.");
  process.exit(1);
}


const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Saathi database...");

  // ── Categories ──────────────────────────────
  const categories = [
    { id: "students",  label: "Students",         emoji: "📚", desc: "Exams, academic stress, college life",     order: 1  },
    { id: "career",    label: "Career & Jobs",    emoji: "💼", desc: "Job loss, career confusion, workplace",    order: 2  },
    { id: "relations", label: "Relationships",    emoji: "💛", desc: "Heartbreak, dating, boundaries",           order: 3  },
    { id: "family",    label: "Family Issues",    emoji: "🏠", desc: "Conflicts, estrangement, dynamics",        order: 4  },
    { id: "mens",      label: "Men's Support",    emoji: "🧭", desc: "Challenges men navigate alone",            order: 5  },
    { id: "womens",    label: "Women's Support",  emoji: "🌸", desc: "Women supporting women",                   order: 6  },
    { id: "lgbtq",     label: "LGBTQ+ Support",   emoji: "🌈", desc: "Identity, acceptance, safety",             order: 7  },
    { id: "elderly",   label: "Elderly Support",  emoji: "🌻", desc: "Isolation, aging, wisdom",                 order: 8  },
    { id: "grief",     label: "Grief & Loss",     emoji: "🕊️", desc: "Loss, bereavement, healing",               order: 9  },
    { id: "financial", label: "Financial Stress", emoji: "🌱", desc: "Debt, hardship, recovery",                 order: 10 },
    { id: "parenting", label: "Parenting",        emoji: "👶", desc: "Parenting challenges and joys",            order: 11 },
    { id: "mental",    label: "Mental Wellness",  emoji: "🧘", desc: "Anxiety, depression, coping",              order: 12 },
    { id: "other",     label: "Other",            emoji: "💬", desc: "Everything else",                          order: 13 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories seeded");

  // ── Seed Users ───────────────────────────────
  // In production these are created via Clerk webhook.
  // These are demo users for development only.
  const users = [
    { id: "user_seed_1", clerkId: "clerk_seed_1", username: "HopefulMind45"    },
    { id: "user_seed_2", clerkId: "clerk_seed_2", username: "RisingAgain12"    },
    { id: "user_seed_3", clerkId: "clerk_seed_3", username: "BraveSoul123"     },
    { id: "user_seed_4", clerkId: "clerk_seed_4", username: "QuietStrength88"  },
    { id: "user_seed_5", clerkId: "clerk_seed_5", username: "SilverLeaf67"     },
    { id: "user_seed_6", clerkId: "clerk_seed_6", username: "NewDawn22"        },
    { id: "user_seed_7", clerkId: "clerk_seed_7", username: "TenderHeart91"    },
    { id: "user_seed_8", clerkId: "clerk_seed_8", username: "GentleWave55"     },
    { id: "user_seed_9", clerkId: "clerk_seed_9", username: "PeacefulPath33"   },
    { id: "user_seed_admin", clerkId: "clerk_seed_admin", username: "Moderator", isAdmin: true },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { clerkId: u.clerkId },
      update: {},
      create: u,
    });
  }
  console.log("✅ Users seeded");

  // ── Seed Posts ───────────────────────────────
  const posts = [
    {
      id: "post_seed_1",
      userId: "user_seed_1",
      categoryId: "students",
      title: "Failed my CA exams for the third time. I don't know how to face my family.",
      story: `I've been studying for my CA finals for 3 years now. I just got my results today and I failed again. My parents have invested so much money and hope in me. My dad took a loan for my coaching.

I don't even know how to go home today. I've been sitting in a park for 4 hours now just scrolling through my phone.

I'm 26 and all my friends have jobs and are moving forward in life. I feel like a complete failure. I know I should be stronger but I just can't stop crying.

Has anyone else been through something like this? How do you keep going when you feel like you've let everyone down?`,
    },
    {
      id: "post_seed_2",
      userId: "user_seed_2",
      categoryId: "career",
      title: "Lost my job of 8 years in a 'restructuring'. 52 years old. Not sure who I am anymore.",
      story: `Got a call on Friday afternoon. "We're letting you go as part of a restructuring." Eight years. Eight. I built that entire department from scratch. Trained every person in my team.

I'm 52. My kids are in college. My wife works but her salary alone won't cover our expenses. I've sent out 40 applications in two weeks and heard nothing back.

I've been pretending to "work from home" while spending my days applying for jobs. I feel ashamed and it's eating me alive.

I don't know how to face my family. I keep thinking: am I too old for this industry now?`,
    },
    {
      id: "post_seed_3",
      userId: "user_seed_3",
      categoryId: "relations",
      title: "She left after 6 years. Said she never loved me the way I deserved.",
      story: `We were together for 6 years. I thought we'd get married someday. Two months ago she sat me down and said she loves me but was never "in love" with me. That she'd been feeling this for 2 years but didn't know how to say it.

2 years. She stayed for 2 years knowing this.

I don't know whether to be heartbroken or angry. Both, I think. We shared an apartment. I had to move back with my parents at 29. I feel embarrassed and honestly a little stupid for not seeing it.

How do you start over when the entire future you imagined is just... gone?`,
    },
    {
      id: "post_seed_4",
      userId: "user_seed_4",
      categoryId: "family",
      title: "My mother hasn't spoken to me in 8 months because I married outside our community.",
      story: `My husband is the most wonderful, kind, hardworking man I know. He treats me with respect and love every single day. We've been married 10 months.

My mother has not called me once. My aunts send passive-aggressive messages. My dad visits occasionally but makes sure my mother doesn't know.

I grew up thinking family meant unconditional love. I'm slowly learning that some families have conditions.

I'm grieving a relationship I thought I had.

For anyone who has navigated family rejection: does it get easier? Or do you just learn to carry it differently?`,
    },
    {
      id: "post_seed_5",
      userId: "user_seed_5",
      categoryId: "elderly",
      title: "My children are in different cities. I talk to the walls more than to people.",
      story: `I am 71 years old. My son is in Bangalore, my daughter is in Canada. My husband passed 3 years ago. My neighbours are not unfriendly but everyone is busy with their own lives.

I have WhatsApp but my children message when they can. I understand — they have their own families now.

Some days I don't speak to another human being at all. I didn't think old age would feel this quiet.

I am not writing this for pity. I am writing this because I wonder if others feel the same, and if feeling less alone even in this small way helps. Does it?`,
    },
    {
      id: "post_seed_6",
      userId: "user_seed_6",
      categoryId: "lgbtq",
      title: "I came out to my parents and it went better than I expected. Sharing this for hope.",
      story: `I was terrified. I'm 24. I had been rehearsing this conversation for 3 years. Last Sunday I finally told my parents I'm gay.

My dad went quiet for a long time. Then he said, "Beta, we just want you to be happy and safe."

My mom cried. But she hugged me afterward.

I know not everyone will have this experience. Some of you are in situations where coming out is genuinely dangerous. Please stay safe. You decide your own timeline.

But for those paralyzed by fear like I was: sometimes people surprise you. I just wanted to share a hopeful story in case you needed one today.`,
    },
    {
      id: "post_seed_7",
      userId: "user_seed_7",
      categoryId: "grief",
      title: "My mother passed 6 months ago. Everyone thinks I should be 'over it' by now.",
      story: `She died suddenly. Heart attack. She was 63 and healthy. I spoke to her on the phone the night before. We talked about what to cook for Sunday lunch.

Six months later and I'm still not okay. I still reach for my phone to call her and then remember. I still have her voice saved on a voicemail I can't bring myself to delete.

People keep saying things like "she'd want you to move on." I know they mean well. But grief doesn't follow a schedule.

If you've lost a parent: when did things start to feel more manageable? I'm not asking when it gets "better" — I know it changes, not disappears.`,
    },
    {
      id: "post_seed_8",
      userId: "user_seed_8",
      categoryId: "mental",
      title: "I finally started therapy after 3 years of avoiding it. Here's what surprised me.",
      story: `I'm writing this because if I had read something like this 3 years ago, I might have started sooner.

I always thought therapy was for people with "real" problems. I just had anxiety and some sadness. Normal stuff, I told myself. I'll be fine.

I wasn't fine. I was just good at appearing fine.

My first session: I cried for 40 minutes and said barely 10 sentences. My therapist didn't try to fix me. She just listened.

3 months in: I still have bad days. But I understand myself better. I'm less afraid of my own mind.

If you've been putting it off: you deserve support too. Whatever you're carrying.`,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: post,
    });
  }
  console.log("✅ Posts seeded");

  // ── Seed Comments ────────────────────────────
  const comments = [
    {
      id: "comment_seed_1",
      postId: "post_seed_1",
      userId: "user_seed_9",
      text: "Three attempts shows incredible resilience, not failure. I failed my UPSC twice before clearing it. The pain is real — but you are not the exam result. Please go home. Your family loves you more than you know right now.",
    },
    {
      id: "comment_seed_2",
      postId: "post_seed_1",
      userId: "user_seed_8",
      text: "My brother failed his CA five times. He is now a CFO at a major company. I know that doesn't make today easier — but the story isn't finished. Please don't let one chapter define the whole book.",
    },
    {
      id: "comment_seed_3",
      postId: "post_seed_2",
      userId: "user_seed_1",
      text: "52 is not too old. I know it feels that way in this market. Consider reaching out to your alumni network — real opportunities often come from there, not job boards. And please tell your family. Carrying this alone makes it so much heavier.",
    },
    {
      id: "comment_seed_4",
      postId: "post_seed_2",
      userId: "user_seed_4",
      text: "The shame is the hardest part, not the job search itself. You built a department. You trained people. That expertise doesn't expire just because a company let you go. Their loss is real, not your failure.",
    },
    {
      id: "comment_seed_5",
      postId: "post_seed_6",
      userId: "user_seed_3",
      text: "This made me cry in the best way. Thank you for sharing this. I've been hiding for 2 years and I needed to read something like this today.",
    },
    {
      id: "comment_seed_6",
      postId: "post_seed_6",
      userId: "user_seed_7",
      text: "The relief in your words is palpable. I hope my story goes the same way when I'm ready. Thank you for giving me a little more courage.",
    },
    {
      id: "comment_seed_7",
      postId: "post_seed_8",
      userId: "user_seed_6",
      text: "I've been putting off therapy for 2 years. I'm making an appointment tomorrow. Thank you for writing this.",
    },
    {
      id: "comment_seed_8",
      postId: "post_seed_8",
      userId: "user_seed_5",
      text: "I am 71 years old and only started last year. It is never too late. You are right that she just listens. That is what I needed most.",
    },
    {
      id: "comment_seed_9",
      postId: "post_seed_5",
      userId: "user_seed_9",
      text: "Yes, it helps. I found this community because I too was very lonely after my husband passed. Reading your words, I feel less alone. That is real, even if it is small.",
    },
    {
      id: "comment_seed_10",
      postId: "post_seed_7",
      userId: "user_seed_4",
      text: "It's been 4 years since I lost my father. It doesn't stop hurting. But around the 18-month mark, I noticed I could think about him and smile first, cry second. Not gone. Just shifted. You will get there.",
    },
  ];

  for (const comment of comments) {
    await prisma.comment.upsert({
      where: { id: comment.id },
      update: {},
      create: comment,
    });
  }
  console.log("✅ Comments seeded");

  // ── Seed Helpful Votes ───────────────────────
  const votes = [
    { id: "vote_1", userId: "user_seed_2", postId: "post_seed_1" },
    { id: "vote_2", userId: "user_seed_3", postId: "post_seed_1" },
    { id: "vote_3", userId: "user_seed_4", postId: "post_seed_2" },
    { id: "vote_4", userId: "user_seed_5", postId: "post_seed_2" },
    { id: "vote_5", userId: "user_seed_1", postId: "post_seed_6" },
    { id: "vote_6", userId: "user_seed_2", postId: "post_seed_6" },
    { id: "vote_7", userId: "user_seed_3", postId: "post_seed_8" },
    { id: "vote_8", userId: "user_seed_1", commentId: "comment_seed_1" },
    { id: "vote_9", userId: "user_seed_2", commentId: "comment_seed_5" },
  ];

  for (const v of votes) {
    await prisma.helpfulVote.upsert({
      where: v.postId
        ? { userId_postId: { userId: v.userId, postId: v.postId } }
        : { userId_commentId: { userId: v.userId, commentId: v.commentId! } },
      update: {},
      create: v,
    });
  }
  console.log("✅ Helpful votes seeded");

  console.log("\n🎉 Saathi database ready. Run: npm run dev");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
