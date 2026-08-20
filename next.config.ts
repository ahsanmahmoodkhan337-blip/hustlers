import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force clean server action IDs on each build
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;