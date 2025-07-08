import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features that don't work with static export
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add this if you're using app router
  experimental: {
  }
};

export default nextConfig;