"use client";

import Link from "next/link";
import { legalPages } from "../legal/_data";
import LogoIcon from "./LogoIcon";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#process" },
      { label: "Preview", href: "#preview" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documents", href: "/documents" },
      { label: "Guides", href: "/guides" },
    ],
  },
  {
    title: "Legal",
    links: legalPages.map((p) => ({ label: p.label, href: p.href })),
  },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative border-t border-white/10 bg-black"
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 text-sm font-semibold">
              <LogoIcon className="h-7 w-7" />
              <span>Lawbite</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              AI-powered Indian legal assistant. Get instant answers from
              40+ bare acts, structured analysis, and real-time web search.
            </p>
            <form
              className="mt-7 flex max-w-sm items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] p-1.5 pl-4 transition-colors duration-300 focus-within:border-white/30"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="you@company.com"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="btn-shine group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-white px-4 py-2 text-xs font-medium text-black transition-transform duration-300 hover:scale-[1.03]"
              >
                Subscribe
                <span
                  aria-hidden
                  className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">
                  {col.title}
                </h4>
                <ul className="mt-5 space-y-3 text-sm">
                  {col.links.map((link) => {
                    const isInternal = link.href.startsWith("/");
                    const anchorClass =
                      "group inline-flex items-center gap-1.5 text-white/70 transition-colors duration-300 hover:text-white";
                    const inner = (
                      <span className="relative">
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-500 group-hover:w-full" />
                      </span>
                    );
                    return (
                      <li key={link.label}>
                        {isInternal ? (
                          <Link href={link.href} className={anchorClass}>
                            {inner}
                          </Link>
                        ) : (
                          <a href={link.href} className={anchorClass}>
                            {inner}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Lawbite. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <a href="#" className="transition-colors hover:text-white">
              X
            </a>
            <a href="#" className="transition-colors hover:text-white">
              LinkedIn
            </a>
            <a href="#" className="transition-colors hover:text-white">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
