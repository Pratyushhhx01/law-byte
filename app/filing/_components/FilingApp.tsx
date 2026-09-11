"use client";

import { useState } from "react";
import { exportAsWord, exportAsPdf } from "@/lib/export";
import { AUTHORITIES, type Authority } from "@/lib/authorities";

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
  authorityId?: string;
}

const filingGuides: FilingGuide[] = [
  {
    id: "consumer-complaint",
    name: "Consumer Complaint",
    description:
      "File a complaint in the Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.",
    icon: "M3 3h18v18H3V3zm4 7h8M7 11h8M7 15h5",
    estimatedTime: "20-25 minutes",
    requirements: [
      "Proof of purchase (bill, invoice, receipt)",
      "Defect/grievance evidence (photos, communications)",
      "Identity proof",
      "Court fee (based on claim value)",
    ],
    steps: [
      {
        title: "Determine Jurisdiction",
        detail:
          "File at the appropriate level: District (claims up to Rs. 50 Lakhs), State (Rs. 50L-2 Crores), or National (above Rs. 2 Crores) Commission.",
        tip: "The complaint can be filed where you reside or where the opposite party's office is located.",
      },
      {
        title: "Gather Evidence",
        detail:
          "Collect all bills, invoices, warranties, communication records, photos, and any evidence of the deficiency in service or defect in goods.",
        tip: "Keep original documents safe and attach copies with the complaint.",
      },
      {
        title: "Draft the Complaint",
        detail:
          "Draft the complaint with clear facts, deficiency details, and the relief sought. Use the template provided.",
        tip: "Be specific about dates, amounts, and the deficiency you experienced.",
      },
      {
        title: "Pay Court Fee",
        detail:
          "Pay the prescribed court fee based on the value of the claim. Up to Rs. 5L: Nil. Rs. 5-10L: Rs. 200. Rs. 10-20L: Rs. 400. Rs. 20-50L: Rs. 1,000.",
        tip: "Fee scales are available on the e-Jagriti portal.",
      },
      {
        title: "File the Complaint",
        detail:
          "File online at e-jagriti.gov.in (Aadhaar OTP required) or physically at the appropriate consumer commission.",
        tip: "File within 2 years of the cause of action.",
      },
      {
        title: "Attend Hearings",
        detail:
          "Attend all hearings. The commission may direct mediation or proceed with evidence. The complaint should be disposed of within 3-5 months.",
        tip: "You can engage a lawyer or appear in person.",
      },
    ],
    docFields: [
      { label: "Complainant Name", required: true },
      { label: "Complainant Address", required: true },
      { label: "Father/Spouse Name", placeholder: "Optional" },
      { label: "Opposite Party Name", required: true },
      { label: "Opposite Party Address", required: true },
      { label: "Product/Service", required: true },
      { label: "Purchase Date", required: true },
      { label: "Amount Paid", required: true },
      { label: "Claim Amount", placeholder: "If different from amount paid" },
      { label: "Bill/Invoice Number", placeholder: "Optional" },
      { label: "Deficiency Details", required: true },
      { label: "Relief Sought", required: true },
    ],
    authorityId: "e-jagriti",
    generateDocument: (d) => {
      const amountPaid = Number(d["Amount Paid"]) || 0;
      let commission = "District";
      if (amountPaid > 20000000) commission = "National";
      else if (amountPaid > 5000000) commission = "State";

      return `CONSUMER COMPLAINT

Date: ${new Date().toLocaleDateString("en-IN")}

To,
The ${commission} Consumer Disputes Redressal Commission,
[District/City, State]

Complaint No.: __________

In the matter of:
${d["Complainant Name"] || "[Complainant Name]"}${d["Father/Spouse Name"] ? `, ${d["Father/Spouse Name"]}` : ""}, residing at ${d["Complainant Address"] || "[Address]"} — Complainant
Vs.
${d["Opposite Party Name"] || "[Opposite Party Name]"}, having its registered office at ${d["Opposite Party Address"] || "[Address]"} — Opposite Party

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019

Subject: Complaint regarding deficiency in service concerning ${d["Product/Service"] || "[Product/Service]"} under the Consumer Protection Act, 2019

Sir/Madam,

1. The complainant is ${d["Complainant Name"] || "[Name]"}, son/daughter/wife of ${d["Father/Spouse Name"] || "[Father/Spouse Name]"}, residing at ${d["Complainant Address"] || "[Address]"}. The complainant is a "Consumer" under Section 2(7) of the Consumer Protection Act, 2019.

2. The opposite party is ${d["Opposite Party Name"] || "[Company Name]"}, a firm/company engaged in the business of ${d["Product/Service"] || "[business]"}, having its registered office at ${d["Opposite Party Address"] || "[Address]"}.

3. The complainant purchased or availed ${d["Product/Service"] || "[Product/Service]"} from the opposite party on ${d["Purchase Date"] || "[Date]"} for a consideration of Rs. ${d["Amount Paid"] || "[Amount]"}${d["Bill/Invoice Number"] ? `, vide Bill/Invoice No. ${d["Bill/Invoice Number"]}` : ""}, for personal use.

4. The deficiency in service or defect in goods is as follows:
${d["Deficiency Details"] || "[Describe the deficiency in detail]"}

5. Despite repeated requests and reminders made by the complainant, the opposite party has failed to address the grievance, which amounts to deficiency in service and unfair trade practice as defined under the Consumer Protection Act, 2019.

6. A legal notice was served upon the opposite party on [Date], but the opposite party has failed to respond or resolve the grievance within the stipulated period.

7. The cause of action arose on ${d["Purchase Date"] || "[Date]"} at [Place] and this Commission has the jurisdiction to entertain this complaint as the value of the subject matter is within its pecuniary limits.

8. The total claim value (Rs. ${d["Amount Paid"] || "[Amount]"} + compensation claimed) falls within the pecuniary jurisdiction of this ${commission} Commission.

The complainant therefore prays for the following reliefs under the Consumer Protection Act, 2019:

(a) Direct the opposite party to ${d["Relief Sought"] || "[Primary relief sought]"}
(b) Award compensation of Rs. [Amount] for mental agony and harassment suffered
(c) Award cost of litigation
(d) Pass any other order deemed fit in the circumstances

Verification:
I, ${d["Complainant Name"] || "[Name]"}, do hereby verify that the contents of paragraphs 1 to 8 are true and correct to my personal knowledge, and no part of it is false. Verified at [District] on this ${new Date().getDate()}th day of ${new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}.

Yours faithfully,
${d["Complainant Name"] || "[Name]"}
Date: ${new Date().toLocaleDateString("en-IN")}

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. Consult a practicing lawyer before filing.]`;
    },
  },
  {
    id: "nch-grievance",
    name: "Consumer Grievance (NCH)",
    description:
      "Register a pre-litigation consumer grievance with the National Consumer Helpline before approaching the consumer court.",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    estimatedTime: "10-15 minutes",
    requirements: [
      "Details of the company/service provider",
      "Proof of purchase (bill, receipt)",
      "Communication records with the company",
    ],
    steps: [
      {
        title: "Why NCH First?",
        detail:
          "NCH is a pre-litigation step. It is free and faster than going to court. NCH mediates between you and the company to resolve the grievance within 45 days.",
        tip: "65% of grievances are resolved through NCH without needing court proceedings.",
      },
      {
        title: "Register on the Portal",
        detail:
          "Visit consumerhelpline.gov.in and register with your email and phone. You will receive an OTP for verification.",
        tip: "You can also call the toll-free number 1800-11-4000 or 1915.",
      },
      {
        title: "Lodge Your Grievance",
        detail:
          "Select the category of your complaint, enter company details, describe the deficiency, and upload supporting documents.",
        tip: "Be specific about dates, amounts, and what resolution you want.",
      },
      {
        title: "Track & Follow Up",
        detail:
          "Note your Docket Number. NCH will forward your grievance to the company. Track status on the portal. Resolution typically takes up to 45 days.",
        tip: "If not resolved, you can then approach the Consumer Commission.",
      },
    ],
    docFields: [
      { label: "Your Name", required: true },
      { label: "Your Email", required: true },
      { label: "Your Phone", required: true },
      { label: "Company Name", required: true },
      { label: "Product/Service", required: true },
      { label: "Purchase Date", required: true },
      { label: "Amount Paid", required: true },
      { label: "Grievance Details", required: true },
      { label: "Resolution Sought", required: true },
    ],
    authorityId: "nch",
    generateDocument: (d) => `CONSUMER GRIEVANCE — NATIONAL CONSUMER HELPLINE

Date: ${new Date().toLocaleDateString("en-IN")}

To,
The National Consumer Helpline (NCH),
Department of Consumer Affairs, Government of India

From: ${d["Your Name"] || "[Name]"}
Email: ${d["Your Email"] || "[Email]"}
Phone: ${d["Your Phone"] || "[Phone]"}

Subject: Consumer Grievance against ${d["Company Name"] || "[Company]"}

Sir/Madam,

I wish to register the following consumer grievance for mediation:

1. COMPLAINANT DETAILS
Name: ${d["Your Name"] || "[Name]"}
Email: ${d["Your Email"] || "[Email]"}
Phone: ${d["Your Phone"] || "[Phone]"}

2. COMPANY/SERVICE PROVIDER
Company: ${d["Company Name"] || "[Company Name]"}

3. PRODUCT/SERVICE DETAILS
Product/Service: ${d["Product/Service"] || "[Product/Service]"}
Purchase Date: ${d["Purchase Date"] || "[Date]"}
Amount Paid: Rs. ${d["Amount Paid"] || "[Amount]"}

4. GRIEVANCE
${d["Grievance Details"] || "[Describe the deficiency in detail]"}

5. RESOLUTION SOUGHT
${d["Resolution Sought"] || "[What resolution do you want?]"}

6. SUPPORTING DOCUMENTS
Attached: Bill/Invoice, Communication Records, Evidence

I request the NCH to take up this grievance with the concerned company and facilitate an early resolution as per the Consumer Protection Act, 2019.

Yours faithfully,
${d["Your Name"] || "[Name]"}
Date: ${new Date().toLocaleDateString("en-IN")}

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. Consult a practicing lawyer before filing.]`,
  },
  {
    id: "rti",
    name: "RTI Application",
    description:
      "File a Right to Information application under the RTI Act, 2005 to any central government public authority.",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    estimatedTime: "10-15 minutes",
    requirements: [
      "Proof of identity (Aadhaar, PAN, etc.)",
      "Address proof",
      "Prescribed fee (Rs. 10 for Indian citizens)",
    ],
    steps: [
      {
        title: "Identify the Public Authority",
        detail:
          "Determine which government department or public authority holds the information you need.",
        tip: "Check the official website for the correct CPIO details.",
      },
      {
        title: "Draft the Application",
        detail:
          "Write a clear application addressed to the CPIO. Mention the specific information you seek.",
        tip: "Be precise and avoid vague requests.",
      },
      {
        title: "Pay the Fee",
        detail:
          "Pay Rs. 10 via demand draft, postal order, or online. BPL card holders are exempt.",
        tip: "SC/ST applicants get fee waiver.",
      },
      {
        title: "Submit Online",
        detail:
          "File online at rtionline.gov.in for central government bodies. The CPIO must respond within 30 days.",
        tip: "If no response, file a first appeal to the appellate authority.",
      },
    ],
    docFields: [
      { label: "Applicant Name", required: true },
      { label: "Applicant Address", required: true },
      { label: "Applicant ID Proof", placeholder: "Aadhaar / PAN number" },
      { label: "Applicant Email", required: true },
      { label: "Public Authority Name", required: true },
      { label: "CPIO Name", placeholder: "If known" },
      { label: "Information Sought", required: true },
    ],
    authorityId: "rti-online",
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

The information may be provided to me at the above address or via email at ${d["Applicant Email"] || "[email address]"}.

I am ready to pay the prescribed fee of Rs. 10 for providing the information as per the RTI Rules, 2012.

If the information sought is exempted under Sections 8 or 9 of the Act, kindly inform me of the same along with the grounds of exemption and the appellate authority details.

Thanking you,

${d["Applicant Name"] || "[Name]"}
Date: ${new Date().toLocaleDateString("en-IN")}
Place: [City]

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. Consult a practicing lawyer before filing.]`,
  },
  {
    id: "cybercrime",
    name: "Cyber Crime Complaint",
    description:
      "Report a cybercrime to the National Cyber Crime Reporting Portal (cybercrime.gov.in).",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    estimatedTime: "15-20 minutes",
    requirements: [
      "Details of the cybercrime incident",
      "Evidence (screenshots, chat logs, transaction records)",
      "Suspect details (if known)",
    ],
    steps: [
      {
        title: "Visit the Portal",
        detail:
          "Go to cybercrime.gov.in and click 'Report Cyber Crime'. Select the appropriate category.",
        tip: "For financial fraud, also call helpline 1930 immediately.",
      },
      {
        title: "Enter Incident Details",
        detail:
          "Provide: when the crime occurred, what happened, which platform/website was involved.",
        tip: "Be as specific as possible about dates, times, and URLs.",
      },
      {
        title: "Provide Suspect Details",
        detail:
          "If you know the suspect: name, mobile number, email, wallet ID, website URL.",
        tip: "Even partial information helps the investigation.",
      },
      {
        title: "Upload Evidence",
        detail:
          "Upload screenshots, chat logs, transaction records, emails — anything that supports your complaint.",
        tip: "Keep originals safe. Upload clear copies.",
      },
      {
        title: "Submit & Track",
        detail:
          "Submit and note the complaint reference number. You can track status on the portal.",
        tip: "For financial frauds, report within 1 hour for best chance of fund recovery.",
      },
    ],
    docFields: [
      { label: "Your Name", required: true },
      { label: "Your Email", required: true },
      { label: "Your Phone", required: true },
      {
        label: "Crime Type",
        required: true,
        placeholder: "e.g., Financial Fraud, Identity Theft, Cyber Stalking",
      },
      { label: "Crime Date", required: true },
      { label: "Crime Details", required: true },
      { label: "Suspect Name", placeholder: "If known" },
      { label: "Suspect Contact", placeholder: "Phone / Email / Wallet ID" },
      { label: "Platform/Website", placeholder: "Where the crime occurred" },
      { label: "Amount Lost", placeholder: "If financial fraud" },
    ],
    generateDocument: (d) => `CYBER CRIME COMPLAINT

Date: ${new Date().toLocaleDateString("en-IN")}

To,
The Station House Officer / Investigating Officer,
[Local Police Station / Cyber Crime Cell]
[District/City]

From: ${d["Your Name"] || "[Name]"}
Email: ${d["Your Email"] || "[Email]"}
Phone: ${d["Your Phone"] || "[Phone]"}

Subject: Report of Cybercrime — ${d["Crime Type"] || "[Type of Cybercrime]"}

Sir/Madam,

I, ${d["Your Name"] || "[Name]"}, son/daughter of [Father's Name], residing at [Address], wish to report the following cybercrime:

1. INCIDENT DETAILS
Date of Incident: ${d["Crime Date"] || "[Date]"}
Type of Crime: ${d["Crime Type"] || "[Type]"}
Platform/Website: ${d["Platform/Website"] || "[Platform]"}

2. DETAILS OF THE CRIME
${d["Crime Details"] || "[Describe what happened in detail]"}

3. SUSPECT DETAILS (if known)
Name: ${d["Suspect Name"] || "Unknown"}
Contact: ${d["Suspect Contact"] || "Not available"}

4. FINANCIAL LOSS (if applicable)
Amount Lost: Rs. ${d["Amount Lost"] || "N/A"}

5. EVIDENCE
The following evidence is available: screenshots, chat logs, transaction records, and other digital evidence as uploaded/submitted.

6. ACTION REQUESTED
I request you to:
(a) Register an FIR under the relevant provisions of the Bharatiya Nyaya Sanhita, 2023 and the Information Technology Act, 2000
(b) Investigate the matter and take appropriate action against the accused
(c) Direct the concerned platform/bank to freeze the suspect accounts and recover the defrauded funds

I attest that the above information is true and correct to the best of my knowledge and belief.

Yours faithfully,
${d["Your Name"] || "[Name]"}
Contact: ${d["Your Phone"] || "[Phone]"}

[DISCLAIMER: This document is an AI-generated draft for reference purposes only. Consult a practicing lawyer before filing.]`,
  },
  {
    id: "fir-draft",
    name: "FIR Draft",
    description:
      "Draft a First Information Report (FIR) to lodge a police complaint for a cognizable offence.",
    icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
    estimatedTime: "15-20 minutes",
    requirements: [
      "Details of the incident (date, time, place)",
      "Description of the accused (if known)",
      "List of witnesses",
      "Evidence available (if any)",
    ],
    steps: [
      {
        title: "Identify the Police Station",
        detail:
          "FIR must be filed at the police station under whose jurisdiction the offence occurred. Zero FIR can be filed at any police station.",
        tip: "Under BNSS 2023, Zero FIR can be filed at any police station regardless of jurisdiction.",
      },
      {
        title: "Draft the FIR",
        detail:
          "Write the facts of the incident clearly: what happened, when, where, who was involved, and which offence was committed.",
        tip: "Stick to facts. Do not embellish or guess.",
      },
      {
        title: "Submit to SHO",
        detail:
          "Submit the draft to the Station House Officer (SHO). The SHO is duty-bound to register the FIR for cognizable offences.",
        tip: "If the SHO refuses, approach the SP or file a complaint online.",
      },
      {
        title: "Get the FIR Copy",
        detail:
          "The FIR must be registered and a copy provided to you free of charge.",
        tip: "Under BNSS 2023, e-FIR provisions allow filing online for certain offences.",
      },
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
      {
        label: "Evidence Available",
        placeholder: "FIR copy, medical reports, etc.",
      },
    ],
    authorityId: "police",
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
    description:
      "Send a formal legal notice before initiating legal proceedings.",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    estimatedTime: "15-20 minutes",
    requirements: [
      "Details of the sender and recipient",
      "Facts of the dispute",
      "Relief/demand to be made",
    ],
    steps: [
      {
        title: "Identify the Grounds",
        detail:
          "Clearly identify the legal grounds for sending the notice. What is the grievance? What law or right has been violated?",
        tip: "Consult the relevant bare act to identify specific sections.",
      },
      {
        title: "Draft the Notice",
        detail:
          "Draft the legal notice with clear facts, legal grounds, and the relief/demand.",
        tip: "Keep the tone formal and professional.",
      },
      {
        title: "Send via Speed Post",
        detail:
          "Send via Speed Post with acknowledgement due (AD card). This provides proof of delivery.",
        tip: "Keep the postal receipt and AD card safe as evidence.",
      },
      {
        title: "Wait for Response",
        detail:
          "Give a reasonable time (typically 15-30 days) for the recipient to respond or comply.",
        tip: "The notice period depends on the nature of the dispute.",
      },
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

type SendStep = "preview" | "credentials" | "sending" | "sent" | "portal-guide";

export default function FilingApp() {
  const [selected, setSelected] = useState<FilingGuide | null>(null);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Send flow state
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendStep, setSendStep] = useState<SendStep>("preview");
  const [sendFormData, setSendFormData] = useState<Record<string, string>>({});
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState<{
    messageId?: string;
    sentTo?: string;
  }>({});

  const handleSelect = (guide: FilingGuide) => {
    setSelected(guide);
    setStep(0);
    setFormData({});
  };

  const handleFieldChange = (label: string, value: string) => {
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const allRequiredFilled =
    selected?.docFields
      .filter((f) => f.required)
      .every((f) => formData[f.label]?.trim()) ?? false;

  const getAuthority = (): Authority | null => {
    if (!selected?.authorityId) return null;
    return AUTHORITIES[selected.authorityId] || null;
  };

  const handleOpenSend = () => {
    setSendStep("preview");
    setSendFormData({});
    setSendError("");
    setSendSuccess({});
    setShowSendModal(true);
  };

  const handleSendEmail = async () => {
    const authority = getAuthority();
    if (!authority || !selected) return;

    setSendStep("sending");
    setSendError("");

    try {
      const docContent = selected.generateDocument(formData);
      const res = await fetch("/api/filing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: authority.email,
          subject: `${selected.name} — ${formData["Complainant Name"] || formData["Your Name"] || formData["Applicant Name"] || "LawBite User"}`,
          documentContent: docContent,
          complaintType: selected.authorityId,
          userEmail:
            sendFormData["Your Email"] || sendFormData["Applicant Email"] || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.portalUrl) {
          setSendStep("portal-guide");
          return;
        }
        setSendError(data.error || "Failed to send email");
        setSendStep("preview");
        return;
      }

      setSendSuccess({
        messageId: data.messageId,
        sentTo: data.sentTo,
      });
      setSendStep("sent");
    } catch {
      setSendError("Network error. Please try again.");
      setSendStep("preview");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Filing Assistance
          </h1>
          <p className="mt-3 text-sm text-white/50">
            Draft your complaint, then email it to the authority or file online
            via the portal.
          </p>
        </div>

        {!selected ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filingGuides.map((guide) => {
              const authority = guide.authorityId
                ? AUTHORITIES[guide.authorityId]
                : null;
              return (
                <button
                  key={guide.id}
                  onClick={() => handleSelect(guide)}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-6 text-left transition-all hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      <svg
                        className="h-5 w-5 text-white/40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={guide.icon}
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{guide.name}</h3>
                      <span className="text-[11px] text-white/30">
                        {guide.estimatedTime}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-white/40">{guide.description}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-white/25 group-hover:text-white/40">
                    <span>{guide.steps.length} steps</span>
                    {authority?.email && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-400/80">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email
                      </span>
                    )}
                    {authority?.portalUrl && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400/80">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                        </svg>
                        Portal
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelected(null)}
              className="mb-6 text-sm text-white/40 hover:text-white/60"
            >
              &larr; Back to filing guides
            </button>

            <div className="mb-8">
              <h2 className="text-xl font-semibold">{selected.name}</h2>
              <p className="mt-2 text-sm text-white/50">
                {selected.description}
              </p>
              <p className="mt-1 text-xs text-white/30">
                Estimated time: {selected.estimatedTime}
              </p>
            </div>

            <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-3 text-sm font-semibold text-white/60">
                Requirements
              </h3>
              <ul className="space-y-2">
                {selected.requirements.map((req, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-white/50"
                  >
                    <span className="mt-0.5 text-emerald-400">&#10003;</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-sm font-semibold text-white/60">
                Steps
              </h3>
              <div className="space-y-4">
                {selected.steps.map((s, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border p-4 transition-colors ${i === step ? "border-white/20 bg-white/[0.05]" : "border-white/5 bg-white/[0.02]"}`}
                  >
                    <button
                      onClick={() => setStep(i)}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === step ? "bg-white/20 text-white" : "bg-white/5 text-white/30"}`}
                      >
                        {i + 1}
                      </div>
                      <span
                        className={`text-sm font-medium ${i === step ? "text-white" : "text-white/50"}`}
                      >
                        {s.title}
                      </span>
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
                            <button
                              onClick={() => setStep(i - 1)}
                              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/40 hover:text-white/60"
                            >
                              Previous
                            </button>
                          )}
                          {i < selected.steps.length - 1 ? (
                            <button
                              onClick={() => setStep(i + 1)}
                              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
                            >
                              Next Step
                            </button>
                          ) : (
                            <button
                              onClick={() => setStep(selected.steps.length)}
                              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/20"
                            >
                              Fill &amp; Generate
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
                <h3 className="mb-4 text-sm font-semibold text-white/60">
                  Fill in Your Details
                </h3>
                <div className="space-y-4">
                  {selected.docFields.map((field) => (
                    <div key={field.label}>
                      <label className="mb-1 block text-xs font-medium text-white/50">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={formData[field.label] || ""}
                        onChange={(e) =>
                          handleFieldChange(field.label, e.target.value)
                        }
                        placeholder={
                          field.placeholder ||
                          `Enter ${field.label.toLowerCase()}`
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    disabled={!allRequiredFilled}
                    onClick={() => {
                      const content = selected.generateDocument(formData);
                      exportAsWord(content, selected.name);
                    }}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 disabled:opacity-40"
                  >
                    Download Word
                  </button>
                  <button
                    disabled={!allRequiredFilled}
                    onClick={() => {
                      const content = selected.generateDocument(formData);
                      exportAsPdf(content, selected.name);
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:text-white/70 disabled:opacity-40"
                  >
                    Download PDF
                  </button>
                  {selected.authorityId && (
                    <button
                      disabled={!allRequiredFilled}
                      onClick={handleOpenSend}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
                    >
                      File &amp; Send &#8594;
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Send Modal ─── */}
      {showSendModal && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSendModal(false)}
        >
          <div
            className="animate-overlay-in mx-4 flex w-full max-w-lg flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <button
                onClick={() => setShowSendModal(false)}
                className="rounded-lg p-1 text-white/40 hover:text-white/70"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {sendStep === "preview" && "Preview & Send"}
                  {sendStep === "credentials" && "Your Details"}
                  {sendStep === "sending" && "Sending..."}
                  {sendStep === "sent" && "Sent Successfully"}
                  {sendStep === "portal-guide" && "File via Portal"}
                </h3>
                <p className="text-[11px] text-white/40">{selected.name}</p>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* PREVIEW STEP */}
              {sendStep === "preview" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-white/40">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      Document Preview
                    </div>
                    <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-white/[0.02] p-3 font-mono text-xs leading-relaxed text-white/60">
                      {selected.generateDocument(formData)}
                    </div>
                  </div>

                  {getAuthority() && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Send to: {getAuthority()!.name}
                      </div>
                      <p className="mt-1 text-xs text-white/40">
                        Email: {getAuthority()!.email}
                      </p>
                      {getAuthority()!.phone && (
                        <p className="text-xs text-white/40">
                          Helpline: {getAuthority()!.phone}
                        </p>
                      )}
                    </div>
                  )}

                  {sendError && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-400">
                      {sendError}
                    </div>
                  )}
                </div>
              )}

              {/* CREDENTIALS STEP */}
              {sendStep === "credentials" && (
                <div className="space-y-4">
                  <p className="text-xs text-white/40">
                    Enter your details for the email receipt:
                  </p>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-white/50">
                      Your Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={sendFormData["Your Email"] || ""}
                      onChange={(e) =>
                        setSendFormData((p) => ({
                          ...p,
                          "Your Email": e.target.value,
                        }))
                      }
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-white/50">
                      Additional Message (optional)
                    </label>
                    <textarea
                      value={sendFormData["Message"] || ""}
                      onChange={(e) =>
                        setSendFormData((p) => ({
                          ...p,
                          Message: e.target.value,
                        }))
                      }
                      placeholder="Any additional notes for the authority..."
                      rows={3}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25"
                    />
                  </div>
                </div>
              )}

              {/* SENDING STEP */}
              {sendStep === "sending" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  <p className="text-sm text-white/60">
                    Sending your document to {getAuthority()?.name}...
                  </p>
                </div>
              )}

              {/* SENT STEP */}
              {sendStep === "sent" && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center py-6">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-6 w-6 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-white">
                      Document sent successfully!
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      Sent to: {sendSuccess.sentTo || getAuthority()?.email}
                    </p>
                  </div>

                  {getAuthority() && (
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                      <h4 className="mb-2 text-sm font-medium text-blue-400">
                        For Official Filing — {getAuthority()!.portalName}
                      </h4>
                      <ol className="space-y-2">
                        {getAuthority()!.filingSteps.map((s, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-xs text-white/50"
                          >
                            <span className="shrink-0 text-blue-400/60">
                              {i + 1}.
                            </span>
                            {s}
                          </li>
                        ))}
                      </ol>
                      <a
                        href={getAuthority()!.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                      >
                        Open {getAuthority()!.portalName}
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  )}

                  {getAuthority()?.feeStructure && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <h4 className="mb-2 text-xs font-semibold text-white/60">
                        Court Fee Structure
                      </h4>
                      <div className="space-y-1">
                        {getAuthority()!.feeStructure!.map((f, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-xs text-white/40"
                          >
                            <span>{f.range}</span>
                            <span className="text-white/60">{f.fee}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PORTAL-GUIDE STEP (when email not available) */}
              {sendStep === "portal-guide" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                    <p className="text-sm text-amber-400">
                      This complaint type does not support email filing. Please
                      file directly via the portal.
                    </p>
                  </div>

                  {getAuthority() && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <h4 className="mb-2 text-sm font-medium text-white">
                        {getAuthority()!.portalName} — Filing Guide
                      </h4>
                      <ol className="space-y-2">
                        {getAuthority()!.filingSteps.map((s, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-xs text-white/50"
                          >
                            <span className="shrink-0 text-white/30">
                              {i + 1}.
                            </span>
                            {s}
                          </li>
                        ))}
                      </ol>
                      <a
                        href={getAuthority()!.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                      >
                        Open {getAuthority()!.portalName}
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                  )}

                  {getAuthority()?.feeStructure && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <h4 className="mb-2 text-xs font-semibold text-white/60">
                        Fee Structure
                      </h4>
                      <div className="space-y-1">
                        {getAuthority()!.feeStructure!.map((f, i) => (
                          <div
                            key={i}
                            className="flex justify-between text-xs text-white/40"
                          >
                            <span>{f.range}</span>
                            <span className="text-white/60">{f.fee}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t border-white/10 px-5 py-4">
              {sendStep === "preview" && (
                <>
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white/70"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (getAuthority()?.email) {
                        setSendStep("credentials");
                      } else {
                        setSendStep("portal-guide");
                      }
                    }}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                  >
                    Continue &#8594;
                  </button>
                </>
              )}

              {sendStep === "credentials" && (
                <>
                  <button
                    onClick={() => setSendStep("preview")}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white/70"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={!sendFormData["Your Email"]?.trim()}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-40"
                  >
                    Send Now
                  </button>
                </>
              )}

              {sendStep === "sent" && (
                <>
                  <button
                    onClick={() => {
                      const content = selected.generateDocument(formData);
                      exportAsWord(content, selected.name);
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white/70"
                  >
                    Download Word
                  </button>
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                  >
                    Done
                  </button>
                </>
              )}

              {sendStep === "portal-guide" && (
                <>
                  <button
                    onClick={() => {
                      const content = selected.generateDocument(formData);
                      exportAsWord(content, selected.name);
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white/70"
                  >
                    Download Word
                  </button>
                  <button
                    onClick={() => {
                      const content = selected.generateDocument(formData);
                      exportAsPdf(content, selected.name);
                    }}
                    className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/50 hover:text-white/70"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowSendModal(false)}
                    className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
                  >
                    Close
                  </button>
                </>
              )}

              {sendStep === "sending" && null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
