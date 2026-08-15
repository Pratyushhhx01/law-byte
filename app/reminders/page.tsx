import type { Metadata } from "next";
import RemindersApp from "./_components/RemindersApp";

export const metadata: Metadata = {
  title: "Deadline Reminder — Lawbite",
  description: "Track court dates, filing deadlines, and limitation periods.",
};

export default function RemindersPage() {
  return <RemindersApp />;
}
