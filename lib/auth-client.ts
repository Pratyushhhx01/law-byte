"use client";

import { createAuthClient } from "better-auth/react";

export const { signIn, signOut, useSession } = createAuthClient({
  baseURL: "http://lawbite-alb-1096330116.ap-south-1.elb.amazonaws.com",
});
