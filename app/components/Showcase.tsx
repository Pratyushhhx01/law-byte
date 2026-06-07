import Reveal from "./Reveal";

export default function Showcase() {
  return (
    <section
      id="pricing"
      className="relative isolate overflow-hidden border-t border-white/10 py-28 sm:py-36"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
                / Preview
              </p>
              <h2 className="mt-5 max-w-2xl text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                A glimpse of the product.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              A calm, focused preview of the interface. Replace this with a
              real product mockup later.
            </p>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="relative mt-14 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(600px 200px at 50% 0%, rgba(255,255,255,0.08), transparent 70%)",
              }}
            />

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full border border-white/15 bg-white/[0.04]" />
                <span className="h-2.5 w-2.5 rounded-full border border-white/15 bg-white/[0.04]" />
                <span className="h-2.5 w-2.5 rounded-full border border-white/15 bg-white/[0.04]" />
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-white/40 sm:flex">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/50" />
                lawbite.app/preview
              </div>
              <div className="w-12" />
            </div>

            <div className="grid gap-4 pt-6 sm:grid-cols-12 sm:gap-6">
              <aside className="hidden flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:col-span-3 sm:flex">
                {["Overview", "Matters", "Clients", "Documents", "Billing", "Settings"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                        i === 1
                          ? "bg-white/10 text-white"
                          : "text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                    >
                      <span
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70"
                      />
                      {item}
                    </div>
                  ),
                )}
              </aside>

              <div className="sm:col-span-9">
                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                    { label: "Active matters", value: "24", width: 72 },
                    { label: "Open tasks", value: "07", width: 48 },
                    { label: "Drafts ready", value: "12", width: 84 },
                  ].map((c) => (
                    <div
                      key={c.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all duration-500 hover:border-white/25 hover:bg-white/[0.04]"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40">
                        {c.label}
                      </div>
                      <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
                        {c.value}
                      </div>
                      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-white/60"
                          style={{ width: `${c.width}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono uppercase tracking-[0.25em] text-white/40">
                      Recent activity
                    </div>
                    <div className="text-[10px] text-white/30">last 7 days</div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] px-3 py-2.5"
                      >
                        <span
                          aria-hidden
                          className="inline-block h-2 w-2 rounded-full bg-white/60"
                        />
                        <div className="flex-1">
                          <div
                            className="h-2 rounded-full bg-white/10"
                            style={{ width: `${55 + i * 8}%` }}
                          />
                          <div
                            className="mt-2 h-1.5 rounded-full bg-white/[0.06]"
                            style={{ width: `${30 + i * 6}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-white/30">
                          0{i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
