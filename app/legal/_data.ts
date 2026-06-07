export type LegalPageMeta = {
  slug: string;
  label: string;
  href: string;
  title: string;
  description: string;
};

export const legalPages: LegalPageMeta[] = [
  {
    slug: "privacy",
    label: "Privacy",
    href: "/legal/privacy",
    title: "Privacy Policy",
    description:
      "How we collect, use, store, and protect information when you use Lawbite.",
  },
  {
    slug: "disclaimer",
    label: "Disclaimer",
    href: "/legal/disclaimer",
    title: "Disclaimer",
    description:
      "Limitations of liability, no legal advice, and the boundaries of the information we provide.",
  },
  {
    slug: "terms",
    label: "Terms of Service",
    href: "/legal/terms",
    title: "Terms of Service",
    description:
      "The rules, rights, and responsibilities that govern your use of the Lawbite platform.",
  },
  {
    slug: "risk-closure",
    label: "Risk Closure",
    href: "/legal/risk-closure",
    title: "Risk Closure",
    description:
      "Acknowledgement of the inherent risks of using automated legal workflows and our shared responsibilities.",
  },
  {
    slug: "cookies",
    label: "Cookies",
    href: "/legal/cookies",
    title: "Cookies Policy",
    description:
      "The cookies and similar technologies we use, why we use them, and how you can manage them.",
  },
  {
    slug: "refund",
    label: "Refund",
    href: "/legal/refund",
    title: "Refund Policy",
    description:
      "Eligibility, timelines, and the process for requesting a refund of paid plans or one-off services.",
  },
];

export function getLegalPage(slug: string): LegalPageMeta | undefined {
  return legalPages.find((p) => p.slug === slug);
}
