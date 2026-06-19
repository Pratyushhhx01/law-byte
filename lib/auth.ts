import { betterAuth } from "better-auth";
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

export const auth = betterAuth({
  database: kyselyAdapter(db),
  plugins: [nextCookies()],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://lawbite-alb-1096330116.ap-south-1.elb.amazonaws.com",
  ],
});
