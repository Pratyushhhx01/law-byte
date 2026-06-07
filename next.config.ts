import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "kysely",
    "@better-auth/kysely-adapter",
    "@prisma/adapter-pg",
    "better-auth",
    "better-auth/kysely-adapter",
  ],
};

export default nextConfig;
