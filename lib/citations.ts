export type Citation = {
  type: "act" | "web";
  label: string;
  snippet: string;
  url?: string;
};

const ACT_YEARS: Record<string, string> = {
  "Bharatiya Nyaya Sanhita": "2023",
  "Bharatiya Nyaya Sanhita (BNS)": "2023",
  "Bharatiya Nagarik Suraksha Sanhita": "2023",
  "Bharatiya Nagarik Suraksha Sanhita (BNSS)": "2023",
  "Bharatiya Sakshya Adhiniyam": "2023",
  "Bharatiya Sakshya Adhiniyam (BSA)": "2023",
  "Indian Penal Code": "1860",
  "Code of Criminal Procedure": "1973",
  "Indian Evidence Act": "1872",
  "Code of Civil Procedure": "1908",
  "Indian Contract Act": "1872",
  "Negotiable Instruments Act": "1881",
  "Limitation Act": "1963",
  "Constitution of India": "1950",
};

export function formatCitation(cit: Citation): string {
  if (cit.type === "web") {
    return cit.url ? cit.label : `${cit.label} (web source)`;
  }

  const label = cit.label.replace(/\(Section[s]? \d+(?:[a-z])?[^)]*\)/i, "").trim();
  const secMatch = cit.label.match(/\(Section[s]? (\d+(?:[a-z])?(?:[-–—]\d+(?:[a-z])?)?)[^)]*\)/i);

  let actName = label;
  let year = "";
  for (const [name, y] of Object.entries(ACT_YEARS)) {
    if (label.toLowerCase().includes(name.toLowerCase())) {
      actName = name;
      year = y;
      break;
    }
  }

  const actWithYear = year ? `${actName}, ${year}` : actName;
  if (secMatch) {
    return `The ${actWithYear}, s. ${secMatch[1]}`;
  }
  return `The ${actWithYear}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}