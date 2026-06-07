"use client";

import { useEffect, useState } from "react";

const links = [
  { label: "Product", href: "#product" },
  { label: "Solutions", href: "#solutions" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        className={`relative flex w-full max-w-6xl items-center justify-between gap-6 rounded-full border px-4 py-2.5 sm:px-6 transition-all duration-500 ${
          scrolled
            ? "border-white/15 bg-black/70 backdrop-blur-xl"
            : "border-white/10 bg-black/40 backdrop-blur-md"
        }`}
      >
        <a
          href="#"
          className="group flex items-center gap-2.5 text-sm font-semibold tracking-tight"
        >
          <span
            className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white text-black transition-transform duration-500 group-hover:rotate-90"
            aria-hidden
          >
            <span className="absolute inset-1 rounded-full border border-black/30" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-black" />
          </span>
          <span className="text-white">Lawbite</span>
        </a>

        <ul className="hidden items-center gap-1 text-sm text-white/70 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative inline-block rounded-full px-3.5 py-1.5 transition-colors duration-300 hover:text-white"
              >
                <span className="relative z-10">{link.label}</span>
                <span className="absolute inset-0 -z-0 scale-90 rounded-full bg-white/0 transition-all duration-300 group-hover:bg-white/10" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#login"
            className="rounded-full px-4 py-1.5 text-sm text-white/70 transition-colors hover:text-white"
          >
            Log in
          </a>
          <a
            href="#cta"
            className="btn-shine group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.03]"
          >
            Get started
            <span
              aria-hidden
              className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:text-white md:hidden"
        >
          <span className="relative block h-3.5 w-4">
            <span
              className={`absolute left-0 top-0 block h-0.5 w-4 bg-current transition-transform duration-300 ${
                open ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-4 bg-current transition-opacity duration-300 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 top-3 block h-0.5 w-4 bg-current transition-transform duration-300 ${
                open ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </nav>

      <div
        className={`absolute left-4 right-4 top-full mt-2 origin-top overflow-hidden rounded-2xl border border-white/10 bg-black/85 backdrop-blur-xl transition-all duration-500 md:hidden ${
          open
            ? "scale-y-100 opacity-100"
            : "pointer-events-none scale-y-90 opacity-0"
        }`}
      >
        <ul className="flex flex-col p-3 text-sm">
          {links.map((link, i) => (
            <li
              key={link.href}
              style={{ transitionDelay: `${i * 40}ms` }}
              className={`transform transition-all duration-500 ${
                open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <a
                onClick={() => setOpen(false)}
                href={link.href}
                className="block rounded-xl px-3 py-2.5 text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li
            style={{ transitionDelay: `${links.length * 40}ms` }}
            className={`mt-2 transform transition-all duration-500 ${
              open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <a
              onClick={() => setOpen(false)}
              href="#cta"
              className="block rounded-xl bg-white px-3 py-2.5 text-center font-medium text-black"
            >
              Get started
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
