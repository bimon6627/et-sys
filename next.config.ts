import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // This allows the server to safely throw 'forbidden()' errors
    authInterrupts: true,
  },
};

export default nextConfig;
