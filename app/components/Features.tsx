import Reveal from "./Reveal";

type Feature = {
  title: string;
  description: string;
  tag: string;
};

const features: Feature[] = [
  {
    tag: "01",
    title: "Built for clarity",
    description:
      "Placeholder copy describing a feature of the product. Calm, focused, and fast.",
  },
  {
    tag: "02",
    title: "Motion with intent",
    description:
      "Every animation guides attention, never distracts. Designed to feel weightless.",
  },
  {
    tag: "03",
    title: "Engineered scale",
    description:
      "Placeholder copy describing scalability, performance, or reliability of the platform.",
  },
  {
    tag: "04",
    title: "Secure by default",
    description:
      "Placeholder copy describing the security posture, compliance, and data protection.",
  },
  {
    tag: "05",
    title: "Designed in monochrome",
    description:
      "A black and white system that lets the content breathe and stand on its own.",
  },
  {
    tag: "06",
    title: "Effortless integrations",
    description:
      "Placeholder copy describing how the product connects with the rest of the stack.",
  },
];

function FeatureIcon({ index }: { index: number }) {
  const shapes = [
    <svg
      key="circle"
      viewBox="0 0 32 32"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <circle cx="16" cy="16" r="11" />
      <circle cx="16" cy="16" r="4" />
    </svg>,
    <svg
      key="square"
      viewBox="0 0 32 32"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <rect x="6" y="6" width="20" height="20" rx="2" />
      <path d="M6 16h20M16 6v20" />
    </svg>,
    <svg
      key="tri"
      viewBox="0 0 32 32"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M16 5l11 22H5z" />
      <path d="M16 14v8" />
    </svg>,
    <svg
      key="diamond"
      viewBox="0 0 32 32"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M16 3l13 13-13 13L3 16z" />
      <path d="M9 16h14M16 9v14" />
    </svg>,
    <svg
      key="hex"
      viewBox="0 0 32 32"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M16 3l11 6.5v13L16 29 5 22.5v-13z" />
      <circle cx="16" cy="16" r="3" />
    </svg>,
    <svg
      key="lines"
      viewBox="0 0 32 32"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <path d="M5 9h22M5 16h22M5 23h22" />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
      <circle cx="23" cy="16" r="1.5" fill="currentColor" />
      <circle cx="13" cy="23" r="1.5" fill="currentColor" />
    </svg>,
  ];
  return shapes[index % shapes.length];
}

export default function Features() {
  return (
    <section
      id="solutions"
      className="relative isolate border-t border-white/10 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-end gap-10 md:grid-cols-2">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
              / Solutions
            </p>
            <h2 className="mt-5 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              Everything you need, nothing you don&apos;t.
            </h2>
          </Reveal>
          <Reveal delay={1}>
            <p className="max-w-md text-base leading-relaxed text-white/60">
              A short, scannable intro goes here. Two or three sentences is
              the right size for this kind of supporting copy on a marketing
              page.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={((i % 3) + 1) as 1 | 2 | 3}
              className="h-full"
            >
              <article className="group relative h-full overflow-hidden bg-black p-7 transition-all duration-500 hover:bg-[#0a0a0a] sm:p-8">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/0 blur-2xl transition-all duration-700 group-hover:bg-white/[0.06]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-white/0 via-white/60 to-white/0 transition-transform duration-700 group-hover:scale-x-100"
                />
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white transition-all duration-500 group-hover:rotate-[8deg] group-hover:border-white/30 group-hover:bg-white/[0.07]">
                    <FeatureIcon index={i} />
                  </div>
                  <span className="text-xs font-mono tracking-widest text-white/30">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-medium text-white sm:text-xl">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {feature.description}
                </p>
                <div className="mt-8 inline-flex items-center gap-1.5 text-xs font-medium text-white/0 transition-colors duration-500 group-hover:text-white/80">
                  Learn more
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-500 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
