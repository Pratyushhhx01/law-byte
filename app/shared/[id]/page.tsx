"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Message = { role: string; content: string };

export default function SharedPage() {
  const params = useParams();
  const shareId = params?.id as string;
  const [data, setData] = useState<{ title: string; messages: Message[]; sharedBy: string; sharedAt: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shareId) return;
    fetch(`/api/share?id=${shareId}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("This share link has expired or is invalid."));
  }, [shareId]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white">Link Expired</h1>
          <p className="mt-2 text-sm text-white/50">{error}</p>
          <Link href="/" className="mt-4 inline-block text-sm text-blue-400 hover:underline">Go to LawBite</Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 border-b border-white/10 pb-6">
          <h1 className="text-2xl font-bold text-white">{data.title || "Shared Conversation"}</h1>
          <p className="mt-2 text-sm text-white/40">
            Shared by {data.sharedBy} on {new Date(data.sharedAt).toLocaleDateString("en-IN")}
          </p>
          <Link href="/" className="mt-3 inline-block text-sm text-blue-400 hover:underline">Try LawBite →</Link>
        </div>
        <div className="space-y-6">
          {data.messages.map((m, i) => (
            <div key={i} className={`rounded-2xl px-5 py-4 ${m.role === "user" ? "ml-12 bg-blue-600/20 text-white" : "mr-12 bg-white/5 text-white/90"}`}>
              <div className="mb-1 text-xs font-medium text-white/30">{m.role === "user" ? "You" : "LawBite AI"}</div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{typeof m.content === "string" ? m.content : JSON.stringify(m.content)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
