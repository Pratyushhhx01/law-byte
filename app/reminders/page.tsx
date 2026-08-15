import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import RemindersApp from "./_components/RemindersApp";

export const metadata: Metadata = {
  title: "Reminders — Lawbite",
  description: "Track court dates, filing deadlines, and limitation periods.",
  robots: { index: false, follow: false },
};

export default async function RemindersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return (
    <RemindersApp
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    />
  );
}
