import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["postgres", "drizzle-orm"],
  allowedDevOrigins: ['172.23.181.58'],
  images: {
    remotePatterns: [new URL('https://github.com/**')]
  }
};

export default nextConfig;
