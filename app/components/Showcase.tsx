import Reveal from "./Reveal";

export default function Showcase() {
  return (
    <section
      id="preview"
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
                See it in action.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              Ask a question, pick a mode, get an answer grounded in Indian
              law. Here&apos;s what it looks like.
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
                lawbite.app/chat
              </div>
              <div className="w-12" />
            </div>

            <div className="grid gap-4 pt-6 sm:grid-cols-12 sm:gap-6">
              <aside className="hidden flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.02] p-3 sm:col-span-3 sm:flex">
                {[
                  { label: "Talk to AI", active: true },
                  { label: "In-depth Analysis", active: false },
                  { label: "Grill Me", active: false },
                  { label: "Standard Chat", active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                      item.active
                        ? "bg-white/10 text-white"
                        : "text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white/80"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70"
                    />
                    {item.label}
                  </div>
                ))}
                <div className="mt-auto border-t border-white/10 pt-2">
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/40">
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 rounded-full bg-white/30"
                    />
                    My Cases
                  </div>
                </div>
              </aside>

              <div className="sm:col-span-9">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-white/10 px-4 py-3 text-sm text-white/90">
                      What are the bail provisions under BNSS for Section 302?
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white/75">
                      <p className="mb-2">
                        <span className="font-medium text-white/90">Section 480 BNSS</span> (equivalent to
                        Section 437 CrPC) governs bail in non-bailable offences:
                      </p>
                      <ol className="ml-4 list-decimal space-y-1.5 text-white/65">
                        <li>
                          Bail may be granted by a Magistrate if there are
                          reasonable grounds to believe the accused is not guilty
                        </li>
                        <li>
                          The offence must not be punishable with death or life
                          imprisonment
                        </li>
                        <li>
                          The Magistrate must consider the nature of the evidence,
                          severity of punishment, and flight risk
                        </li>
                      </ol>
                      <p className="mt-2 text-white/50">
                        For Section 302 BNS (murder), bail is extremely difficult
                        but not impossible — factors like age, health, and time
                        spent in custody matter.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-white/10 px-4 py-3 text-sm text-white/90">
                      Can anticipatory bail be filed under BNSS?
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white/75">
                      Yes. <span className="font-medium text-white/90">Section 482 BNSS</span> (equivalent to
                      Section 438 CrPC) provides for anticipatory bail. The
                      Sessions Court or High Court can grant bail if there is
                      reason to believe you may be arrested for a non-bailable
                      offence.
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                  <div className="flex-1 text-sm text-white/40">
                    Ask a follow-up question...
                  </div>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white/40">
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                      <path d="M2.5 2.5l15 7.5-15 7.5V12l10-2-10-2V2.5z" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
