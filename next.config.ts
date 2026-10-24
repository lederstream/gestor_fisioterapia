import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 2,
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
