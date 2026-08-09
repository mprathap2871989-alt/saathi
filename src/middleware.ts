// src/middleware.ts
// Clerk auth middleware.
// Public routes: homepage, community feed, single post, categories, guidelines.
// Protected routes: create post, profile, admin — require sign-in.

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/create(.*)",
  "/profile(.*)",
  "/admin(.*)",
]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    frontendApiProxy: {
      enabled: true,
    },
  },
);

export const config = {
  matcher: [
    // Clerk frontend API proxy
    "/__clerk/(.*)",

    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    // API / tRPC
    "/(api|trpc)(.*)",
  ],
};