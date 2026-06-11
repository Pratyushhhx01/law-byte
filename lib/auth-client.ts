"use client";

import { useState, useEffect } from "react";
import { createAuthClient } from "better-auth/react";

let signIn: ReturnType<typeof createAuthClient>["signIn"];
let signOut: ReturnType<typeof createAuthClient>["signOut"];

try {
  const authClient = createAuthClient();
  signIn = authClient.signIn;
  signOut = authClient.signOut;
} catch {
  signIn = (() => {}) as any;
  signOut = (() => Promise.resolve()) as any;
}

export { signIn, signOut };

export function useSession() {
  const [data, setData] = useState<{
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
    } | null;
  }>({ user: null });
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/get-session", { credentials: "include" })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setData({ user: json?.data?.user ?? null });
        setIsPending(false);
      })
      .catch(() => {
        if (cancelled) return;
        setData({ user: null });
        setIsPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isPending };
}
