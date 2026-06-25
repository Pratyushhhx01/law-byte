import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides — Lawbite",
  description:
    "Learn how to use Lawbite effectively with these quick-start guides.",
};

export default function GuidesPage() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-6xl px-6">
        <article className="mx-auto max-w-3xl">
          <header className="border-b border-white/10 pb-10">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/40">
              / Guides
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              How to Use Lawbite
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65">
              Quick-start guides to help you get the most out of each feature.
            </p>
          </header>

          <div className="mt-10 space-y-10 text-[15px] leading-[1.75] text-white/75">
            <section>
              <h2 className="text-xl font-semibold text-white">
                Talk to AI
              </h2>
              <p className="mt-3">
                The fastest way to get answers. Simply type your legal question
                in plain language and receive a concise two-line response.
                Ideal for quick lookups, definitions, and straightforward
                questions about Indian law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                In-depth Analysis
              </h2>
              <p className="mt-3">
                Switch to Analysis mode for complex legal questions. You will
                receive a structured 10&ndash;12 point breakdown covering
                applicable laws, relevant sections, legal principles, and a
                concluding summary. Use this when you need more than a quick
                answer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                My Cases
              </h2>
              <p className="mt-3">
                A structured case intake session that asks one question at a
                time across 8 legal lenses — problem, location, role, details,
                sections, evidence, status, and desired outcome. Once enough
                information is gathered, Lawbite delivers comprehensive advice
                with actionable next steps.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                Document Drafter
              </h2>
              <p className="mt-3">
                Select a document type from the popup, fill in the required
                fields through the structured form, and receive a
                professionally formatted legal document. Available types
                include legal notices, FIR drafts, consumer complaints, RTI
                applications, wills, affidavits, petitions, and contracts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                Document Review
              </h2>
              <p className="mt-3">
                Upload a PDF or image of any legal document. Lawbite will
                analyse it clause by clause, assigning a risk rating to each
                section and providing plain-language explanations of what each
                clause means for you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                Tips for Best Results
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-6">
                <li>Be specific about the area of law your question relates to.</li>
                <li>Mention relevant states or cities when asking about location-specific laws.</li>
                <li>Use the attachment feature to upload documents for review or context.</li>
                <li>Pin important conversations to keep them organised in your sidebar.</li>
              </ul>
            </section>
          </div>
        </article>
      </div>
    </section>
  );
}
