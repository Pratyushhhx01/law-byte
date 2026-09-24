import type { Metadata } from "next";
import ResourceLayout from "../../resources/_components/ResourceLayout";

export const metadata: Metadata = {
  title: "Documents — Lawbite",
  description: "Legal documents and resources available through Lawbite.",
};

export default function DocumentsPage() {
  return (
    <ResourceLayout
      title="Legal Documents"
      description="Lawbite can help you draft, review, and understand a wide range of Indian legal documents."
    >
      <section>
        <h2 className="text-xl font-semibold text-white">Document Drafting</h2>
        <p className="mt-3">
          Use the Document Drafter mode to generate ready-to-use Indian legal
          documents. Fill in the required information through our structured
          forms, and Lawbite will produce a properly formatted draft.
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
        <h2 className="text-xl font-semibold text-white">Document Review</h2>
        <p className="mt-3">
          Upload any legal document — rental agreement, employment contract,
          FIR, sale deed, or court notice — and Lawbite will provide a
          clause-by-clause risk analysis with plain-language explanations. Each
          clause is rated for risk and backed by relevant Indian law where
          applicable.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white">Knowledge Base</h2>
        <p className="mt-3">
          Lawbite&apos;s knowledge base includes 157+ Indian bare acts at the
          section level, covering criminal law, civil procedure, constitutional
          law, family law, cyber law, corporate law, tax law, and more. Every
          response references the specific sections and provisions that apply to
          your query.
        </p>
      </section>
    </ResourceLayout>
  );
}
