import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "kysely",
    "@better-auth/kysely-adapter",
    "@prisma/adapter-pg",
    "better-auth",
    "better-auth/kysely-adapter",
  ],
};

export default nextConfig;
