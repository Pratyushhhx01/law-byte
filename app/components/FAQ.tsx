"use client";

import { useState } from "react";
import Reveal from "./Reveal";

type Item = { q: string; a: string };

const items: Item[] = [
  {
    q: "What does this product actually do?",
    a: "Placeholder answer. Describe the core capability in two or three sentences, focused on the outcome for the reader.",
  },
  {
    q: "How is it different from the alternatives?",
    a: "Placeholder answer. Highlight the meaningful difference in a way that is concrete and easy to verify.",
  },
  {
    q: "How long does setup take?",
    a: "Placeholder answer. Give a realistic, honest estimate of time-to-value and what is required from the user.",
  },
  {
    q: "Is my data secure?",
    a: "Placeholder answer. Briefly describe the security posture, compliance posture, and data handling practices.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Placeholder answer. Be direct and clear about commitments, billing, and how to leave if it isn't a fit.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative border-t border-white/10 py-28 sm:py-36">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            / FAQ
          </p>
          <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Quick answers.
          </h2>
        </Reveal>

        <Reveal delay={1} className="mt-12">
          <ul className="divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.015]">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors duration-300 hover:bg-white/[0.02] sm:px-8 sm:py-6"
                  >
                    <span className="flex items-center gap-5">
                      <span className="font-mono text-xs text-white/30">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-base font-medium text-white sm:text-lg">
                        {item.q}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-500 group-hover:border-white/30 ${
                        isOpen ? "rotate-45 border-white/40 text-white" : ""
                      }`}
                    >
                      <span className="absolute h-0.5 w-3 bg-current" />
                      <span className="absolute h-3 w-0.5 bg-current" />
                    </span>
                  </button>
                  <div
                    className="grid overflow-hidden px-6 transition-all duration-500 ease-out sm:px-8"
                    style={{
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <div className="min-h-0">
                      <p
                        className={`pb-6 pl-12 pr-12 text-sm leading-relaxed text-white/65 transition-transform duration-500 sm:pb-8 ${
                          isOpen ? "translate-y-0" : "-translate-y-1"
                        }`}
                      >
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
