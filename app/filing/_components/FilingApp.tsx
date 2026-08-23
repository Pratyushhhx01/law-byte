"use client";

import { useState } from "react";
import { exportAsWord, exportAsPdf } from "@/lib/export";

interface FilingGuide {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedTime: string;
  requirements: string[];
  steps: { title: string; detail: string; tip?: string }[];
  generateDocument: (data: Record<string, string>) => string;
  docFields: { label: string; placeholder?: string; required?: boolean }[];
}

const filingGuides: FilingGuide[] = [
  {
    id: "rti",
    name: "RTI Application",
    description: "File a Right to Information application under the RTI Act, 2005 to any public authority.",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    estimatedTime: "10-15 minutes",
    requirements: ["Proof of identity (Aadhaar, PAN, etc.)", "Address proof", "Prescribed fee (Rs. 10 for Indian citizens)"],
    steps: [
      { title: "Identify the Public Authority", detail: "Determine which government department or public authority holds the information you need. You can file RTI to any central or state government body.", tip: "Check the official website of the department for the correct CPIO (Central Public Information Officer) details." },
      { title: "Draft the Application", detail: "Write a clear application addressed to the CPIO. Mention the specific information you seek. Be precise and avoid vague requests.", tip: "Use the template provided below to draft your application." },
      { title: "Pay the Fee", detail: "Pay Rs. 10 (for Indian citizens) via demand draft, Indian postal order, or online payment as prescribed by the authority.", tip: "BPL card holders are exempt from fees. SC/ST applicants get fee waiver." },
      { title: "Submit the Application", detail: "Submit the application physically, by post, or online (if the authority has an online portal). Keep a copy for your records.", tip: "File online at rtionline.gov.in for central government bodies." },
      { title: "Receive Response", detail: "The CPIO must respond within 30 days. If no response, file a first appeal to the designated appellate authority within 30 days of the deadline.", tip: "If the appellate authority also fails, file a second appeal to the Information Commission." },
    ],
    docFields: [
      { label: "Applicant Name", required: true },
      { label: "Applicant Address", required: true },
      { label: "Applicant ID Proof", placeholder: "Aadhaar / PAN number" },
      { label: "Public Authority Name", required: true },
      { label: "CPIO Name", placeholder: "If known" },
      { label: "Information Sought", required: true },
    ],
    generateDocument: (d) => `RTI APPLICATION

Date: ${new Date().toLocaleDateString("en-IN")}

To,
The Central Public Information Officer (CPIO),
${d["Public Authority Name"] || "[Public Authority Name]"},
${d["CPIO Name"] ? `CPIO: ${d["CPIO Name"]}` : "[Address]"}

Subject: Request for information under Section 6 of the Right to Information Act, 2005

Sir/Madam,

I, ${d["Applicant Name"] || "[Name]"}, son/daughter of [Father's Name], a citizen of India, residing at ${d["Applicant Address"] || "[Address]"}, ${d["Applicant ID Proof"] ? `holding ${d["Applicant ID Proof"]}` : ""}, hereby request the following information under Section 6 of the Right to Information Act, 2005:

INFORMATION SOUGHT:
${d["Information Sought"] || "[Describe the specific information you are seeking]"}

The information may be provided to me at the above address or via email at [email address].

I am ready to pay the prescribed fee of Rs. 10 for providing the information as per the RTI Rules, 2012.

If the information sought is exempted under Sections 8 or 9 of the Act, kindly inform me of the same along with the grounds of exemption and the appellate authority details.

Thanking you,

${d["Applicant Name"] || "[Name]"}
Date: ${new Date().toLocaleDateString("en-IN")}
Place: [City]

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. Consult a practicing lawyer before filing.]`,
  },
  {
    id: "consumer-complaint",
    name: "Consumer Complaint",
    description: "File a complaint in the Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.",
    icon: "M3 3h18v18H3V3zm4 7h8M7 11h8M7 15h5",
    estimatedTime: "20-25 minutes",
    requirements: ["Proof of purchase (bill, invoice, receipt)", "Defect/grievance evidence (photos, communications)", "Identity proof", "Court fee (based on claim value)"],
    steps: [
      { title: "Determine Jurisdiction", detail: "File at the appropriate level: District (claims up to Rs. 1 crore), State (Rs. 1-10 crore), or National (above Rs. 10 crore) Commission.", tip: "The complaint can be filed where you reside or where the opposite party's office is located." },
      { title: "Gather Evidence", detail: "Collect all bills, invoices, warranties, communication records, photos, and any evidence of the deficiency in service or defect in goods.", tip: "Keep original documents safe and attach copies with the complaint." },
      { title: "Draft the Complaint", detail: "Draft the complaint with clear facts, deficiency details, and the relief sought. Use the template provided.", tip: "Be specific about dates, amounts, and the deficiency you experienced." },
      { title: "Pay Court Fee", detail: "Pay the prescribed court fee based on the value of the claim. For District Commission: Rs. 100-200 for claims up to Rs. 5 lakh.", tip: "Fee scales are available on the consumer commission website." },
      { title: "File the Complaint", detail: "File the complaint with supporting documents at the appropriate consumer commission. You can also file online at edaakhil.nic.in.", tip: "File within 2 years of the cause of action." },
      { title: "Attend hearings", detail: "Attend all hearings. The commission may direct mediation or proceed with evidence. The complaint should be disposed of within 3-5 months.", tip: "You can engage a lawyer or appear in person." },
    ],
    docFields: [
      { label: "Complainant Name", required: true },
      { label: "Complainant Address", required: true },
      { label: "Opposite Party Name", required: true },
      { label: "Opposite Party Address", required: true },
      { label: "Product/Service", required: true },
      { label: "Purchase Date", required: true },
      { label: "Amount Paid", required: true },
      { label: "Deficiency Details", required: true },
      { label: "Relief Sought", required: true },
    ],
    generateDocument: (d) => `CONSUMER COMPLAINT

Date: ${new Date().toLocaleDateString("en-IN")}

To,
The District Consumer Disputes Redressal Commission,
[District/City]

Complaint No.: __________

In the matter of:
${d["Complainant Name"] || "[Complainant]"} — Complainant
Vs.
${d["Opposite Party Name"] || "[Opposite Party]"} — Opposite Party

Subject: Complaint regarding deficiency in service concerning ${d["Product/Service"] || "[Product/Service]"} under the Consumer Protection Act, 2019

Sir/Madam,

1. The complainant is ${d["Complainant Name"] || "[Name]"}, residing at ${d["Complainant Address"] || "[Address]"}.

2. The opposite party is ${d["Opposite Party Name"] || "[Name]"}, having its office at ${d["Opposite Party Address"] || "[Address]"}.

3. The complainant purchased/availed ${d["Product/Service"] || "[Product/Service]"} from the opposite party on ${d["Purchase Date"] || "[Date]"} for a consideration of Rs. ${d["Amount Paid"] || "[Amount]"}.

4. The deficiency in service/defect in goods is as follows: ${d["Deficiency Details"] || "[Describe the deficiency]"}

5. Despite repeated requests, the opposite party has failed to address the grievance, which amounts to deficiency in service and unfair trade practice under the Consumer Protection Act, 2019.

The complainant prays for the following reliefs:
(a) ${d["Relief Sought"] || "[Primary relief]"}
(b) Compensation for mental agony and harassment
(c) Cost of litigation
(d) Any other order deemed fit

Yours faithfully,
${d["Complainant Name"] || "[Name]"}

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. Consult a practicing lawyer before filing.]`,
  },
  {
    id: "fir-draft",
    name: "FIR Draft",
    description: "Draft a First Information Report (FIR) to lodge a police complaint for a cognizable offence.",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
    estimatedTime: "15-20 minutes",
    requirements: ["Details of the incident (date, time, place)", "Description of the accused (if known)", "List of witnesses", "Evidence available (if any)"],
    steps: [
      { title: "Identify the Police Station", detail: "FIR must be filed at the police station under whose jurisdiction the offence occurred. You can also file at any police station under Zero FIR provision.", tip: "Under BNSS 2023, Zero FIR can be filed at any police station regardless of jurisdiction." },
      { title: "Draft the FIR", detail: "Write the facts of the incident clearly: what happened, when, where, who was involved, and which offence was committed.", tip: "Stick to facts. Do not embellish or guess. State what you saw, heard, or know." },
      { title: "Submit to SHO", detail: "Submit the draft to the Station House Officer (SHO). The SHO is duty-bound to register the FIR for cognizable offences under BNSS 2023.", tip: "If the SHO refuses to register, you can approach the Superintendent of Police or file a complaint online." },
      { title: "Get the FIR Copy", detail: "The FIR must be registered and a copy provided to you free of charge. The FIR number should be recorded.", tip: "Under BNSS 2023, e-FIR provisions allow filing online for certain offences." },
      { title: "Follow Up", detail: "The police will investigate and file a chargesheet within 90 days (for offences punishable with 10+ years) or 60 days (for other offences) as per BNSS 2023.", tip: "You can file an application under Section 175(3) BNSS if the investigation is not completed in time." },
    ],
    docFields: [
      { label: "Complainant Name", required: true },
      { label: "Complainant Address", required: true },
      { label: "Police Station", required: true },
      { label: "Incident Date", required: true },
      { label: "Incident Time" },
      { label: "Incident Place", required: true },
      { label: "Accused Name", placeholder: "If known" },
      { label: "Incident Details", required: true },
      { label: "Evidence Available", placeholder: "FIR copy, medical reports, etc." },
    ],
    generateDocument: (d) => `FIRST INFORMATION REPORT (FIR) DRAFT

Date: ${new Date().toLocaleDateString("en-IN")}

To,
The Station House Officer (SHO),
${d["Police Station"] || "[Police Station Name]"},
[District/City]

Subject: Information regarding commission of offence under the Bharatiya Nyaya Sanhita, 2023

Sir/Madam,

1. I, ${d["Complainant Name"] || "[Name]"}, son/daughter of [Father's Name], residing at ${d["Complainant Address"] || "[Address]"}, wish to lodge this complaint regarding a cognizable offence that took place on ${d["Incident Date"] || "[Date]"} ${d["Incident Time"] ? `at approximately ${d["Incident Time"]}` : ""} at ${d["Incident Place"] || "[Place]"}.

2. The details of the incident are as follows:
${d["Incident Details"] || "[Provide a detailed account of what happened]"}

3. The accused person(s) involved is/are: ${d["Accused Name"] || "[Description of accused person(s), if known]"}

4. The following evidence is available: ${d["Evidence Available"] || "[List any evidence available]"}

5. I request you to take appropriate legal action against the accused, register an FIR under the relevant provisions of the Bharatiya Nyaya Sanhita, 2023, and investigate the matter as per law.

6. I attest that the above information is true and correct to the best of my knowledge and belief. I understand that providing false information may lead to prosecution under law.

Yours faithfully,
${d["Complainant Name"] || "[Name]"}
Contact: [Phone Number]

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. Consult a practicing lawyer before filing.]`,
  },
  {
    id: "legal-notice",
    name: "Legal Notice",
    description: "Send a formal legal notice before initiating legal proceedings.",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    estimatedTime: "15-20 minutes",
    requirements: ["Details of the sender and recipient", "Facts of the dispute", "Relief/demand to be made"],
    steps: [
      { title: "Identify the Grounds", detail: "Clearly identify the legal grounds for sending the notice. What is the grievance? What law or right has been violated?", tip: "Consult the relevant bare act to identify specific sections." },
      { title: "Draft the Notice", detail: "Draft the legal notice with clear facts, legal grounds, and the relief/demand. Use the template provided.", tip: "Keep the tone formal and professional. Avoid emotional or threatening language." },
      { title: "Send via Registered Post", detail: "Send the notice via Speed Post with acknowledgement due (AD card). This provides proof of delivery.", tip: "Keep the postal receipt and AD card safe as evidence." },
      { title: "Wait for Response", detail: "Give a reasonable time (typically 15-30 days) for the recipient to respond or comply with the demand.", tip: "The notice period depends on the nature of the dispute." },
      { title: "Initiate Legal Proceedings", detail: "If the recipient does not respond or comply, you may initiate legal proceedings in the appropriate court.", tip: "The legal notice is a prerequisite for many civil suits." },
    ],
    docFields: [
      { label: "Sender Name", required: true },
      { label: "Sender Address", required: true },
      { label: "Recipient Name", required: true },
      { label: "Recipient Address", required: true },
      { label: "Subject", required: true },
      { label: "Facts of the Case", required: true },
      { label: "Legal Grounds", required: true },
      { label: "Demand/Relief", required: true },
      { label: "Deadline (Days)", placeholder: "e.g. 15" },
    ],
    generateDocument: (d) => `LEGAL NOTICE

Date: ${new Date().toLocaleDateString("en-IN")}

From:
${d["Sender Name"] || "[Sender Name]"}
${d["Sender Address"] || "[Sender Address]"}

To:
${d["Recipient Name"] || "[Recipient Name]"}
${d["Recipient Address"] || "[Recipient Address]"}

Subject: ${d["Subject"] || "[Subject]"}

Sir/Madam,

1. I, ${d["Sender Name"] || "[Sender Name]"}, hereby issue this legal notice to you, ${d["Recipient Name"] || "[Recipient Name]"}, regarding the matter of ${d["Subject"] || "[Subject]"}.

2. The facts giving rise to this notice are as follows:
${d["Facts of the Case"] || "[State the facts clearly]"}

3. The legal grounds for this notice are:
${d["Legal Grounds"] || "[State the legal provisions/grounds]"}

4. Despite repeated requests and demands made by me, you have failed to take the necessary action in the matter.

5. Through this notice, I call upon you to ${d["Demand/Relief"] || "[State your demand/relief]"} within ${d["Deadline (Days)"] || "15"} days from the receipt of this notice.

6. If you fail to comply within the aforesaid period, I shall be constrained to initiate appropriate legal proceedings against you at your own cost, risk, and responsibility, including but not limited to legal expenses and incidental charges.

Yours faithfully,
${d["Sender Name"] || "[Sender Name]"}

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. Consult a practicing lawyer before sending.]`,
  },
];

export default function FilingApp() {
  const [selected, setSelected] = useState<FilingGuide | null>(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleSelect = (guide: FilingGuide) => {
    setSelected(guide);
    setStep(0);
    setFormData({});
  };

  const handleFieldChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const allRequiredFilled = selected?.docFields
    .filter((f) => f.required)
    .every((f) => formData[f.label]?.trim()) ?? false;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Filing Assistance</h1>
          <p className="mt-3 text-sm text-white/50">Step-by-step guidance for common legal filings in India.</p>
        </div>

        {!selected ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filingGuides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => handleSelect(guide)}
                className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                    <svg className="h-5 w-5 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={guide.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">{guide.name}</h3>
                    <span className="text-[11px] text-white/30">{guide.estimatedTime}</span>
                  </div>
                </div>
                <p className="text-sm text-white/40">{guide.description}</p>
                <div className="mt-4 text-xs text-white/25 group-hover:text-white/40">
                  {guide.steps.length} steps &middot; {guide.requirements.length} requirements
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setSelected(null)} className="mb-6 text-sm text-white/40 hover:text-white/60">
              &larr; Back to filing guides
            </button>

            <div className="mb-8">
              <h2 className="text-xl font-semibold">{selected.name}</h2>
              <p className="mt-2 text-sm text-white/50">{selected.description}</p>
              <p className="mt-1 text-xs text-white/30">Estimated time: {selected.estimatedTime}</p>
            </div>

            <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-3 text-sm font-semibold text-white/60">Requirements</h3>
              <ul className="space-y-2">
                {selected.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                    <span className="mt-0.5 text-emerald-400">&#10003;</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold text-white/60">Steps</h3>
              <div className="space-y-4">
                {selected.steps.map((s, i) => (
                  <div key={i} className={`rounded-xl border p-4 transition-colors ${i === step ? "border-white/20 bg-white/[0.05]" : "border-white/5 bg-white/[0.02]"}`}>
                    <button onClick={() => setStep(i)} className="flex w-full items-center gap-3 text-left">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === step ? "bg-white/20 text-white" : "bg-white/5 text-white/30"}`}>
                        {i + 1}
                      </div>
                      <span className={`text-sm font-medium ${i === step ? "text-white" : "text-white/50"}`}>{s.title}</span>
                    </button>
                    {i === step && (
                      <div className="mt-3 ml-10">
                        <p className="text-sm text-white/60">{s.detail}</p>
                        {s.tip && (
                          <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-400/80">
                            Tip: {s.tip}
                          </p>
                        )}
                        <div className="mt-3 flex gap-2">
                          {i > 0 && (
                            <button onClick={() => setStep(i - 1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 hover:text-white/60">
                              Previous
                            </button>
                          )}
                          {i < selected.steps.length - 1 ? (
                            <button onClick={() => setStep(i + 1)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20">
                              Next Step
                            </button>
                          ) : (
                            <button onClick={() => setStep(selected.steps.length)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20">
                              Fill &amp; Download
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {step >= selected.steps.length && (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="mb-4 text-sm font-semibold text-white/60">Fill in Your Details</h3>
                <div className="space-y-4">
                  {selected.docFields.map((field) => (
                    <div key={field.label}>
                      <label className="mb-1 block text-xs font-medium text-white/50">
                        {field.label} {field.required && <span className="text-red-400">*</span>}
                      </label>
                      <input
                        type="text"
                        value={formData[field.label] || ""}
                        onChange={(e) => handleFieldChange(field.label, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button
                    disabled={!allRequiredFilled}
                    onClick={() => {
                      const content = selected.generateDocument(formData);
                      exportAsWord(content, selected.name);
                    }}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 disabled:opacity-40"
                  >
                    Download as Word
                  </button>
                  <button
                    disabled={!allRequiredFilled}
                    onClick={() => {
                      const content = selected.generateDocument(formData);
                      exportAsPdf(content, selected.name);
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white/70 disabled:opacity-40"
                  >
                    Download as PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
