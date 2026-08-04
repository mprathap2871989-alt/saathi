// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", process.env.NEXT_PUBLIC_APP_URL ?? ""],
    },
  },
  images: {
    // Add domains here if you ever add image uploads
    domains: [],
  },
};

export default nextConfig;
