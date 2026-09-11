import type { Metadata } from "next";
import FilingApp from "./_components/FilingApp";

export const metadata: Metadata = {
  title: "Filing Assistance — Lawbite",
  description:
    "Step-by-step guidance for filing RTI applications, consumer complaints, FIRs, and more.",
};

export default function FilingPage() {
  return <FilingApp />;
}
