import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents — Lawbite",
  description: "Legal documents and resources available through Lawbite.",
};

export default function DocumentsPage() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-6xl px-6">
        <article className="mx-auto max-w-3xl">
          <header className="border-b border-white/10 pb-10">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              / Documents
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Legal Documents
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65">
              Lawbite can help you draft, review, and understand a wide range of
              Indian legal documents.
            </p>
          </header>

          <div className="mt-10 space-y-10 text-[15px] leading-[1.75] text-white/75">
            <section>
              <h2 className="text-xl font-semibold text-white">
                Document Drafting
              </h2>
              <p className="mt-3">
                Use the Document Drafter mode to generate ready-to-use Indian
                legal documents. Fill in the required information through our
                structured forms, and Lawbite will produce a properly formatted
                draft.
              </p>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Legal Notices</li>
                <li>FIR Drafts</li>
                <li>Consumer Complaints</li>
                <li>RTI Applications</li>
                <li>Wills</li>
                <li>Affidavits</li>
                <li>Court Petitions / Plaints</li>
                <li>Contracts &amp; Agreements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                Document Review
              </h2>
              <p className="mt-3">
                Upload any legal document — rental agreement, employment
                contract, FIR, sale deed, or court notice — and Lawbite will
                provide a clause-by-clause risk analysis with plain-language
                explanations. Each clause is rated for risk and backed by
                relevant Indian law where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                Knowledge Base
              </h2>
              <p className="mt-3">
                Lawbite&apos;s knowledge base includes 157+ Indian bare acts at
                the section level, covering criminal law, civil procedure,
                constitutional law, family law, cyber law, corporate law, tax
                law, and more. Every response references the specific sections
                and provisions that apply to your query.
              </p>
            </section>
          </div>
        </article>
      </div>
    </section>
  );
}
