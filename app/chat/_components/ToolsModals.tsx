"use client";

import { useState } from "react";
import { exportAsWord, exportAsPdf } from "@/lib/export";

/* ─── Shared helpers ─── */

function formatDate(): string {
  return new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/* ─── Templates Modal ─── */

interface TemplateField {
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "date";
  required?: boolean;
}

interface Template {
  id: string;
  name: string;
  category: string;
  fields: TemplateField[];
  generate: (data: Record<string, string>) => string;
}

const TEMPLATES: Template[] = [
  {
    id: "rental",
    name: "Rental Agreement",
    category: "Property",
    fields: [
      { label: "Landlord Name", required: true },
      { label: "Landlord Address", required: true },
      { label: "Tenant Name", required: true },
      { label: "Tenant Address", required: true },
      { label: "Property Address", required: true },
      { label: "Monthly Rent", required: true },
      { label: "Security Deposit", required: true },
      { label: "Lease Start Date", type: "date", required: true },
      { label: "Lease Duration", placeholder: "e.g. 11 months" },
      { label: "Notice Period", placeholder: "e.g. 2 months" },
    ],
    generate: (d) => `RENTAL / LEASE AGREEMENT\n\nDate: ${formatDate()}\n\nThis Rental Agreement is entered into on ${d["Lease Start Date"] || "[Date]"} at [City], between:\n\nLANDLORD: ${d["Landlord Name"]}, residing at ${d["Landlord Address"]}\nAND\nTENANT: ${d["Tenant Name"]}, residing at ${d["Tenant Address"]}\n\n1. PROPERTY: The Landlord agrees to let the Premises at ${d["Property Address"]} for residential purposes.\n\n2. TERM: Commencing on ${d["Lease Start Date"] || "[Date]"} for ${d["Lease Duration"] || "11 months"}.\n\n3. RENT: Monthly rent of Rs. ${d["Monthly Rent"] || "[Amount]"}, payable in advance by the 5th of each month.\n\n4. SECURITY DEPOSIT: Rs. ${d["Security Deposit"] || "[Amount]"}, refundable at vacation subject to deductions.\n\n5. The Tenant shall pay electricity, water, and gas charges. Structural repairs are the Landlord's responsibility.\n\n6. TERMINATION: Either party may terminate with ${d["Notice Period"] || "2 months"} written notice.\n\nIN WITNESS WHEREOF, the parties have executed this Agreement.\n\nLANDLORD: ${d["Landlord Name"] || "___________________"} Signature: ___________________\nTENANT: ${d["Tenant Name"] || "___________________"} Signature: ___________________\n\n[DISCLAIMER: AI-generated draft for reference only. Consult a practicing lawyer before signing.]`,
  },
  {
    id: "employment",
    name: "Employment Contract",
    category: "Employment",
    fields: [
      { label: "Company Name", required: true },
      { label: "Company Address", required: true },
      { label: "Employee Name", required: true },
      { label: "Designation", required: true },
      { label: "Monthly Salary", required: true },
      { label: "Joining Date", type: "date", required: true },
      { label: "Work Location" },
      { label: "Notice Period", placeholder: "e.g. 30 days" },
    ],
    generate: (d) => `EMPLOYMENT CONTRACT\n\nDate: ${d["Joining Date"] || "[Date]"}\n\nEMPLOYER: ${d["Company Name"]}, ${d["Company Address"]}\nEMPLOYEE: ${d["Employee Name"]}\n\n1. DESIGNATION: ${d["Designation"] || "[Designation]"}\n2. COMMENCEMENT: ${d["Joining Date"] || "[Date]"}\n3. SALARY: Rs. ${d["Monthly Salary"] || "[Amount]"} per month (subject to PF, ESI, TDS deductions)\n4. WORK LOCATION: ${d["Work Location"] || "[Location]"}\n5. TERMINATION: Either party may give ${d["Notice Period"] || "30 days"} written notice.\n6. CONFIDENTIALITY: Employee shall not disclose confidential information.\n\nIN WITNESS WHEREOF, the parties have executed this Contract.\n\nEMPLOYER: ${d["Company Name"] || "___________________"} Signature: ___________________\nEMPLOYEE: ${d["Employee Name"] || "___________________"} Signature: ___________________\n\n[DISCLAIMER: AI-generated draft for reference only. Consult a practicing lawyer before signing.]`,
  },
  {
    id: "nda",
    name: "Non-Disclosure Agreement",
    category: "Business",
    fields: [
      { label: "Party A Name", required: true },
      { label: "Party A Address", required: true },
      { label: "Party B Name", required: true },
      { label: "Party B Address", required: true },
      { label: "Purpose", required: true },
      { label: "Duration", placeholder: "e.g. 2 years" },
    ],
    generate: (d) => `NON-DISCLOSURE AGREEMENT\n\nDate: ${formatDate()}\n\nPARTY A: ${d["Party A Name"]}, ${d["Party A Address"]}\nPARTY B: ${d["Party B Name"]}, ${d["Party B Address"]}\n\nWHEREAS the parties wish to engage in ${d["Purpose"] || "[Purpose]"}, the Disclosing Party may share confidential information.\n\n1. OBLIGATIONS: The Receiving Party shall hold all Confidential Information in strict confidence and use it solely for the Purpose.\n\n2. EXCLUSIONS: Does not apply to publicly available info, info already known, or info required by law to disclose.\n\n3. DURATION: ${d["Duration"] || "2 years"} from the date of disclosure.\n\n4. RETURN: On termination, all Confidential Information shall be returned or destroyed.\n\nIN WITNESS WHEREOF, the parties have executed this Agreement.\n\nPARTY A: ${d["Party A Name"] || "___________________"} Signature: ___________________\nPARTY B: ${d["Party B Name"] || "___________________"} Signature: ___________________\n\n[DISCLAIMER: AI-generated draft for reference only. Consult a practicing lawyer before signing.]`,
  },
  {
    id: "partnership",
    name: "Partnership Deed",
    category: "Business",
    fields: [
      { label: "Firm Name", required: true },
      { label: "Firm Address", required: true },
      { label: "Partner 1 Name", required: true },
      { label: "Partner 2 Name", required: true },
      { label: "Profit Share Ratio", required: true, placeholder: "e.g. 50:50" },
      { label: "Capital Partner 1", required: true },
      { label: "Capital Partner 2", required: true },
      { label: "Commencement Date", type: "date", required: true },
    ],
    generate: (d) => `PARTNERSHIP DEED\n\nDate: ${d["Commencement Date"] || "[Date]"}\n\nFIRM: "${d["Firm Name"] || "[Firm Name]"}"\nPRINCIPAL PLACE: ${d["Firm Address"] || "[Address]"}\n\n1. PARTNERS:\n   (a) ${d["Partner 1 Name"]} - Capital: Rs. ${d["Capital Partner 1"] || "[Amount]"}\n   (b) ${d["Partner 2 Name"]} - Capital: Rs. ${d["Capital Partner 2"] || "[Amount]"}\n\n2. PROFIT/LOSS SHARING: ${d["Profit Share Ratio"] || "50:50"}\n\n3. COMMENCEMENT: ${d["Commencement Date"] || "[Date]"}\n\n4. Each Partner shall devote full time to the Firm's business.\n\nIN WITNESS WHEREOF, the Partners have executed this Deed.\n\nPartner 1: ${d["Partner 1 Name"] || "___________________"} Signature: ___________________\nPartner 2: ${d["Partner 2 Name"] || "___________________"} Signature: ___________________\n\n[DISCLAIMER: AI-generated draft for reference only. Consult a practicing lawyer before signing.]`,
  },
  {
    id: "poa",
    name: "Power of Attorney",
    category: "General",
    fields: [
      { label: "Principal Name", required: true },
      { label: "Principal Address", required: true },
      { label: "Agent Name", required: true },
      { label: "Agent Address", required: true },
      { label: "Purpose", required: true },
      { label: "Execution Date", type: "date", required: true },
    ],
    generate: (d) => `POWER OF ATTORNEY\n\nDate: ${d["Execution Date"] || "[Date]"}\n\nI, ${d["Principal Name"]}, residing at ${d["Principal Address"]}, do hereby appoint ${d["Agent Name"]}, residing at ${d["Agent Address"]}, as my true and lawful Attorney for: ${d["Purpose"] || "[Purpose]"}\n\nThe Attorney is authorized to execute all documents, appear before authorities, and perform all acts necessary for the above purpose.\n\nThis Power of Attorney is irrevocable during my lifetime.\n\nPRINCIPAL: ${d["Principal Name"] || "___________________"} Signature: ___________________\n\nBefore me:\nNotary Public: ___________________\nRegistration No.: ___________________\n\n[DISCLAIMER: AI-generated draft for reference only. Consult a practicing lawyer before signing.]`,
  },
  {
    id: "sale-deed",
    name: "Sale Deed",
    category: "Property",
    fields: [
      { label: "Seller Name", required: true },
      { label: "Seller Address", required: true },
      { label: "Buyer Name", required: true },
      { label: "Buyer Address", required: true },
      { label: "Property Description", required: true },
      { label: "Sale Consideration", required: true },
      { label: "Sale Date", type: "date", required: true },
    ],
    generate: (d) => `SALE DEED\n\nDate: ${d["Sale Date"] || "[Date]"}\n\nSELLER: ${d["Seller Name"]}, ${d["Seller Address"]}\nBUYER: ${d["Buyer Name"]}, ${d["Buyer Address"]}\n\n1. The Vendor sells to the Purchaser the property described in Schedule A for Rs. ${d["Sale Consideration"] || "[Amount]"}.\n\n2. The Purchaser has paid the full sale consideration.\n\n3. The Vendor warrants the property is free from all encumbrances.\n\nSCHEDULE A:\n${d["Property Description"] || "[Property description with survey number, area, boundaries]"}\n\nVENDOR: ${d["Seller Name"] || "___________________"} Signature: ___________________\nPURCHASER: ${d["Buyer Name"] || "___________________"} Signature: ___________________\n\n[DISCLAIMER: AI-generated draft for reference only. Consult a practicing lawyer before signing.]`,
  },
];

export function TemplatesModal({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const [selected, setSelected] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleFieldChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const allRequiredFilled = selected?.fields.filter((f) => f.required).every((f) => formData[f.label]?.trim()) ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="animate-overlay-in mx-4 flex h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <button onClick={selected ? () => setSelected(null) : onBack} className="rounded-lg p-1 text-white/40 hover:text-white/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <h3 className="text-sm font-semibold text-white">{selected ? selected.name : "Contract Templates"}</h3>
            <p className="text-[11px] text-white/40">{selected ? selected.category : "6 ready-to-use templates"}</p>
          </div>
          <button onClick={onClose} className="ml-auto rounded-lg p-1 text-white/40 hover:text-white/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!selected ? (
            <div className="space-y-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => { setSelected(t); setFormData({}); }} className="flex w-full items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.05]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white">{t.name}</span>
                    <span className="mt-0.5 block text-xs text-white/40">{t.fields.length} fields</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {selected.fields.map((field) => (
                <div key={field.label}>
                  <label className="mb-1 block text-xs font-medium text-white/50">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {field.type === "date" ? (
                    <input type="date" value={formData[field.label] || ""} onChange={(e) => handleFieldChange(field.label, e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25" />
                  ) : (
                    <input type="text" value={formData[field.label] || ""} onChange={(e) => handleFieldChange(field.label, e.target.value)} placeholder={field.placeholder || ""} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && (
          <div className="flex gap-3 border-t border-white/10 px-5 py-4">
            <button disabled={!allRequiredFilled} onClick={() => exportAsWord(selected.generate(formData), selected.name)} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 disabled:opacity-40">Download Word</button>
            <button disabled={!allRequiredFilled} onClick={() => exportAsPdf(selected.generate(formData), selected.name)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white/70 disabled:opacity-40">Download PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Filing Modal ─── */

interface FilingStep {
  title: string;
  detail: string;
  tip?: string;
}

interface FilingGuide {
  id: string;
  name: string;
  steps: FilingStep[];
  docFields: { label: string; placeholder?: string; required?: boolean }[];
  generateDocument: (data: Record<string, string>) => string;
}

const FILING_GUIDES: FilingGuide[] = [
  {
    id: "rti",
    name: "RTI Application",
    steps: [
      { title: "Identify the Public Authority", detail: "Determine which government department holds the information you need.", tip: "Check the department website for the correct CPIO details." },
      { title: "Draft the Application", detail: "Write a clear application addressed to the CPIO. Be precise about the information you seek.", tip: "Use the template below." },
      { title: "Pay the Fee", detail: "Pay Rs. 10 via demand draft, postal order, or online. BPL card holders are exempt.", tip: "File online at rtionline.gov.in for central government bodies." },
      { title: "Submit & Follow Up", detail: "Submit physically, by post, or online. The CPIO must respond within 30 days.", tip: "If no response, file a first appeal to the appellate authority." },
    ],
    docFields: [
      { label: "Applicant Name", required: true },
      { label: "Applicant Address", required: true },
      { label: "Public Authority Name", required: true },
      { label: "Information Sought", required: true },
    ],
    generateDocument: (d) => `RTI APPLICATION\n\nDate: ${formatDate()}\n\nTo,\nThe CPIO,\n${d["Public Authority Name"] || "[Authority]"}\n\nSubject: Request for information under Section 6 of the RTI Act, 2005\n\nSir/Madam,\n\nI, ${d["Applicant Name"] || "[Name]"}, residing at ${d["Applicant Address"] || "[Address]"}, hereby request the following information:\n\n${d["Information Sought"] || "[Describe the information you seek]"}\n\nI am ready to pay the prescribed fee of Rs. 10.\n\nThanking you,\n${d["Applicant Name"] || "[Name]"}\n\n[DISCLAIMER: AI-generated draft for reference only.]`,
  },
  {
    id: "consumer",
    name: "Consumer Complaint",
    steps: [
      { title: "Determine Jurisdiction", detail: "District (up to Rs. 1 crore), State (Rs. 1-10 crore), National (above Rs. 10 crore).", tip: "File where you reside or where the opposite party's office is." },
      { title: "Gather Evidence", detail: "Collect bills, invoices, warranties, photos, and communication records.", tip: "Keep originals safe; attach copies." },
      { title: "Draft & File", detail: "Draft the complaint with clear facts and relief sought. Pay court fee (Rs. 100-200 for claims up to Rs. 5 lakh).", tip: "File within 2 years of the cause of action." },
    ],
    docFields: [
      { label: "Complainant Name", required: true },
      { label: "Opposite Party Name", required: true },
      { label: "Product/Service", required: true },
      { label: "Amount Paid", required: true },
      { label: "Deficiency Details", required: true },
    ],
    generateDocument: (d) => `CONSUMER COMPLAINT\n\nDate: ${formatDate()}\n\nTo,\nThe District Consumer Disputes Redressal Commission\n\nIn the matter of:\n${d["Complainant Name"] || "[Complainant]"} — Complainant\nVs.\n${d["Opposite Party Name"] || "[Opposite Party]"} — Opposite Party\n\nSubject: Complaint regarding ${d["Product/Service"] || "[Product/Service]"} under the Consumer Protection Act, 2019\n\n1. The complainant purchased/availed ${d["Product/Service"]} for Rs. ${d["Amount Paid"] || "[Amount]"}.\n2. The deficiency: ${d["Deficiency Details"] || "[Describe the deficiency]"}\n3. Despite repeated requests, the opposite party has failed to address the grievance.\n\nThe complainant prays for: (a) Relief sought, (b) Compensation, (c) Cost of litigation.\n\n${d["Complainant Name"] || "[Name]"}\n\n[DISCLAIMER: AI-generated draft for reference only.]`,
  },
  {
    id: "fir",
    name: "FIR Draft",
    steps: [
      { title: "Identify Police Station", detail: "File at the police station under whose jurisdiction the offence occurred. Zero FIR can be filed at any station.", tip: "Under BNSS 2023, Zero FIR is available for all cognizable offences." },
      { title: "Draft the FIR", detail: "Write facts clearly: what happened, when, where, who was involved.", tip: "Stick to facts. Do not embellish." },
      { title: "Submit to SHO", detail: "The SHO is duty-bound to register the FIR for cognizable offences under BNSS 2023.", tip: "If refused, approach the SP or file online." },
    ],
    docFields: [
      { label: "Complainant Name", required: true },
      { label: "Police Station", required: true },
      { label: "Incident Date", required: true },
      { label: "Incident Place", required: true },
      { label: "Incident Details", required: true },
    ],
    generateDocument: (d) => `FIR DRAFT\n\nDate: ${formatDate()}\n\nTo,\nThe SHO,\n${d["Police Station"] || "[Police Station]"}\n\nSubject: Information regarding offence under the Bharatiya Nyaya Sanhita, 2023\n\nSir/Madam,\n\n1. I, ${d["Complainant Name"] || "[Name]"}, wish to lodge this complaint regarding a cognizable offence on ${d["Incident Date"] || "[Date]"} at ${d["Incident Place"] || "[Place]"}.\n\n2. Details: ${d["Incident Details"] || "[Describe the incident]"}\n\n3. I request you to register an FIR under the relevant provisions of BNS 2023.\n\nYours faithfully,\n${d["Complainant Name"] || "[Name]"}\n\n[DISCLAIMER: AI-generated draft for reference only.]`,
  },
  {
    id: "notice",
    name: "Legal Notice",
    steps: [
      { title: "Identify Grounds", detail: "What is the grievance? What law or right has been violated?", tip: "Consult the relevant bare act for specific sections." },
      { title: "Draft the Notice", detail: "Clear facts, legal grounds, and the demand/relief.", tip: "Keep the tone formal. Avoid emotional language." },
      { title: "Send via Speed Post", detail: "Send with acknowledgement due (AD card). Give 15-30 days for response.", tip: "Keep the postal receipt as evidence." },
    ],
    docFields: [
      { label: "Sender Name", required: true },
      { label: "Recipient Name", required: true },
      { label: "Subject", required: true },
      { label: "Facts of the Case", required: true },
      { label: "Demand/Relief", required: true },
    ],
    generateDocument: (d) => `LEGAL NOTICE\n\nDate: ${formatDate()}\n\nFrom: ${d["Sender Name"] || "[Sender]"}\nTo: ${d["Recipient Name"] || "[Recipient]"}\n\nSubject: ${d["Subject"] || "[Subject]"}\n\nSir/Madam,\n\n1. I, ${d["Sender Name"] || "[Name]"}, hereby issue this legal notice regarding ${d["Subject"]}.\n\n2. Facts: ${d["Facts of the Case"] || "[State the facts]"}\n\n3. Through this notice, I call upon you to ${d["Demand/Relief"] || "[State your demand]"} within 15 days.\n\n4. Failure to comply will result in legal proceedings at your cost.\n\nYours faithfully,\n${d["Sender Name"] || "[Name]"}\n\n[DISCLAIMER: AI-generated draft for reference only.]`,
  },
];

export function FilingModal({ onClose, onBack }: { onClose: () => void; onBack: () => void }) {
  const [selected, setSelected] = useState<FilingGuide | null>(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleFieldChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const allRequiredFilled = selected?.docFields.filter((f) => f.required).every((f) => formData[f.label]?.trim()) ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="animate-overlay-in mx-4 flex h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <button onClick={selected ? () => { setSelected(null); setStep(0); } : onBack} className="rounded-lg p-1 text-white/40 hover:text-white/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div>
            <h3 className="text-sm font-semibold text-white">{selected ? selected.name : "Filing Assistance"}</h3>
            <p className="text-[11px] text-white/40">{selected ? `${selected.steps.length} steps` : "Step-by-step guides"}</p>
          </div>
          <button onClick={onClose} className="ml-auto rounded-lg p-1 text-white/40 hover:text-white/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!selected ? (
            <div className="space-y-2">
              {FILING_GUIDES.map((g) => (
                <button key={g.id} onClick={() => { setSelected(g); setStep(0); setFormData({}); }} className="flex w-full items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.05]">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>
                  </div>
                  <div>
                    <span className="block text-sm font-medium text-white">{g.name}</span>
                    <span className="mt-0.5 block text-xs text-white/40">{g.steps.length} steps</span>
                  </div>
                </button>
              ))}
            </div>
          ) : step < selected.steps.length ? (
            <div className="space-y-3">
              {selected.steps.map((s, i) => (
                <div key={i} className={`rounded-xl border p-4 transition-colors ${i === step ? "border-white/20 bg-white/[0.05]" : "border-white/5 bg-white/[0.02]"}`}>
                  <button onClick={() => setStep(i)} className="flex w-full items-center gap-3 text-left">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === step ? "bg-white/20 text-white" : "bg-white/5 text-white/30"}`}>{i + 1}</div>
                    <span className={`text-sm font-medium ${i === step ? "text-white" : "text-white/50"}`}>{s.title}</span>
                  </button>
                  {i === step && (
                    <div className="mt-3 ml-10">
                      <p className="text-sm text-white/60">{s.detail}</p>
                      {s.tip && <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-400/80">Tip: {s.tip}</p>}
                      <div className="mt-3 flex gap-2">
                        {i > 0 && <button onClick={() => setStep(i - 1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 hover:text-white/60">Previous</button>}
                        <button onClick={() => setStep(i + 1)} className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20">{i < selected.steps.length - 1 ? "Next" : "Fill Details"}</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-medium text-white/50">Fill in your details:</p>
              {selected.docFields.map((field) => (
                <div key={field.label}>
                  <label className="mb-1 block text-xs font-medium text-white/50">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input type="text" value={formData[field.label] || ""} onChange={(e) => handleFieldChange(field.label, e.target.value)} placeholder={field.placeholder || ""} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25" />
                </div>
              ))}
            </div>
          )}
        </div>

        {selected && step >= selected.steps.length && (
          <div className="flex gap-3 border-t border-white/10 px-5 py-4">
            <button disabled={!allRequiredFilled} onClick={() => exportAsWord(selected.generateDocument(formData), selected.name)} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 disabled:opacity-40">Download Word</button>
            <button disabled={!allRequiredFilled} onClick={() => exportAsPdf(selected.generateDocument(formData), selected.name)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white/70 disabled:opacity-40">Download PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}
