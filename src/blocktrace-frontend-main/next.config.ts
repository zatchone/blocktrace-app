import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_DFX_NETWORK: process.env.DFX_NETWORK || 'local',
    NEXT_PUBLIC_IC_HOST: process.env.DFX_NETWORK === 'ic' 
      ? 'https://ic0.app' 
      : 'http://127.0.0.1:8081'
  }
};

export default nextConfig;