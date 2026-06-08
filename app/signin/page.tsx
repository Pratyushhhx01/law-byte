"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.78-.07-1.53-.2-2.27H12v4.51h6.47c-.28 1.4-1.07 2.59-2.27 3.4v2.81h3.66c2.16-1.99 3.43-4.91 3.43-8.45Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.92l-3.66-2.81c-1.01.69-2.32 1.1-4.27 1.1-3.27 0-6.05-2.21-7.04-5.18H1.18v3.25C3.13 21.43 7.27 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M4.96 14.19c-.25-.69-.39-1.43-.39-2.19s.14-1.5.38-2.19V6.56H1.18A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.28 5.44l3.68-3.25Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.84 0 3.49.63 4.79 1.87l3.25-3.25C17.95 1.19 15.24 0 12 0 7.27 0 3.13 2.57 1.18 6.56l3.78 3.25C5.95 6.98 8.73 4.77 12 4.77Z"
      />
    </svg>
  );
}

export default function SignInPage() {
  const [loading, setLoading] = useState<"google" | null>(null);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setLoading("google");
    setError("");
    try {
      await signIn.social(
        {
          provider: "google",
          callbackURL: "/chat",
        },
        {
          onSuccess: () => {
            setLoading(null);
          },
          onError: (ctx) => {
            setError(ctx.error.message);
            setLoading(null);
          },
        },
      );
    } catch {
      setLoading(null);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black px-6 py-24 text-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            aria-label="Lawbite home"
            className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight"
          >
            <span
              aria-hidden
              className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white text-black"
            >
              <span className="absolute inset-1 rounded-full border border-black/30" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-black" />
            </span>
            <span>Lawbite</span>
          </Link>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl">
            Sign in to Lawbite
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Use your Google account to continue.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-10">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading !== null}
            className="group flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.01] hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60"
          >
            <GoogleIcon className="h-5 w-5" />
            <span>
              {loading === "google" ? "Connecting…" : "Continue with Google"}
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
