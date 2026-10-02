export type FilingGuidePreview = {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
};

export const filingGuidePreviews: FilingGuidePreview[] = [
  {
    id: "consumer",
    name: "Consumer Complaint",
    description:
      "File a complaint in the Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.",
    estimatedTime: "20-25 minutes",
  },
  {
    id: "nch-grievance",
    name: "Consumer Grievance (NCH)",
    description:
      "Register a pre-litigation consumer grievance with the National Consumer Helpline before approaching the consumer court.",
    estimatedTime: "10-15 minutes",
  },
  {
    id: "rti",
    name: "RTI Application",
    description:
      "File a Right to Information application under the RTI Act, 2005 to any central government public authority.",
    estimatedTime: "10-15 minutes",
  },
  {
    id: "cybercrime",
    name: "Cyber Crime Complaint",
    description:
      "Report online harassment, leaked or morphed intimate images, fake profiles, financial fraud and other cybercrimes on the National Cyber Crime Reporting Portal (cybercrime.gov.in).",
    estimatedTime: "15-20 minutes",
  },
  {
    id: "fir",
    name: "FIR Draft",
    description:
      "Draft a First Information Report (FIR) to lodge a police complaint for a cognizable offence.",
    estimatedTime: "15-20 minutes",
  },
];
