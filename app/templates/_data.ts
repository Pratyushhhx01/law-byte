export type TemplatePreview = {
  id: string;
  name: string;
  category: string;
  description: string;
};

export const templatePreviews: TemplatePreview[] = [
  {
    id: "rental",
    name: "Rental / Lease Agreement",
    category: "Property",
    description:
      "Standard residential rental agreement under the Transfer of Property Act, 1882.",
  },
  {
    id: "employment",
    name: "Employment Contract",
    category: "Employment",
    description:
      "Standard employment agreement under the Indian Contract Act, 1872 and Labour Codes.",
  },
  {
    id: "nda",
    name: "Non-Disclosure Agreement (NDA)",
    category: "Business",
    description:
      "Confidentiality agreement for protecting sensitive business information.",
  },
  {
    id: "partnership",
    name: "Partnership Deed",
    category: "Business",
    description:
      "Partnership deed for forming a firm under the Indian Partnership Act, 1932.",
  },
  {
    id: "poa",
    name: "Power of Attorney (General)",
    category: "General",
    description:
      "General power of attorney under the Power of Attorney Act, 1882.",
  },
  {
    id: "sale-deed",
    name: "Sale Deed (Immovable Property)",
    category: "Property",
    description:
      "Property sale deed under the Transfer of Property Act, 1882 and Registration Act, 1908.",
  },
  {
    id: "will",
    name: "Will",
    category: "Document",
    description:
      "Last Will and Testament under the Indian Succession Act, 1925.",
  },
  {
    id: "affidavit",
    name: "Affidavit",
    category: "Document",
    description: "Sworn affidavit for use in courts and official proceedings.",
  },
  {
    id: "petition",
    name: "Petition / Plaint",
    category: "Document",
    description: "Civil suit plaint for filing in appropriate courts.",
  },
  {
    id: "legal-notice",
    name: "Legal Notice",
    category: "Document",
    description: "Formal legal notice before initiating court proceedings.",
  },
  {
    id: "fir-draft",
    name: "FIR Draft",
    category: "Document",
    description:
      "First Information Report draft under Bharatiya Nagarik Suraksha Sanhita, 2023.",
  },
  {
    id: "consumer-complaint",
    name: "Consumer Complaint",
    category: "Document",
    description:
      "Consumer complaint before the Consumer Disputes Redressal Commission.",
  },
  {
    id: "rti-application",
    name: "RTI Application",
    category: "Document",
    description: "Right to Information application under the RTI Act, 2005.",
  },
];
