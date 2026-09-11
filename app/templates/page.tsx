import type { Metadata } from "next";
import TemplatesApp from "./_components/TemplatesApp";

export const metadata: Metadata = {
  title: "Contract Templates — Lawbite",
  description:
    "Browse and fill in ready-to-use Indian legal contract templates.",
};

export default function TemplatesPage() {
  return <TemplatesApp />;
}
