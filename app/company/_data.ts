export type CompanyPageMeta = {
  slug: string;
  label: string;
  href: string;
  title: string;
  description: string;
};

export const companyPages: CompanyPageMeta[] = [
  {
    slug: "about",
    label: "About",
    href: "/about",
    title: "About Lawbite",
    description:
      "Making Indian law accessible, understandable, and actionable for everyone.",
  },
  {
    slug: "contact",
    label: "Contact",
    href: "/contact",
    title: "Get in Touch",
    description:
      "Have a question, suggestion, or need support? We'd love to hear from you.",
  },
];

export function getCompanyPage(slug: string): CompanyPageMeta | undefined {
  return companyPages.find((p) => p.slug === slug);
}
