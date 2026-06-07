"use client";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#product" },
      { label: "Solutions", href: "#solutions" },
      { label: "Process", href: "#process" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "Cookies", href: "#" },
    ],
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
            <a href="#" className="inline-flex items-center gap-2.5 text-sm font-semibold">
              <span
                className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-white text-black"
                aria-hidden
              >
                <span className="absolute inset-1 rounded-full border border-black/30" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-black" />
              </span>
              <span>Lawbite</span>
            </a>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              A short placeholder description of the company, the product, or
              the mission. Keep it brief and human.
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
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-white/70 transition-colors duration-300 hover:text-white"
                      >
                        <span className="relative">
                          {link.label}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-500 group-hover:w-full" />
                        </span>
                      </a>
                    </li>
                  ))}
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
