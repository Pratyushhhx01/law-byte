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
    description:
      "Standard residential rental agreement under the Transfer of Property Act, 1882.",
    fields: [
      {
        label: "Landlord Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Landlord Address",
        placeholder: "Complete address",
        required: true,
      },
      { label: "Tenant Name", placeholder: "Full legal name", required: true },
      {
        label: "Tenant Address",
        placeholder: "Complete address",
        required: true,
      },
      {
        label: "Property Address",
        placeholder: "Full address of rented property",
        required: true,
      },
      { label: "Monthly Rent", placeholder: "e.g. 25000", required: true },
      { label: "Security Deposit", placeholder: "e.g. 50000", required: true },
      {
        label: "Lease Start Date",
        placeholder: "DD/MM/YYYY",
        type: "date",
        required: true,
      },
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
    description:
      "Standard employment agreement under the Indian Contract Act, 1872 and Labour Codes.",
    fields: [
      {
        label: "Company Name",
        placeholder: "Company / employer name",
        required: true,
      },
      {
        label: "Company Address",
        placeholder: "Registered office address",
        required: true,
      },
      {
        label: "Employee Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Designation",
        placeholder: "Job title / designation",
        required: true,
      },
      { label: "Monthly Salary", placeholder: "e.g. 50000", required: true },
      {
        label: "Joining Date",
        placeholder: "DD/MM/YYYY",
        type: "date",
        required: true,
      },
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
    description:
      "Confidentiality agreement for protecting sensitive business information.",
    fields: [
      {
        label: "Party A Name",
        placeholder: "First party name",
        required: true,
      },
      {
        label: "Party A Address",
        placeholder: "First party address",
        required: true,
      },
      {
        label: "Party B Name",
        placeholder: "Second party name",
        required: true,
      },
      {
        label: "Party B Address",
        placeholder: "Second party address",
        required: true,
      },
      {
        label: "Purpose",
        placeholder: "Purpose of sharing confidential information",
        required: true,
      },
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
    description:
      "Partnership deed for forming a firm under the Indian Partnership Act, 1932.",
    fields: [
      {
        label: "Firm Name",
        placeholder: "Name of the partnership firm",
        required: true,
      },
      {
        label: "Firm Address",
        placeholder: "Principal place of business",
        required: true,
      },
      {
        label: "Partner 1 Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Partner 2 Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Profit Share Ratio",
        placeholder: "e.g. 50:50 or 60:40",
        required: true,
      },
      {
        label: "Capital Partner 1",
        placeholder: "e.g. 500000",
        required: true,
      },
      {
        label: "Capital Partner 2",
        placeholder: "e.g. 500000",
        required: true,
      },
      {
        label: "Commencement Date",
        placeholder: "DD/MM/YYYY",
        type: "date",
        required: true,
      },
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
    description:
      "General power of attorney under the Power of Attorney Act, 1882.",
    fields: [
      {
        label: "Principal Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Principal Address",
        placeholder: "Complete address",
        required: true,
      },
      {
        label: "Agent Name",
        placeholder: "Full legal name of attorney",
        required: true,
      },
      {
        label: "Agent Address",
        placeholder: "Complete address",
        required: true,
      },
      {
        label: "Purpose",
        placeholder: "Purpose / scope of authority",
        required: true,
      },
      {
        label: "Execution Date",
        placeholder: "DD/MM/YYYY",
        type: "date",
        required: true,
      },
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
    description:
      "Property sale deed under the Transfer of Property Act, 1882 and Registration Act, 1908.",
    fields: [
      { label: "Seller Name", placeholder: "Full legal name", required: true },
      {
        label: "Seller Address",
        placeholder: "Complete address",
        required: true,
      },
      { label: "Buyer Name", placeholder: "Full legal name", required: true },
      {
        label: "Buyer Address",
        placeholder: "Complete address",
        required: true,
      },
      {
        label: "Property Description",
        placeholder: "Full description with survey number, area, boundaries",
        required: true,
      },
      {
        label: "Sale Consideration",
        placeholder: "Total sale price in rupees",
        required: true,
      },
      {
        label: "Sale Date",
        placeholder: "DD/MM/YYYY",
        type: "date",
        required: true,
      },
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
  {
    id: "will",
    name: "Will",
    category: "Document",
    description:
      "Last Will and Testament under the Indian Succession Act, 1925.",
    fields: [
      {
        label: "Testator Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Testator Address",
        placeholder: "Complete address",
        required: true,
      },
      {
        label: "Executor Name",
        placeholder: "Name of person to execute the will",
        required: true,
      },
      {
        label: "Executor Address",
        placeholder: "Complete address of executor",
        required: true,
      },
      {
        label: "Beneficiaries",
        placeholder: "Names and shares of beneficiaries",
        type: "textarea",
        required: true,
      },
      {
        label: "Assets Description",
        placeholder: "Details of property, investments, and other assets",
        type: "textarea",
        required: true,
      },
      {
        label: "Date",
        placeholder: "DD/MM/YYYY",
        type: "date",
        required: true,
      },
    ],
    generate: (d) => `LAST WILL AND TESTAMENT

Date: ${d["Date"] || "[Date]"}

I, ${d["Testator Name"] || "[Testator Name]"}, son/daughter of [Father's Name], aged [Age] years, residing at ${d["Testator Address"] || "[Address]"}, being of sound mind and disposing memory, do hereby make this my Last Will and Testament as follows:

1. REVOCATION: I revoke all prior wills and codicils made by me.

2. EXECUTOR: I appoint ${d["Executor Name"] || "[Executor Name]"}, residing at ${d["Executor Address"] || "[Executor Address]"}, as the Executor of this Will.

3. ASSETS: I own the following assets:
${d["Assets Description"] || "[Describe your assets including property, bank accounts, investments, and other valuables]"}

4. BEQUESTS: I bequeath my assets as follows:
${d["Beneficiaries"] || "[List beneficiaries and their respective shares]"}

5. DEBTS AND EXPENSES: I direct that all my just debts, funeral expenses, and costs of probate be paid from my estate.

6. GUARDIANSHIP: [If applicable, specify guardianship arrangements for minor children]

IN WITNESS WHEREOF, I have executed this Will on the date first above written.

TESTATOR:
${d["Testator Name"] || "___________________"}
Signature: ___________________

In the presence of:

Witness 1:
Name: ___________________
Address: ___________________
Signature: ___________________

Witness 2:
Name: ___________________
Address: ___________________
Signature: ___________________

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before signing, filing, or acting upon this document.]`,
  },
  {
    id: "affidavit",
    name: "Affidavit",
    category: "Document",
    description: "Sworn affidavit for use in courts and official proceedings.",
    fields: [
      {
        label: "Deponent Name",
        placeholder: "Full legal name of deponent",
        required: true,
      },
      {
        label: "Deponent Address",
        placeholder: "Complete address",
        required: true,
      },
      {
        label: "Subject",
        placeholder: "Subject/purpose of the affidavit",
        required: true,
      },
      {
        label: "Affirmation Statement",
        placeholder: "The facts being affirmed",
        type: "textarea",
        required: true,
      },
      {
        label: "Date",
        placeholder: "DD/MM/YYYY",
        type: "date",
        required: true,
      },
    ],
    generate: (d) =>
      `AFFIDAVIT

Date: ${d["Date"] || "[Date]"}

BEFORE THE [COURT/AUTHORITY]

IN THE MATTER OF: ${d["Subject"] || "[Subject]"}

AFFIDAVIT OF ${d["Deponent Name"] || "[Deponent Name]"}

I, ${d["Deponent Name"] || "[Deponent Name]"}, son/daughter of [Father's Name], aged [Age] years, residing at ${d["Deponent Address"] || "[Address]"}, do hereby solemnly affirm and state as follows:

1. ${d["Affirmation Statement"] || "[State the facts you are affirming]"}

2. I say that the contents of this affidavit are true and correct to the best of my knowledge and belief.

3. I make this affidavit in support of [purpose/application].

VERIFICATION

I, ${d["Deponent Name"] || "[Deponent Name]"}, the deponent above-named, do hereby verify that the contents of paragraphs 1 and 2 are true and correct to the best of my knowledge and belief. No part of it is false, and nothing material has been concealed.

Verified at [Place] on this ${d["Date"] || "[Date]"}.

DEPONENT:
${d["Deponent Name"] || "___________________"}
Signature: ___________________

Before me:

Oath Commissioner / Notary Public
Name: ___________________
Registration No.: ___________________
Signature: ___________________

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before signing, filing, or acting upon this document.]`,
  },
  {
    id: "petition",
    name: "Petition / Plaint",
    category: "Document",
    description: "Civil suit plaint for filing in appropriate courts.",
    fields: [
      {
        label: "Petitioner Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Respondent Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Court Name",
        placeholder: "Name of the court",
        required: true,
      },
      {
        label: "Cause of Action",
        placeholder: "Facts giving rise to the claim",
        type: "textarea",
        required: true,
      },
      {
        label: "Relief Sought",
        placeholder: "Specific relief/prayer sought from the court",
        type: "textarea",
        required: true,
      },
      {
        label: "Date",
        placeholder: "DD/MM/YYYY",
        type: "date",
        required: true,
      },
    ],
    generate: (d) => `PLAINT

IN THE COURT OF ${d["Court Name"] || "[Court Name]"}

ORIGINAL JURISDICTION

Suit No.: ________/20__

${d["Petitioner Name"] || "[Petitioner Name]"}                           - Plaintiff

Vs.

${d["Respondent Name"] || "[Respondent Name]"}                          - Defendant

PLAINT UNDER ORDER VII RULE 1 CPC

May it please the Hon'ble Court,

1. The plaintiff ${d["Petitioner Name"] || "[Petitioner Name]"}, residing at [Address], files this suit against the defendant ${d["Respondent Name"] || "[Respondent Name]"}, residing at [Address], for the following cause of action:

${d["Cause of Action"] || "[State the facts giving rise to the claim]"}

2. JURISDICTION: This Hon'ble Court has jurisdiction to try this suit as the cause of action arose within its territorial limits and the value of the suit exceeds Rs. [Amount].

3. CAUSE OF ACTION: The cause of action arose on [Date] when [state the facts that gave rise to the claim].

4. LIMITATION: This suit is filed within the period of limitation as prescribed under the Limitation Act, 1963.

5. VALUATION: The suit is valued at Rs. [Amount] for purposes of court fees and jurisdiction.

6. RELIEF SOUGHT: The plaintiff prays for:
${d["Relief Sought"] || "[State the specific relief/prayer sought from the court]"}

7. LIST OF DOCUMENTS:
   (i) [Document 1]
   (ii) [Document 2]
   (iii) [Document 3]

8. LIST OF WITNESSES:
   (i) [Witness 1]
   (ii) [Witness 2]

PLAINTIFF:
${d["Petitioner Name"] || "___________________"}
Signature: ___________________

Through: [Advocate Name]
Advocate for the Plaintiff

Date: ${d["Date"] || "[Date]"}
Place: [City]

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before signing, filing, or acting upon this document.]`,
  },
  {
    id: "legal-notice",
    name: "Legal Notice",
    category: "Document",
    description: "Formal legal notice before initiating court proceedings.",
    fields: [
      {
        label: "Sender Name",
        placeholder: "Full legal name of sender",
        required: true,
      },
      {
        label: "Recipient Name",
        placeholder: "Full legal name of recipient",
        required: true,
      },
      {
        label: "Subject",
        placeholder: "Subject of the legal notice",
        required: true,
      },
      {
        label: "Facts of the Case",
        placeholder: "Detailed facts of the case",
        type: "textarea",
        required: true,
      },
      {
        label: "Demand/Relief",
        placeholder: "What you are demanding or seeking",
        type: "textarea",
        required: true,
      },
    ],
    generate: (d) => `LEGAL NOTICE

Date: ${new Date().toLocaleDateString("en-IN")}

From:
${d["Sender Name"] || "[Sender Name]"}
[Address]

To:
${d["Recipient Name"] || "[Recipient Name]"}
[Address]

Subject: ${d["Subject"] || "[Subject]"}

Sir/Madam,

1. I, ${d["Sender Name"] || "[Sender Name]"}, through my Advocate, hereby issue this legal notice under Section 80 of the Code of Civil Procedure, 1908 [or other applicable provision] in respect of the following matter:

${d["Facts of the Case"] || "[State the facts of the case in detail]"}

2. LEGAL GROUNDS: The above acts/omissions constitute violation of [specify applicable laws/provisions].

3. DEMAND: Through this notice, I call upon you to ${d["Demand/Relief"] || "[State your demand/relief sought]"} within 30 days from the date of receipt of this notice.

4. CONSEQUENCES: Please note that in case of your failure to comply with the above demand, I shall be constrained to initiate appropriate legal proceedings against you at your risk as to costs and consequences.

This notice is issued without prejudice to my other rights and remedies available under law.

Yours faithfully,

${d["Sender Name"] || "___________________"}
Through: [Advocate Name]
Advocate

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before signing, filing, or acting upon this document.]`,
  },
  {
    id: "fir-draft",
    name: "FIR Draft",
    category: "Document",
    description:
      "First Information Report draft under Bharatiya Nagarik Suraksha Sanhita, 2023.",
    fields: [
      {
        label: "Complainant Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Police Station",
        placeholder: "Name of police station",
        required: true,
      },
      {
        label: "Incident Date",
        placeholder: "DD/MM/YYYY",
        type: "date",
        required: true,
      },
      {
        label: "Incident Place",
        placeholder: "Place where incident occurred",
        required: true,
      },
      {
        label: "Incident Details",
        placeholder: "Detailed description of the incident",
        type: "textarea",
        required: true,
      },
    ],
    generate: (d) => `FIRST INFORMATION REPORT (FIR)

Date: ${d["Incident Date"] || "[Date]"}

To,
The Station House Officer (SHO),
${d["Police Station"] || "[Police Station]"}
[District, State]

Subject: Information regarding cognizable offence under the Bharatiya Nyaya Sanhita, 2023

Sir/Madam,

1. I, ${d["Complainant Name"] || "[Complainant Name]"}, son/daughter of [Father's Name], aged [Age] years, residing at [Address], hereby inform you about the following cognizable offence:

2. DATE AND TIME OF INCIDENT: ${d["Incident Date"] || "[Date]"} at [Time]

3. PLACE OF INCIDENT: ${d["Incident Place"] || "[Place]"}

4. DETAILS OF INCIDENT:
${d["Incident Details"] || "[Describe the incident in detail - what happened, who was involved, what offences were committed]"}

5. ACCUSED PERSONS: [Name(s) and description(s) of accused persons, if known]

6. WITNESSES: [Name(s) and address(es) of witnesses, if any]

7. EVIDENCE: [Details of any physical evidence, documents, or electronic evidence]

8. I request you to register an FIR under the relevant provisions of the Bharatiya Nyaya Sanhita, 2023 and the Bharatiya Nagarik Suraksha Sanhita, 2023 and investigate the matter.

Yours faithfully,

${d["Complainant Name"] || "___________________"}
Signature: ___________________
Date: ${d["Incident Date"] || "[Date]"}

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before filing.]`,
  },
  {
    id: "consumer-complaint",
    name: "Consumer Complaint",
    category: "Document",
    description:
      "Consumer complaint before the Consumer Disputes Redressal Commission.",
    fields: [
      {
        label: "Complainant Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Opposite Party Name",
        placeholder: "Name of company/seller/service provider",
        required: true,
      },
      {
        label: "Product/Service",
        placeholder: "Product or service availed",
        required: true,
      },
      {
        label: "Amount Paid",
        placeholder: "Total amount paid in rupees",
        required: true,
      },
      {
        label: "Deficiency Details",
        placeholder: "Details of deficiency in service/product",
        type: "textarea",
        required: true,
      },
    ],
    generate: (d) => `CONSUMER COMPLAINT

Date: ${new Date().toLocaleDateString("en-IN")}

Before the District Consumer Disputes Redressal Commission

COMPLAINT UNDER THE CONSUMER PROTECTION ACT, 2019

Complainant: ${d["Complainant Name"] || "[Complainant Name]"}
Address: [Address]

Opposite Party: ${d["Opposite Party Name"] || "[Opposite Party Name]"}
Address: [Address]

SUBJECT: Complaint regarding deficiency in ${d["Product/Service"] || "[Product/Service]"} under the Consumer Protection Act, 2019

MOST RESPECTFULLY SHOWETH:

1. That the complainant purchased/availed ${d["Product/Service"] || "[Product/Service]"} from the opposite party for a total consideration of Rs. ${d["Amount Paid"] || "[Amount]"} (Rupees [Amount in words] only) on [Date of purchase/availing].

2. That the opposite party represented that [state representations made by the opposite party].

3. That the complainant paid Rs. ${d["Amount Paid"] || "[Amount]"} via [mode of payment].

4. That there is a deficiency in service/product in the following manner:
${d["Deficiency Details"] || "[Describe the deficiency in detail]"}

5. That the complainant raised a grievance on [Date] and despite repeated follow-ups, the opposite party has failed to resolve the issue.

6. That the complainant sent a legal notice dated [Date] to the opposite party but received no satisfactory response.

PRAYER

In view of the above facts, it is most respectfully prayed that this Hon'ble Commission may kindly:

(a) Direct the opposite party to [specific relief sought];
(b) Direct the opposite party to pay compensation of Rs. [Amount] for deficiency in service and mental agony;
(c) Direct the opposite party to pay cost of litigation;
(d) Pass such other or further orders as this Hon'ble Commission may deem fit in the interest of justice.

COMPLAINANT:
${d["Complainant Name"] || "___________________"}
Signature: ___________________

Date: ${new Date().toLocaleDateString("en-IN")}

VERIFICATION

I, ${d["Complainant Name"] || "[Complainant Name]"}, the complainant above-named, do hereby verify that the contents of paragraphs 1 to 6 are true and correct to the best of my knowledge and belief. No part of it is false, and nothing material has been concealed.

Verified at [Place] on this ${new Date().toLocaleDateString("en-IN")}.

COMPLAINANT:
${d["Complainant Name"] || "___________________"}
Signature: ___________________

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before filing.]`,
  },
  {
    id: "rti-application",
    name: "RTI Application",
    category: "Document",
    description: "Right to Information application under the RTI Act, 2005.",
    fields: [
      {
        label: "Applicant Name",
        placeholder: "Full legal name",
        required: true,
      },
      {
        label: "Applicant Address",
        placeholder: "Complete address",
        required: true,
      },
      {
        label: "Public Authority Name",
        placeholder: "Name of government department/authority",
        required: true,
      },
      {
        label: "Information Sought",
        placeholder: "Specific information being sought",
        type: "textarea",
        required: true,
      },
    ],
    generate: (d) => `RIGHT TO INFORMATION APPLICATION

Date: ${new Date().toLocaleDateString("en-IN")}

To,
The Central Public Information Officer (CPIO)
${d["Public Authority Name"] || "[Public Authority Name]"}
[Address]

From:
${d["Applicant Name"] || "[Applicant Name]"}
${d["Applicant Address"] || "[Address]"}

Subject: Request for information under Section 6 of the Right to Information Act, 2005

Sir/Madam,

1. I, ${d["Applicant Name"] || "[Applicant Name]"}, hereby request the following information under the Right to Information Act, 2005:

${d["Information Sought"] || "[Describe the specific information you are seeking in detail]"}

2. The information sought pertains to [specify the period/timeframe, if applicable].

3. I am a citizen of India and am entitled to the information under Section 6(1) of the RTI Act, 2005.

4. I am willing to pay the prescribed fee of Rs. 10 (Rupees Ten only) for obtaining the information. [If applicable: I am below the poverty line and request exemption from fee as per Section 6(1) of the RTI Act.]

5. I request that the information be provided in the following format: [Specify format - physical copy, electronic form, etc.]

6. If the information sought pertains to life or liberty of a person, I request that it be provided within 48 hours as per Section 7(1) of the RTI Act.

Thanking you,

${d["Applicant Name"] || "___________________"}
Signature: ___________________
Date: ${new Date().toLocaleDateString("en-IN")}

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. It does not constitute legal advice or a substitute for a professionally drafted document. Consult a practicing lawyer before filing.]`,
  },
];

const CATEGORIES = ["All", ...new Set(templates.map((t) => t.category))];

export default function TemplatesApp() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? templates
      : templates.filter((t) => t.category === activeCategory);

  const handleSelect = (t: Template) => {
    setSelectedTemplate(t);
    setFormData({});
  };

  const handleFieldChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const allRequiredFilled =
    selectedTemplate?.fields
      .filter((f) => f.required)
      .every((f) => formData[f.label]?.trim()) ?? false;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Contract Templates
          </h1>
          <p className="mt-3 text-sm text-white/50">
            Ready-to-use Indian legal contract templates. Fill in the blanks and
            download.
          </p>
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
                <div className="mb-2 text-xs font-medium text-white/30">
                  {t.category}
                </div>
                <h3 className="text-base font-semibold">{t.name}</h3>
                <p className="mt-2 text-sm text-white/40">{t.description}</p>
                <div className="mt-4 text-xs text-white/25 group-hover:text-white/40">
                  {t.fields.length} fields
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="mb-6 text-sm text-white/40 hover:text-white/60"
            >
              &larr; Back to templates
            </button>
            <h2 className="mb-1 text-xl font-semibold">
              {selectedTemplate.name}
            </h2>
            <p className="mb-6 text-sm text-white/40">
              {selectedTemplate.description}
            </p>

            <div className="space-y-4">
              {selectedTemplate.fields.map((field) => (
                <div key={field.label}>
                  <label className="mb-1 block text-xs font-medium text-white/50">
                    {field.label}{" "}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={formData[field.label] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.label, e.target.value)
                      }
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25"
                    />
                  ) : field.type === "date" ? (
                    <input
                      type="date"
                      value={formData[field.label] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.label, e.target.value)
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.label] || ""}
                      onChange={(e) =>
                        handleFieldChange(field.label, e.target.value)
                      }
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
