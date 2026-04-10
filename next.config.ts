import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Disable default loading indicator - use instant navigation
  // loading: null means no loading bar
};

export default nextConfig;
