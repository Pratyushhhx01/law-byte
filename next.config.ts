import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "kysely",
    "pg",
    "better-auth",
  ],
};

export default nextConfig;
