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
                  { label: "Talk to AI", active: false },
                  { label: "In-depth Analysis", active: false },
                  { label: "My Cases", active: false },
                  { label: "Document Drafter", active: true },
                  { label: "Document Review", active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                      item.active
                        ? "bg-blue-400/15 text-blue-300"
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
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-blue-400/20 bg-blue-400/[0.04] px-4 py-3 text-sm leading-relaxed text-white/80">
                      <p className="mb-2 font-medium text-blue-300">Document Drafter</p>
                      <p className="text-white/60">Select a document type to start drafting:</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {["Legal Notice", "FIR Draft", "Consumer Complaint", "RTI Application", "Will", "Affidavit", "Petition", "Contract"].map((doc) => (
                      <div key={doc} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/60 transition-colors hover:border-blue-400/30 hover:bg-blue-400/[0.04] hover:text-blue-300">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-blue-400/60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        {doc}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-white/10 px-4 py-3 text-sm text-white/90">
                      Draft a legal notice for a property dispute
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-white/75">
                      <p className="mb-2">
                        <span className="font-medium text-white/90">Legal Notice</span> — drafted successfully
                      </p>
                      <p className="text-white/60">
                        I have drafted a legal notice for your property dispute. You can review the full document below and consult a practicing lawyer before sending.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/30 transition-colors hover:text-white/50">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </span>
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
