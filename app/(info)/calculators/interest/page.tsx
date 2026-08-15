"use client";

import { useState } from "react";

export default function InterestCalculator() {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [timeMonths, setTimeMonths] = useState("");
  const [compound, setCompound] = useState(false);
  const [frequency, setFrequency] = useState<"yearly" | "half-yearly" | "quarterly" | "monthly">("yearly");

  const P = parseFloat(principal) || 0;
  const R = parseFloat(rate) || 0;
  const T = (parseFloat(timeMonths) || 0) / 12;

  let simpleInterest = 0;
  let compoundInterest = 0;
  let totalSimple = 0;
  let totalCompound = 0;

  if (P > 0 && R > 0 && T > 0) {
    simpleInterest = (P * R * T) / 100;
    totalSimple = P + simpleInterest;

    const n = frequency === "yearly" ? 1 : frequency === "half-yearly" ? 2 : frequency === "quarterly" ? 4 : 12;
    compoundInterest = P * Math.pow(1 + R / (100 * n), n * T) - P;
    totalCompound = P + compoundInterest;
  }

  function formatCurrency(amount: number): string {
    return amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }

  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-6xl px-6">
        <article className="mx-auto max-w-3xl">
          <header className="border-b border-white/10 pb-10">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              / Calculators / Interest
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Interest Calculator
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65">
              Calculate simple or compound interest on any principal amount.
              Useful for debt recovery, damages, and award calculations under
              Indian law.
            </p>
          </header>

          <div className="mt-10 space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="principal" className="block text-sm font-medium text-white/70">
                  Principal Amount (₹)
                </label>
                <input
                  id="principal"
                  type="number"
                  min="0"
                  placeholder="e.g. 500000"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="rate" className="block text-sm font-medium text-white/70">
                  Annual Interest Rate (%)
                </label>
                <input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 12"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="time-months" className="block text-sm font-medium text-white/70">
                  Time Period (Months)
                </label>
                <input
                  id="time-months"
                  type="number"
                  min="0"
                  placeholder="e.g. 36"
                  value={timeMonths}
                  onChange={(e) => setTimeMonths(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCompound(false)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    !compound
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[0.02] text-white/60 hover:text-white"
                  }`}
                >
                  Simple Interest
                </button>
                <button
                  type="button"
                  onClick={() => setCompound(true)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    compound
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[0.02] text-white/60 hover:text-white"
                  }`}
                >
                  Compound Interest
                </button>
              </div>

              {compound && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">
                    Compounding Frequency
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["yearly", "half-yearly", "quarterly", "monthly"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFrequency(f)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                          frequency === f
                            ? "bg-white text-black"
                            : "border border-white/10 bg-white/[0.02] text-white/60 hover:text-white"
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {P > 0 && R > 0 && T > 0 && (
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                  {compound ? "Compound Interest" : "Simple Interest"}
                </p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  ₹{formatCurrency(compound ? compoundInterest : simpleInterest)}
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Total: ₹{formatCurrency(compound ? totalCompound : totalSimple)}
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white/50">
                    <span>Principal</span>
                    <span className="font-medium text-white/70">₹{formatCurrency(P)}</span>
                  </div>
                  <div className="flex justify-between text-white/50">
                    <span>Interest</span>
                    <span className="font-medium text-white/70">₹{formatCurrency(compound ? compoundInterest : simpleInterest)}</span>
                  </div>
                  <div className="border-t border-white/[0.06] pt-2 flex justify-between text-white/70">
                    <span className="font-medium">Total</span>
                    <span className="font-semibold text-white">₹{formatCurrency(compound ? totalCompound : totalSimple)}</span>
                  </div>
                </div>

                {compound && (
                  <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.03] p-3 text-xs text-white/40">
                    Compounding: {frequency} | Period: {T.toFixed(2)} years | Rate: {R}% p.a.
                  </div>
                )}
              </div>
            )}

            <p className="text-xs leading-relaxed text-white/35">
              Disclaimer: This calculator provides informational estimates only.
              Actual interest rates may be governed by specific contracts,
              statutes, or court orders. The Reserve Bank of India and various
              state laws may prescribe different interest rates for different
              categories of transactions. Always verify with a qualified legal
              professional.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
