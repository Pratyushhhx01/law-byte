import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "kysely",
    "pg",
    "pdf-parse",
    "better-auth",
  ],
};

export default nextConfig;
