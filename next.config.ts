import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "") ?? ""].filter(Boolean),
    },
  },
  images: {
    domains: [],
  },
};
export default nextConfig;