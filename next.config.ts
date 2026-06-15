// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ?? ""].filter(Boolean),
    },
  },
  images: {
    // Add domains here if you ever add image uploads
    domains: [],
  },
};

export default nextConfig;
