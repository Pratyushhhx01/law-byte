import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "kysely",
    "pg",
    "pdfjs-dist",
    "better-auth",
  ],
};

export default nextConfig;
