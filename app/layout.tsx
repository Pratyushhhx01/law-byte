import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { validateEnv } from "@/lib/env";

validateEnv();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lawbite — Modern legal practice, redefined",
  description:
    "AI-powered legal assistant for Indian law. Get instant analysis, draft documents, and research across 157+ bare acts.",
  openGraph: {
    title: "Lawbite — Modern legal practice, redefined",
    description:
      "AI-powered legal assistant for Indian law. Get instant analysis, draft documents, and research across 157+ bare acts.",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawbite — Modern legal practice, redefined",
    description:
      "AI-powered legal assistant for Indian law. Get instant analysis, draft documents, and research across 157+ bare acts.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-screen flex flex-col bg-black text-white selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}
