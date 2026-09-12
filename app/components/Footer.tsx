"use client";

import { useState } from "react";
import Link from "next/link";
import { legalPages } from "../legal/_data";
import LogoIcon from "./LogoIcon";

interface ResourceCategory {
  title: string;
  icon: string;
  items: { label: string; href: string; description: string }[];
}

const resourceCategories: ResourceCategory[] = [
  {
    title: "Documents",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    items: [
      {
        label: "Legal Documents",
        href: "/documents",
        description: "Browse all legal document types",
      },
      {
        label: "Contract Templates",
        href: "/templates",
        description: "Ready-to-use contract drafts",
      },
      {
        label: "Legal Drafts",
        href: "/templates#drafts",
        description: "Court filings and notices",
      },
    ],
  },
  {
    title: "Guides",
    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    items: [
      {
        label: "Legal Guides",
        href: "/guides",
        description: "Step-by-step legal processes",
      },
      {
        label: "Filing Help",
        href: "/filing",
        description: "How to file complaints & RTI",
      },
      {
        label: "Know Your Rights",
        href: "/guides#rights",
        description: "Understanding Indian laws",
      },
    ],
  },
  {
    title: "Templates",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
    items: [
      {
        label: "Rental Agreement",
        href: "/templates#rental",
        description: "11-month rental contracts",
      },
      {
        label: "Employment Contract",
        href: "/templates#employment",
        description: "Job offer letters & agreements",
      },
      {
        label: "NDA",
        href: "/templates#nda",
        description: "Non-disclosure agreements",
      },
    ],
  },
  {
    title: "Filing Help",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    items: [
      {
        label: "RTI Application",
        href: "/filing#rti",
        description: "File RTI requests online",
      },
      {
        label: "Consumer Complaint",
        href: "/filing#consumer",
        description: "Consumer forum complaints",
      },
      {
        label: "FIR Draft",
        href: "/filing#fir",
        description: "Police complaint drafts",
      },
    ],
  },
  {
    title: "Tools",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    items: [
      {
        label: "Legal News",
        href: "/news",
        description: "Latest legal updates",
      },
      {
        label: "Case Tracker",
        href: "/cases",
        description: "Track your cases",
      },
      {
        label: "Calculators",
        href: "/calculators",
        description: "Stamp duty & limitation",
      },
    ],
  },
];

const otherColumns: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
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
];

export default function Footer() {
  const [activeResource, setActiveResource] = useState<ResourceCategory | null>(
    null,
  );

  return (
    <footer id="contact" className="relative border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-sm font-semibold"
            >
              <LogoIcon className="h-7 w-7" />
              <span>Lawbite</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              AI-powered Indian legal assistant. Get instant answers from 157+
              bare acts, structured analysis, and real-time web search.
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
            {otherColumns.map((col) => (
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

            <div className="relative">
              <h4 className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">
                Resources
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                {resourceCategories.map((cat) => (
                  <li key={cat.title}>
                    <button
                      onClick={() =>
                        setActiveResource(
                          activeResource?.title === cat.title ? null : cat,
                        )
                      }
                      className={`group inline-flex items-center gap-1.5 transition-colors duration-300 ${
                        activeResource?.title === cat.title
                          ? "text-white"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d={cat.icon} />
                      </svg>
                      <span className="relative">
                        {cat.title}
                        <span
                          className={`absolute -bottom-0.5 left-0 h-px bg-white transition-all duration-500 ${
                            activeResource?.title === cat.title
                              ? "w-full"
                              : "w-0 group-hover:w-full"
                          }`}
                        />
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-3 w-3 transition-transform duration-300 ${
                          activeResource?.title === cat.title ? "rotate-90" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>

              {/* Sidebar Panel */}
              <div
                className={`absolute left-full top-0 ml-4 w-64 transition-all duration-300 ${
                  activeResource
                    ? "translate-x-0 opacity-100"
                    : "translate-x-2 opacity-0 pointer-events-none"
                }`}
              >
                <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h5 className="text-sm font-medium text-white">
                      {activeResource?.title}
                    </h5>
                    <button
                      onClick={() => setActiveResource(null)}
                      className="rounded p-1 text-white/40 hover:text-white"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-1">
                    {activeResource?.items.map((item) => {
                      const isInternal = item.href.startsWith("/");
                      return isInternal ? (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block rounded-lg p-2.5 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <span className="block text-sm">{item.label}</span>
                          <span className="mt-0.5 block text-xs text-white/40">
                            {item.description}
                          </span>
                        </Link>
                      ) : (
                        <a
                          key={item.label}
                          href={item.href}
                          className="block rounded-lg p-2.5 text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <span className="block text-sm">{item.label}</span>
                          <span className="mt-0.5 block text-xs text-white/40">
                            {item.description}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium uppercase tracking-[0.25em] text-white/40">
                Legal
              </h4>
              <ul className="mt-5 space-y-3 text-sm">
                {legalPages.map((page) => (
                  <li key={page.slug}>
                    <Link
                      href={page.href}
                      className="group inline-flex items-center gap-1.5 text-white/70 transition-colors duration-300 hover:text-white"
                    >
                      <span className="relative">
                        {page.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-500 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
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
