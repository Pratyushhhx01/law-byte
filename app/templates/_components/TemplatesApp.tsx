"use client";

import { useState } from "react";
import { exportAsWord, exportAsPdf } from "@/lib/export";

interface TemplateField {
  label: string;
  placeholder: string;
  type?: "text" | "textarea" | "date";
  required?: boolean;
}

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: TemplateField[];
  generate: (data: Record<string, string>) => string;
}

const templates: Template[] = [
  {
    id: "rental-agreement",
    name: "Rental / Lease Agreement",
    category: "Property",
    description: "Standard residential rental agreement under the Transfer of Property Act, 1882.",
    fields: [
      { label: "Landlord Name", placeholder: "Full legal name", required: true },
      { label: "Landlord Address", placeholder: "Complete address", required: true },
      { label: "Tenant Name", placeholder: "Full legal name", required: true },
      { label: "Tenant Address", placeholder: "Complete address", required: true },
      { label: "Property Address", placeholder: "Full address of rented property", required: true },
      { label: "Monthly Rent", placeholder: "e.g. 25000", required: true },
      { label: "Security Deposit", placeholder: "e.g. 50000", required: true },
      { label: "Lease Start Date", placeholder: "DD/MM/YYYY", type: "date", required: true },
      { label: "Lease Duration", placeholder: "e.g. 11 months" },
      { label: "Notice Period", placeholder: "e.g. 2 months" },
    ],
    generate: (d) => `RENTAL / LEASE AGREEMENT

Date: ${new Date().toLocaleDateString("en-IN")}

This Rental Agreement ("Agreement") is entered into on ${d["Lease Start Date"] || "[Date]"} at [City], between:

LANDLORD: ${d["Landlord Name"]}, residing at ${d["Landlord Address"]}
(hereinafter referred to as the "Landlord")

AND

TENANT: ${d["Tenant Name"]}, residing at ${d["Tenant Address"]}
(hereinafter referred to as the "Tenant")

WHEREAS the Landlord is the lawful owner of the property situated at ${d["Property Address"]} (hereinafter referred to as the "Premises");

NOW THIS AGREEMENT WITNESSES AS FOLLOWS:

1. PROPERTY: The Landlord agrees to let and the Tenant agrees to take on rent the Premises situated at ${d["Property Address"]} for residential purposes.

2. TERM: The tenancy shall commence on ${d["Lease Start Date"] || "[Date]"} and shall continue for ${d["Lease Duration"] || "11 months"} unless terminated earlier in accordance with this Agreement.

3. RENT: The Tenant shall pay a monthly rent of Rs. ${d["Monthly Rent"] || "[Amount]"} (Rupees ${d["Monthly Rent"] ? Number(d["Monthly Rent"]).toLocaleString("en-IN") : "[Amount]"} only) payable in advance on or before the 5th of each calendar month.

4. SECURITY DEPOSIT: The Tenant has paid a security deposit of Rs. ${d["Security Deposit"] || "[Amount]"} (Rupees ${d["Security Deposit"] ? Number(d["Security Security"] || d["Security Deposit"]).toLocaleString("en-IN") : "[Amount]"} only) which shall be refundable at the time of vacation of the Premises, subject to deductions for damages or outstanding dues.

5. MAINTENANCE: The Tenant shall be responsible for payment of electricity, water, gas, and other utility charges. The Landlord shall be responsible for structural repairs and major maintenance.

6. USE: The Premises shall be used solely for residential purposes. The Tenant shall not sub-let, assign, or part with possession without prior written consent of the Landlord.

7. TERMINATION: Either party may terminate this Agreement by giving ${d["Notice Period"] || "2 months"} written notice. The Landlord may terminate immediately in case of default by the Tenant.

8. CONDITION: The Tenant shall keep the Premises in good condition and shall not make any structural alterations without the Landlord's written consent.

9. DISPUTE RESOLUTION: Any dispute arising out of this Agreement shall be subject to the jurisdiction of the courts at [City].

IN WITNESS WHEREOF, the parties have executed this Agreement on the date first above written.

LANDLORD:
${d["Landlord Name"] || "___________________"}
Signature: ___________________

TENANT:
${d["Tenant Name"] || "___________________"}
Signature: ___________________

Witness 1: ___________________
Witness 2: ___________________

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before signing, filing, or acting upon this document.]`,
  },
  {
    id: "employment-contract",
    name: "Employment Contract",
    category: "Employment",
    description: "Standard employment agreement under the Indian Contract Act, 1872 and Labour Codes.",
    fields: [
      { label: "Company Name", placeholder: "Company / employer name", required: true },
      { label: "Company Address", placeholder: "Registered office address", required: true },
      { label: "Employee Name", placeholder: "Full legal name", required: true },
      { label: "Designation", placeholder: "Job title / designation", required: true },
      { label: "Monthly Salary", placeholder: "e.g. 50000", required: true },
      { label: "Joining Date", placeholder: "DD/MM/YYYY", type: "date", required: true },
      { label: "Work Location", placeholder: "City / office address" },
      { label: "Notice Period", placeholder: "e.g. 30 days" },
    ],
    generate: (d) => `EMPLOYMENT CONTRACT

Date: ${d["Joining Date"] || "[Date]"}

This Employment Contract ("Contract") is entered into between:

EMPLOYER: ${d["Company Name"]}, having its registered office at ${d["Company Address"]}
(hereinafter referred to as the "Employer")

AND

EMPLOYEE: ${d["Employee Name"]}
(hereinafter referred to as the "Employee")

1. DESIGNATION: The Employee shall be engaged as ${d["Designation"] || "[Designation]"} and shall perform such duties as may be assigned by the Employer.

2. COMMENCEMENT: The employment shall commence on ${d["Joining Date"] || "[Date]"} and shall continue until terminated by either party in accordance with this Contract.

3. COMPENSATION: The Employee shall receive a monthly gross salary of Rs. ${d["Monthly Salary"] || "[Amount]"}, subject to applicable deductions including Provident Fund, ESI, and TDS as per applicable law.

4. WORK LOCATION: The Employee shall report to ${d["Work Location"] || "[Location]"} or such other location as the Employer may designate.

5. WORKING HOURS: The Employee shall work as per the Employer's standard working hours, not exceeding 48 hours per week as per the Factories Act, 1948 / Code on Wages, 2019.

6. LEAVE: The Employee shall be entitled to leave as per the establishment's leave policy and applicable labour laws, including Earned Leave, Casual Leave, and Sick Leave.

7. CONFIDENTIALITY: The Employee shall not disclose any confidential information, trade secrets, or proprietary data of the Employer during or after the employment.

8. INTELLECTUAL PROPERTY: All work product, inventions, and intellectual property created during the course of employment shall belong to the Employer.

9. TERMINATION: Either party may terminate this Contract by giving ${d["Notice Period"] || "30 days"} written notice or payment in lieu of notice. The Employer may terminate immediately for gross misconduct.

10. GOVERNING LAW: This Contract shall be governed by the laws of India and subject to the jurisdiction of courts at [City].

IN WITNESS WHEREOF, the parties have executed this Contract.

EMPLOYER:
${d["Company Name"] || "___________________"}
Signature: ___________________
Name: ___________________
Designation: ___________________

EMPLOYEE:
${d["Employee Name"] || "___________________"}
Signature: ___________________

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before signing, filing, or acting upon this document.]`,
  },
  {
    id: "nda",
    name: "Non-Disclosure Agreement (NDA)",
    category: "Business",
    description: "Confidentiality agreement for protecting sensitive business information.",
    fields: [
      { label: "Party A Name", placeholder: "First party name", required: true },
      { label: "Party A Address", placeholder: "First party address", required: true },
      { label: "Party B Name", placeholder: "Second party name", required: true },
      { label: "Party B Address", placeholder: "Second party address", required: true },
      { label: "Purpose", placeholder: "Purpose of sharing confidential information", required: true },
      { label: "Duration", placeholder: "e.g. 2 years" },
    ],
    generate: (d) => `NON-DISCLOSURE AGREEMENT

Date: ${new Date().toLocaleDateString("en-IN")}

This Non-Disclosure Agreement ("Agreement") is entered into between:

PARTY A: ${d["Party A Name"]}, having its office at ${d["Party A Address"]}
(hereinafter referred to as the "Disclosing Party")

AND

PARTY B: ${d["Party B Name"]}, having its office at ${d["Party B Address"]}
(hereinafter referred to as the "Receiving Party")

WHEREAS the parties wish to explore and/or engage in ${d["Purpose"] || "[Purpose]"} (the "Purpose") and in connection therewith, the Disclosing Party may disclose certain confidential and proprietary information to the Receiving Party;

NOW THIS AGREEMENT WITNESSES AS FOLLOWS:

1. CONFIDENTIAL INFORMATION: "Confidential Information" means any information, whether oral, written, electronic, or in any other form, that is disclosed by the Disclosing Party to the Receiving Party, including but not limited to: trade secrets, business plans, financial data, customer lists, product designs, source code, algorithms, marketing strategies, and any other proprietary information.

2. OBLIGATIONS: The Receiving Party agrees to:
   (a) Hold all Confidential Information in strict confidence;
   (b) Not disclose Confidential Information to any third party without prior written consent;
   (c) Use the Confidential Information solely for the Purpose;
   (d) Take reasonable security measures to protect the information.

3. EXCLUSIONS: This obligation does not apply to information that:
   (a) Is or becomes publicly available through no fault of the Receiving Party;
   (b) Was already known to the Receiving Party prior to disclosure;
   (c) Is independently developed without use of Confidential Information;
   (d) Is required to be disclosed by law or court order.

4. DURATION: This Agreement shall remain in force for ${d["Duration"] || "2 years"} from the date of disclosure of Confidential Information.

5. RETURN OF MATERIALS: Upon termination or request, the Receiving Party shall promptly return or destroy all Confidential Information and any copies thereof.

6. REMEDIES: The parties acknowledge that breach of this Agreement may cause irreparable harm for which monetary damages may be inadequate. The Disclosing Party shall be entitled to seek injunctive relief in addition to any other remedies available at law.

7. GOVERNING LAW: This Agreement shall be governed by the laws of India and subject to the jurisdiction of courts at [City].

IN WITNESS WHEREOF, the parties have executed this Agreement.

PARTY A:
${d["Party A Name"] || "___________________"}
Signature: ___________________

PARTY B:
${d["Party B Name"] || "___________________"}
Signature: ___________________

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before signing, filing, or acting upon this document.]`,
  },
  {
    id: "partnership-deed",
    name: "Partnership Deed",
    category: "Business",
    description: "Partnership deed for forming a firm under the Indian Partnership Act, 1932.",
    fields: [
      { label: "Firm Name", placeholder: "Name of the partnership firm", required: true },
      { label: "Firm Address", placeholder: "Principal place of business", required: true },
      { label: "Partner 1 Name", placeholder: "Full legal name", required: true },
      { label: "Partner 2 Name", placeholder: "Full legal name", required: true },
      { label: "Profit Share Ratio", placeholder: "e.g. 50:50 or 60:40", required: true },
      { label: "Capital Partner 1", placeholder: "e.g. 500000", required: true },
      { label: "Capital Partner 2", placeholder: "e.g. 500000", required: true },
      { label: "Commencement Date", placeholder: "DD/MM/YYYY", type: "date", required: true },
    ],
    generate: (d) => `PARTNERSHIP DEED

Date: ${d["Commencement Date"] || "[Date]"}

This Partnership Deed ("Deed") is entered into on ${d["Commencement Date"] || "[Date]"} at [City] between:

1. ${d["Partner 1 Name"] || "Partner 1"}, residing at [Address]
(hereinafter referred to as "Partner 1")

2. ${d["Partner 2 Name"] || "Partner 2"}, residing at [Address]
(hereinafter referred to as "Partner 2")

Partner 1 and Partner 2 are hereinafter collectively referred to as the "Parties" and individually as a "Partner".

1. FIRM NAME: The partnership firm shall be known as "${d["Firm Name"] || "[Firm Name]"}" (hereinafter referred to as the "Firm").

2. BUSINESS: The Firm shall carry on the business of [Nature of Business] and such other business as the Partners may mutually agree.

3. PRINCIPAL PLACE OF BUSINESS: The principal place of business of the Firm shall be at ${d["Firm Address"] || "[Address]"}.

4. COMMENCEMENT: The partnership shall commence on ${d["Commencement Date"] || "[Date]"} and shall continue until dissolved by mutual agreement or in accordance with the Indian Partnership Act, 1932.

5. CAPITAL: The Partners shall contribute the following initial capital:
   (a) Partner 1 (${d["Partner 1 Name"] || "Partner 1"}): Rs. ${d["Capital Partner 1"] || "[Amount]"}
   (b) Partner 2 (${d["Partner 2 Name"] || "Partner 2"}): Rs. ${d["Capital Partner 2"] || "[Amount]"}

6. PROFIT AND LOSS SHARING: The net profits and losses of the Firm shall be shared between the Partners in the ratio of ${d["Profit Share Ratio"] || "50:50"}.

7. INTEREST ON CAPITAL: No interest shall be paid on capital unless unanimously agreed by the Partners.

8. DUTIES: Each Partner shall devote full time and attention to the business of the Firm and shall not engage in any competing business without written consent of the other Partner.

9. DRAWINGS: Each Partner may withdraw up to Rs. [Amount] per month as drawings, which shall be adjusted against their share of profits.

10. BANK ACCOUNT: The Firm shall open a bank account in the name of the Firm. All firm transactions shall be routed through this account.

11. DISPUTE RESOLUTION: Any dispute between the Partners shall first be referred to arbitration under the Arbitration and Conciliation Act, 1996. The arbitration shall be by a sole arbitrator mutually appointed.

12. DISSOLUTION: The partnership may be dissolved by mutual written consent of all Partners, or in accordance with the provisions of the Indian Partnership Act, 1932.

IN WITNESS WHEREOF, the Parties have executed this Deed on the date first above written.

Partner 1:
${d["Partner 1 Name"] || "___________________"}
Signature: ___________________

Partner 2:
${d["Partner 2 Name"] || "___________________"}
Signature: ___________________

Witness 1: ___________________
Witness 2: ___________________

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before signing, filing, or acting upon this document.]`,
  },
  {
    id: "power-of-attorney",
    name: "Power of Attorney (General)",
    category: "General",
    description: "General power of attorney under the Power of Attorney Act, 1882.",
    fields: [
      { label: "Principal Name", placeholder: "Full legal name", required: true },
      { label: "Principal Address", placeholder: "Complete address", required: true },
      { label: "Agent Name", placeholder: "Full legal name of attorney", required: true },
      { label: "Agent Address", placeholder: "Complete address", required: true },
      { label: "Purpose", placeholder: "Purpose / scope of authority", required: true },
      { label: "Execution Date", placeholder: "DD/MM/YYYY", type: "date", required: true },
    ],
    generate: (d) => `POWER OF ATTORNEY

Date: ${d["Execution Date"] || "[Date]"}

I, ${d["Principal Name"] || "[Principal Name]"}, son/daughter of [Father's Name], aged [Age] years, residing at ${d["Principal Address"] || "[Address]"}, (hereinafter referred to as the "Principal"), do hereby appoint:

${d["Agent Name"] || "[Agent Name]"}, son/daughter of [Father's Name], aged [Age] years, residing at ${d["Agent Address"] || "[Address]"}, (hereinafter referred to as the "Attorney"),

as my true and lawful Attorney to act for me and on my behalf in connection with: ${d["Purpose"] || "[Purpose]"}

The Attorney is hereby authorized to:

1. Execute all documents, agreements, and writings necessary for the above purpose.
2. Appear before any government authority, court, tribunal, or any other body on my behalf.
3. Sign, seal, and deliver all documents on my behalf.
4. Perform all acts and things necessary or incidental to the above purpose.

This Power of Attorney is irrevocable during my lifetime and shall remain in force until revoked by me in writing.

This Power of Attorney is executed voluntarily and without any coercion or undue influence.

IN WITNESS WHEREOF, I have executed this Power of Attorney on the date first above written.

PRINCIPAL:
${d["Principal Name"] || "___________________"}
Signature: ___________________

Before me:

Notary Public / Oath Commissioner
Name: ___________________
Registration No.: ___________________
Signature: ___________________

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before signing, filing, or acting upon this document.]`,
  },
  {
    id: "sale-deed",
    name: "Sale Deed (Immovable Property)",
    category: "Property",
    description: "Property sale deed under the Transfer of Property Act, 1882 and Registration Act, 1908.",
    fields: [
      { label: "Seller Name", placeholder: "Full legal name", required: true },
      { label: "Seller Address", placeholder: "Complete address", required: true },
      { label: "Buyer Name", placeholder: "Full legal name", required: true },
      { label: "Buyer Address", placeholder: "Complete address", required: true },
      { label: "Property Description", placeholder: "Full description with survey number, area, boundaries", required: true },
      { label: "Sale Consideration", placeholder: "Total sale price in rupees", required: true },
      { label: "Sale Date", placeholder: "DD/MM/YYYY", type: "date", required: true },
    ],
    generate: (d) => `SALE DEED

Date: ${d["Sale Date"] || "[Date]"}

This Sale Deed ("Deed") is executed on ${d["Sale Date"] || "[Date]"} at [City] between:

SELLER: ${d["Seller Name"] || "[Seller Name]"}, son/daughter of [Father's Name], aged [Age] years, residing at ${d["Seller Address"] || "[Address]"}, (hereinafter referred to as the "Vendor")

AND

BUYER: ${d["Buyer Name"] || "[Buyer Name]"}, son/daughter of [Father's Name], aged [Age] years, residing at ${d["Buyer Address"] || "[Address]"}, (hereinafter referred to as the "Purchaser")

WHEREAS the Vendor is the absolute owner and lawful possessor of the immovable property more particularly described in Schedule A hereto;

AND WHEREAS the Vendor has agreed to sell and the Purchaser has agreed to purchase the said property for a total sale consideration of Rs. ${d["Sale Consideration"] || "[Amount]"} (Rupees ${d["Sale Consideration"] ? Number(d["Sale Consideration"]).toLocaleString("en-IN") : "[Amount]"} only);

NOW THIS DEED WITNESSES AS FOLLOWS:

1. The Vendor hereby sells, transfers, and conveys unto the Purchaser the property described in Schedule A, together with all rights, interests, appurtenances, and easements thereto.

2. The Purchaser has paid the total sale consideration of Rs. ${d["Sale Consideration"] || "[Amount]"} to the Vendor, and the Vendor hereby acknowledges receipt of the same.

3. The Vendor warrants that the said property is free from all encumbrances, liens, charges, mortgages, litigations, and claims of any nature whatsoever.

4. The Vendor shall hand over possession of the property to the Purchaser on or before [Date].

5. The Vendor shall execute all necessary documents and writings to perfect the title of the Purchaser.

SCHEDULE A - PROPERTY DESCRIPTION:
${d["Property Description"] || "[Property description with survey number, area, boundaries, and details]"}

IN WITNESS WHEREOF, the Vendor has executed this Sale Deed on the date first above written.

VENDOR:
${d["Seller Name"] || "___________________"}
Signature: ___________________

PURCHASER:
${d["Buyer Name"] || "___________________"}
Signature: ___________________

Before me:

Sub-Registrar
Name: ___________________
Office: ___________________
Signature: ___________________

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before signing, filing, or acting upon this document.]`,
  },
];

const CATEGORIES = ["All", ...new Set(templates.map((t) => t.category))];

export default function TemplatesApp() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? templates : templates.filter((t) => t.category === activeCategory);

  const handleSelect = (t: Template) => {
    setSelectedTemplate(t);
    setFormData({});
  };

  const handleFieldChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const allRequiredFilled = selectedTemplate?.fields
    .filter((f) => f.required)
    .every((f) => formData[f.label]?.trim()) ?? false;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Contract Templates</h1>
          <p className="mt-3 text-sm text-white/50">Ready-to-use Indian legal contract templates. Fill in the blanks and download.</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 text-white/40 hover:text-white/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {!selectedTemplate ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="mb-2 text-xs font-medium text-white/30">{t.category}</div>
                <h3 className="text-base font-semibold">{t.name}</h3>
                <p className="mt-2 text-sm text-white/40">{t.description}</p>
                <div className="mt-4 text-xs text-white/25 group-hover:text-white/40">{t.fields.length} fields</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <button onClick={() => setSelectedTemplate(null)} className="mb-6 text-sm text-white/40 hover:text-white/60">
              &larr; Back to templates
            </button>
            <h2 className="mb-1 text-xl font-semibold">{selectedTemplate.name}</h2>
            <p className="mb-6 text-sm text-white/40">{selectedTemplate.description}</p>

            <div className="space-y-4">
              {selectedTemplate.fields.map((field) => (
                <div key={field.label}>
                  <label className="mb-1 block text-xs font-medium text-white/50">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={formData[field.label] || ""}
                      onChange={(e) => handleFieldChange(field.label, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25"
                    />
                  ) : field.type === "date" ? (
                    <input
                      type="date"
                      value={formData[field.label] || ""}
                      onChange={(e) => handleFieldChange(field.label, e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.label] || ""}
                      onChange={(e) => handleFieldChange(field.label, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                disabled={!allRequiredFilled}
                onClick={() => {
                  const content = selectedTemplate.generate(formData);
                  exportAsWord(content, selectedTemplate.name);
                }}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 disabled:opacity-40"
              >
                Download as Word
              </button>
              <button
                disabled={!allRequiredFilled}
                onClick={() => {
                  const content = selectedTemplate.generate(formData);
                  exportAsPdf(content, selectedTemplate.name);
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white/70 disabled:opacity-40"
              >
                Download as PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
