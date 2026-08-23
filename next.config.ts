import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "kysely",
    "pg",
    "@neondatabase/serverless",
    "pdfjs-dist",
    "better-auth",
  ],
};

export default nextConfig;
