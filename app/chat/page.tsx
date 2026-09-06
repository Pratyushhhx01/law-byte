import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ChatApp from "./_components/ChatApp";

export const metadata: Metadata = {
  title: "Chat — Lawbite",
  description: "Chat with the Lawbite assistant.",
  robots: { index: false, follow: false },
};

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ shareId?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  const { shareId } = await searchParams;

  return (
    <ChatApp
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
      shareId={shareId ?? null}
    />
  );
}
