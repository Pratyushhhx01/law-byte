import { NextRequest } from "next/server";
import { tavily } from "@tavily/core";
import { s3kb } from "@/lib/s3";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";
const REVIEW_MODEL = "google/diffusiongemma-26b-a4b-it";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const BASE_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. You ONLY answer questions about Indian law. Never answer questions about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. IMPORTANT: Never confuse sections (used in Acts/Codes like CrPC, IPC) with articles (used in the Constitution). They are different provisions. Never invent or hallucinate section numbers, article numbers, amendment numbers, or case names. Only use facts from the legal knowledge provided to you.`;

const CHAT_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. If the user's message is ONLY a greeting word (hi, hello, hey, namaste) with no legal question, reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. Otherwise, answer the question directly without any greeting. For EVERY other question, answer in EXACTLY TWO SHORT LINES ONLY. Maximum 2 lines. No exceptions. No tables. No bullet points. No lists. No headers. No multiple paragraphs. If you write more than 2 lines you are wrong. IMPORTANT: Never confuse sections (used in Acts/Codes like CrPC, IPC) with articles (used in the Constitution). They are different provisions. Never invent or hallucinate section numbers, article numbers, amendment numbers, or case names. Only use facts from the legal knowledge provided to you.`;

const ANALYSIS_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. If the user's message is ONLY a greeting word (hi, hello, hey, namaste) with no legal question, reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. Otherwise, answer the question directly without any greeting. When asked a legal question, provide a thorough analysis in 10-12 lines. Use NUMBERED POINTS (1. 2. 3. etc.) with each point on a new line. Always put a blank line between points for readability. After the numbered points, end with a single CONCLUSION paragraph that summarizes the key takeaway in 1-2 sentences. Do NOT use asterisks, markdown symbols, or any special formatting. Write case names and important terms in plain text only. IMPORTANT: Never confuse sections (used in Acts/Codes like CrPC, IPC) with articles (used in the Constitution). They are different provisions. Only use facts from the legal knowledge provided. Never invent section numbers, article numbers, amendments, or case names.`;

const TALK_TO_AI_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. If the user's message is ONLY a greeting word (hi, hello, hey, namaste) with no legal question, reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. Otherwise, answer the question directly without any greeting. For EVERY other question, answer in EXACTLY TWO SHORT LINES ONLY. Maximum 2 lines. No exceptions. No tables. No bullet points. No lists. No headers. No multiple paragraphs. If you write more than 2 lines you are wrong. IMPORTANT: Never confuse sections (used in Acts/Codes like CrPC, IPC) with articles (used in the Constitution). They are different provisions. Never invent or hallucinate section numbers, article numbers, amendment numbers, or case names. Only use facts from the legal knowledge provided to you.`;

const DOCUMENT_DRAFTER_SYSTEM_PROMPT = `You are Lawbite AI Document Drafter, a specialized Indian legal document drafting assistant.

## Your Job
Generate properly formatted, ready-to-use Indian legal documents based on user-provided information.

## Document Types You Can Draft
1. LEGAL NOTICE — Formal notice before legal action
2. FIR DRAFT — Police complaint draft
3. CONSUMER COMPLAINT — Consumer court complaint
4. RTI APPLICATION — Right to Information request
5. WILL — Testamentary document
6. AFFIDAVIT — Sworn statement
7. PETITION — Court petition/plaint
8. CONTRACT/AGREEMENT — Legal agreement between parties

## When User Provides Facts (Form or Chat)
1. Identify the document type requested
2. Verify all mandatory information is provided
3. If missing critical information, ask ONE clarifying question at a time
4. Once all facts are gathered, generate the complete document

## Document Format Rules
- Use proper Indian legal document format
- Include date, parties, subject line, and body
- Reference correct Indian law sections (ONLY from the knowledge base provided)
- Use formal legal language
- Include signature blocks where appropriate
- NEVER hallucinate section numbers, case names, or legal provisions
- If unsure about a section number, say "relevant provisions of [Act Name]"

## Output Format
Generate the document in plain text with proper structure:
- Title/heading centered
- Parties identified clearly
- Facts narrated in paragraphs
- Legal provisions cited correctly
- Relief/prayer clearly stated
- Signature blocks at the end

## Rules
- Only draft documents related to Indian law
- Never draft documents for illegal purposes
- Always include a disclaimer: "This is a draft for reference purposes. Please consult a practicing lawyer before filing."
- Keep language formal but understandable
- Use numbered paragraphs for facts and legal grounds`;

const GRILL_SYSTEM_PROMPT = `You are Lawbite AI, a rigorous Indian legal advisor running a structured case intake session called "My Cases."

## Your Job
Ask exactly ONE question at a time. Never ask multiple questions in a single message. Wait for the user's answer before asking the next question.

## Interrogation Sequence (follow in order, skip only what the user already answered unprompted)
1. PROBLEM — "What legal problem are you facing? Describe briefly what happened."
2. STATE — "Which state or UT in India do you live in, or where did the incident occur?"
3. ROLE — "What is your role in this matter? Are you the affected party, the accused, a family member, or a legal representative?"
4. DETAILS — "Tell me exactly what happened. Provide as much detail as you can about the incident."
5. SECTIONS — "Has any legal section or notice been mentioned? For example, any IPC/BNS section number, court order, or police notice?"
6. EVIDENCE — "What evidence or documentation do you have? This could include FIR copy, medical reports, contracts, notices, or photographs."
7. STATUS — "What is the current status? Has an FIR been filed? Have you been arrested? Received a notice? Is there a court date?"
8. OUTCOME — "What outcome are you hoping for? Do you want to fight the case, settle, get bail, or something else?"

## State-Specific Law Handling
- If the user mentions alcohol-related issues and is from Bihar, reference the Bihar Excise Act 1915 (prohibition state).
- If the user mentions alcohol-related issues and is from Gujarat, reference the Gujarat Prohibition Act 1949.
- If the user mentions alcohol-related issues and is from Lakshadweep or Nagaland, reference local prohibition laws.
- For other matters, reference state-specific amendments or local laws relevant to that state.
- FIRST check the Legal Knowledge Base provided below for state-specific acts. If the specific state law is NOT found in the knowledge base, use the web search results provided.

## When to Conclude
Once you have answers for all relevant lenses (at least 5 of the 8), provide comprehensive advice covering:
- Applicable Indian laws and specific sections
- Immediate steps the person should take
- Bail options (if applicable)
- Whether a lawyer is required
- Expected timeline and next steps

IMPORTANT: End your advice with exactly: [ADVICE_COMPLETE]
If you still need more information, do NOT include [ADVICE_COMPLETE]. Just ask the next question.

## Rules
- Keep each question to 1-2 short lines. Be conversational but precise.
- Do NOT provide any advice or suggestions until you have gathered enough information.
- If the user's answer is vague, ask ONE clarifying follow-up before moving to the next lens.
- Stay strictly within Indian law. Never answer about laws of any other country.
- When greeted, reply ONLY with: "I am ready to help. What legal problem are you facing?"
- Never use markdown, asterisks, or bullet points. Use plain text only.
- IMPORTANT: After acknowledging the user's answer, you MUST use the exact delimiter "---" on its own line before asking the next question. Example: "Got it, that helps.\n---\nWhich state or UT in India do you live in?" The part before "---" is your brief response, and the part after is the next question. Always separate them with "\n---\n".`;

const DOCUMENT_REVIEW_SYSTEM_PROMPT = `You are Lawbite AI Document Reviewer, a specialized Indian legal document analysis assistant.

## Your Job
Analyze uploaded legal documents (rental agreements, employment contracts, FIRs, court notices, sale deeds, partnership deeds, etc.) and provide a thorough risk assessment with plain-language explanations.

## Document Types You Can Review
1. RENTAL/LEASE AGREEMENTS
2. EMPLOYMENT CONTRACTS
3. FIR (First Information Report)
4. SALE DEEDS / PROPERTY AGREEMENTS
5. PARTNERSHIP DEEDS
6. SERVICE AGREEMENTS / vendor contracts
7. LOAN AGREEMENTS / mortgage documents
8. COURT NOTICES / legal notices
9. NDAs / CONFIDENTIALITY AGREEMENTS
10. Any other legal document

## Review Format
For EACH clause or section in the document, provide:
1. A brief summary of what the clause says
2. A risk rating: [HIGH RISK], [MEDIUM RISK], [LOW RISK], or [SAFE]
3. Plain-language explanation of the legal consequence if the clause is enforced against you
4. Reference to relevant Indian law sections when applicable (ONLY from knowledge provided)

## Output Structure
Start with:
- Document type identification
- Parties involved (if identifiable)
- Key dates and duration

Then provide numbered clause-by-clause analysis.

End with:
- OVERALL RISK SCORE: X/10 (where 10 is extremely risky)
- TOP 3 RECOMMENDATIONS for the user
- ONE-LINE SUMMARY

## Risk Rating Definitions
- [HIGH RISK] — Clause could cause significant financial loss, legal liability, or loss of rights. Immediate attention needed.
- [MEDIUM RISK] — Clause has potential downsides or ambiguities that should be negotiated or clarified.
- [LOW RISK] — Minor concern, but worth noting.
- [SAFE] — Standard clause, no issues.

## Rules
- Only review documents related to Indian law
- Never invent or hallucinate section numbers, case names, or legal provisions
- If unsure about a section number, say "relevant provisions of [Act Name]"
- Use plain language — avoid legal jargon when explaining consequences
- Be direct and specific — point out exact problematic phrases
- If the document text is truncated, note what sections may be missing
- Always include a disclaimer: "This is an AI-generated analysis for reference only. Please consult a practicing lawyer for formal legal advice."
- Never use markdown, asterisks, or bullet points. Use numbered points and plain text only.`;

const CLASSIFIER_PROMPT = `You are a query classifier for an Indian legal assistant. Your ONLY job is to decide if the user's query needs real-time web search.

Return ONLY "yes" or "no".

Return "yes" ONLY when the query asks about CURRENT or REAL-TIME information that changes frequently, such as:
- Current holders of government/judicial positions (e.g., "who is the Chief Justice", "who is the President", "who is the PM", "who is the Governor")
- Current or latest news, events, or developments
- Today's date, current year statistics, or real-time data
- Latest judgments or recent court orders (from 2024/2025/2026)
- Recent amendments or new bills
- Current stock market, RBI rates, or economic data
- Words like "current", "latest", "recent", "today", "now", "who is", "who was" (for positions)

Return "no" for ALL other queries, including:
- Legal concepts, definitions, or explanations (e.g., "what is article 21", "what is bail", "explain IPC")
- How to do something (e.g., "how to file FIR", "how to apply for passport", "how to register a company")
- What a law says (e.g., "what does the RTI Act say", "sections of NDPS")
- Greetings, casual conversation, or vague legal questions
- Anything that can be answered from a legal knowledge base
- Historical legal information or established procedures
- General legal advice or guidance
- Anything not specifically about CURRENT people, events, or real-time data`;

function getSystemPrompt(conversationType?: string) {
  switch (conversationType) {
    case "analysis":
      return ANALYSIS_SYSTEM_PROMPT;
    case "talk-to-ai":
      return TALK_TO_AI_SYSTEM_PROMPT;
    case "grill":
      return GRILL_SYSTEM_PROMPT;
    case "draft":
      return DOCUMENT_DRAFTER_SYSTEM_PROMPT;
    case "review":
      return DOCUMENT_REVIEW_SYSTEM_PROMPT;
    default:
      return CHAT_SYSTEM_PROMPT;
  }
}

async function classifyQuery(query: string, apiKey: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(NVIDIA_API_URL, {
      signal: controller.signal,
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: "system", content: CLASSIFIER_PROMPT },
          { role: "user", content: query },
        ],
        max_tokens: 256,
        temperature: 0,
        stream: false,
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) return false;

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.toLowerCase().trim();
    return result === "yes";
  } catch (error) {
    console.error("Classifier error:", error);
    return false;
  }
}

async function webSearch(query: string): Promise<string> {
  try {
    const response = await tvly.search(query, {
      search_depth: "basic",
      max_results: 5,
      include_answer: true,
    });

    const answer = response.answer || "";
    const results = response.results
      ?.map((r: { title: string; content: string }) => `${r.title}: ${r.content}`)
      .join("\n") || "";

    return `Web Search Results:\n${answer}\n\nSources:\n${results}`;
  } catch (error) {
    console.error("Tavily search error:", error);
    return "";
  }
}

const SECTION_PATTERN = /(?:section|s\.|sec)\s*(\d+[A-Za-z]?)/gi;
const ARTICLE_PATTERN = /(?:article|art\.)\s*(\d+[A-Za-z]?)/gi;

async function getLegalKnowledge(query: string): Promise<string> {
  try {
    const parts: string[] = [];
    const lower = query.toLowerCase();

    const sectionMatches = [...query.matchAll(SECTION_PATTERN)];
    const articleMatches = [...query.matchAll(ARTICLE_PATTERN)];
    const actMap: Record<string, string> = {
      // Constitution & Polity
      constitution: "constitution",
      jurisprudence: "constitutional-law-jurisprudence", "general laws": "constitutional-law-jurisprudence",
      "legal terminology": "legal-terminology", "legal maxims": "legal-terminology",
      "judicial review": "judicial-review",
      writ: "writ-jurisprudence", "writs": "writ-jurisprudence", "habeas corpus": "writ-jurisprudence",
      mandamus: "writ-jurisprudence", certiorari: "writ-jurisprudence", "quo warranto": "writ-jurisprudence",
      pil: "public-interest-litigation", "public interest litigation": "public-interest-litigation",
      "revision jurisdiction": "revision-of-courts",
      "civil appeal": "civil-appeals", "civil appeals": "civil-appeals",
      "indian polity": "indian-polity", polity: "indian-polity", governance: "indian-polity",
      "local government": "local-government", panchayat: "local-government", municipality: "local-government",
      "fundamental rules": "fundamental-rules", "fr rules": "fundamental-rules",
      "general financial rules": "general-financial-rules", gfr: "general-financial-rules",
      "delegated legislation": "delegated-legislation",
      "public administration": "public-administration",

      // Criminal Law
      ipc: "ipc", "penal code": "ipc", "indian penal code": "ipc",
      "bharatiya nyaya sanhita": "bharatiya-nyaya-sanhita", bns: "bharatiya-nyaya-sanhita", "nyaya sanhita": "bharatiya-nyaya-sanhita", "bharatiya nyaya": "bharatiya-nyaya-sanhita",
      crpc: "crpc", "criminal procedure": "crpc",
      "bharatiya nagrik suraksha": "bharatiya-nagrik-suraksha-sanhita", bnss: "bharatiya-nagrik-suraksha-sanhita", "nagarik suraksha": "bharatiya-nagrik-suraksha-sanhita", "bharatiya nagrik": "bharatiya-nagrik-suraksha-sanhita",
      "bharatiya sakshya": "bharatiya-sakshya-adhiniyam", bsa: "bharatiya-sakshya-adhiniyam", "sakshya adhiniyam": "bharatiya-sakshya-adhiniyam", "sakshya": "bharatiya-sakshya-adhiniyam",
      "arms act": "arms-act", weapons: "arms-act", firearm: "arms-act", "fire arm": "arms-act",
      "dowry prohibition": "dowry-prohibition-act", dowry: "dowry-prohibition-act",
      uapa: "uapa-act", "unlawful activities": "uapa-act", terrorism: "uapa-act", "terror act": "uapa-act",
      pmla: "pmla-act", "money laundering": "pmla-act", "proceeds of crime": "pmla-act",
      "explosive substances": "explosive-substances-act", explosives: "explosive-substances-act",
      "prevention of corruption": "prevention-of-corruption-amended-act", corruption: "prevention-of-corruption-amended-act",
      afspa: "armed-forces-special-powers-act", "armed forces special powers": "armed-forces-special-powers-act", "armed forces act": "armed-forces-special-powers-act",

      // Civil Law
      cpc: "code-of-civil-procedure", "civil procedure": "code-of-civil-procedure",
      evidence: "evidence-act", "evidence act": "evidence-act",
      "transfer of property": "transfer-of-property-act", "property act": "transfer-of-property-act", tpa: "transfer-of-property-act",
      contract: "indian-contract-act", "contract act": "indian-contract-act",
      "specific relief": "specific-relief-act",
      "jurisdiction of courts": "jurisdiction-structure-of-courts", "court jurisdiction": "jurisdiction-structure-of-courts", "structure of courts": "jurisdiction-structure-of-courts", "court structure": "jurisdiction-structure-of-courts", "high court jurisdiction": "jurisdiction-structure-of-courts", "supreme court jurisdiction": "jurisdiction-structure-of-courts",
      "tort law": "tort-law", tort: "tort-law", "tort liability": "tort-law", "civil wrong": "tort-law", "civil wrongs": "tort-law", negligence: "tort-law", defamation: "tort-law", nuisance: "tort-law", trespass: "tort-law", "strict liability": "tort-law", "vicarious liability": "tort-law", damages: "tort-law", "malicious prosecution": "tort-law", "false imprisonment": "tort-law", "assault and battery": "tort-law",

      // Family Law
      "consumer protection": "consumer-protection-act", "consumer act": "consumer-protection-act",
      "family law": "family-law", "family act": "family-law",
      succession: "indian-succession-act", "succession act": "indian-succession-act",
      "hindu succession": "hindu-succession-act",
      "domestic violence": "domestic-violence-act",
      "hindu marriage": "hindu-marriage-act", "hindu divorce": "hindu-marriage-act",
      "special marriage": "special-marriage-act", "inter-faith marriage": "special-marriage-act",
      "hindu adoption": "hindu-adoption-maintenance-act", "hindu maintenance": "hindu-adoption-maintenance-act",
      "hindu guardianship": "hindu-minority-guardianship-act", "hindu minority": "hindu-minority-guardianship-act",
      "muslim personal law": "muslim-personal-law-act", "shariat": "muslim-personal-law-act", "muslim law": "muslim-personal-law-act",
      "muslim divorce": "dissolution-of-muslim-marriages-act", "dissolution of muslim marriage": "dissolution-of-muslim-marriages-act",
      "indian divorce": "indian-divorce-act", "christian divorce": "indian-divorce-act", "christian marriage": "indian-christian-marriage-act",
      "parsi marriage": "parsi-marriage-divorce-act", "parsi divorce": "parsi-marriage-divorce-act",
      "child marriage": "prohibition-child-marriage-act", "child marriage prohibition": "prohibition-child-marriage-act", "minor marriage": "prohibition-child-marriage-act",
      "guardian and ward": "guardian-wards-act", "guardianship": "guardian-wards-act", "ward": "guardian-wards-act",
      "senior citizen maintenance": "maintenance-parents-senior-citizens-act", "parent maintenance": "maintenance-parents-senior-citizens-act", "elderly rights": "maintenance-parents-senior-citizens-act",

      // Police & Criminal Procedure
      "police act": "police-act-1861", "police powers": "police-act-1861",
      nia: "nia-act", "investigation agency": "nia-act",
      fir: "fir-procedures", "first information report": "fir-procedures",
      arrest: "arrest-guidelines", "arrest guidelines": "arrest-guidelines",
      "search and seizure": "search-and-seizure",
      "charge sheet": "charge-sheets", chargesheet: "charge-sheets",
      "preventive detention": "preventive-detention",

      // Human Rights & Social Welfare
      "human rights": "protection-of-human-rights-act",
      "prisoner rights": "prisoner-rights", "prisoners rights": "prisoner-rights",
      "women rights": "women-rights", "women law": "women-rights",
      "sexual harassment": "posh-act", posh: "posh-act", "workplace harassment": "posh-act",
      "maternity benefit": "maternity-benefit-act", "maternity leave": "maternity-benefit-act",
      "mental health": "mental-healthcare-act", "mental healthcare": "mental-healthcare-act",
      "food security": "national-food-security-act", "food rights": "national-food-security-act",
      "rpwd": "rpwd-act", "persons with disabilities": "rpwd-act", "disability act": "rpwd-act", "disability rights": "rpwd-act",
      "child rights": "child-rights",
      "child labour": "child-labour-act", "child labor": "child-labour-act",
      "minority rights": "minority-rights",

      // Cyber Law & IT
      "information technology": "information-technology-act", "it act": "information-technology-act",
      "cyber law": "cyber-law-forensics", "cyber forensics": "cyber-law-forensics", "cyber laws": "cyber-law-forensics",
      "data protection": "data-protection", "data privacy": "data-protection",
      hacking: "hacking-laws", "hacking laws": "hacking-laws",
      "identity theft": "identity-theft",
      "online fraud": "online-frauds", "cyber fraud": "online-frauds",
      "cyber crime": "cyber-crime-detection", "cyber crime detection": "cyber-crime-detection",
      "digital evidence": "digital-evidence",

      // Corporate & Business Law
      "corporate law": "corporate-business-laws", "business law": "corporate-business-laws",
      "real estate": "rera", rera: "rera", "real estate regulation": "rera",
      "competition act": "competition-act", "anti-competitive": "competition-act", "cartel": "competition-act", "anti trust": "competition-act", "antitrust": "competition-act",
      sebi: "sebi-act", "securities exchange board": "sebi-act", "capital market": "sebi-act", "stock market regulation": "sebi-act",
      fema: "fema-act", "foreign exchange": "fema-act", "forex": "fema-act",
      "foreign contribution": "fema-non-pci-act", fcra: "fema-non-pci-act", "foreign donation": "fema-non-pci-act",
      msme: "msme-act", "micro small medium": "msme-act", "small enterprise": "msme-act",
      benami: "benami-transactions-act", "benami transaction": "benami-transactions-act",
      "black money": "black-money-act", "undisclosed foreign income": "black-money-act",

      // Labour & Employment Law
      "employment law": "employment-law", "labour law": "employment-law", "labor law": "employment-law",
      "minimum wages": "minimum-wages-act", "wages act": "minimum-wages-act",
      "payment of wages": "payment-of-wages-act",
      "industrial dispute": "industrial-disputes-act", "industrial disputes": "industrial-disputes-act",
      "social security": "social-security-act",
      "trade union": "trade-unions-act", "trade unions": "trade-unions-act",
      "factories act": "factories-act", "factory safety": "factories-act", "working conditions": "factories-act",
      "essential commodities": "essential-commodities-act", "price control": "essential-commodities-act",

      // Taxation
      "income tax": "income-tax-act", "tax act": "income-tax-act",
      cgst: "cgst-act", gst: "cgst-act",
      customs: "customs-act",
      excise: "central-excise-act", "central excise": "central-excise-act",
      "taxation law": "taxation-law", "tax law": "taxation-law",

      // Legal Practice
      "legal drafting": "legal-drafting", drafting: "legal-drafting", pleadings: "legal-drafting",

      // Land & Anti-Corruption
      "land acquisition": "larr-act", "land rehabilitation": "larr-act", larr: "larr-act",
      lokpal: "lokpal-act", lokayukta: "lokpal-act", "anti corruption": "lokpal-act",

      // Environmental Law
      "wildlife protection": "wildlife-protection-act", "wildlife act": "wildlife-protection-act", "animal protection": "wildlife-protection-act", "national park": "wildlife-protection-act", "sanctuary": "wildlife-protection-act",
      "forest conservation": "forest-conservation-act", "forest act": "forest-conservation-act", deforestation: "forest-conservation-act",
      "water pollution": "water-act", "water act": "water-act", "sewage": "water-act",
      "air pollution": "air-act", "air act": "air-act", "emission": "air-act",
      "green tribunal": "national-green-tribunal-act", ngtp: "national-green-tribunal-act", "environmental dispute": "national-green-tribunal-act",
      "biological diversity": "biological-diversity-act", biodiversity: "biological-diversity-act",

      // Consumer & IT Law
      "food safety": "food-safety-standards-act", "food standards": "food-safety-standards-act", fssai: "food-safety-standards-act", "food adulteration": "food-safety-standards-act",
      "drugs and cosmetics": "drugs-cosmetics-act", "drug regulation": "drugs-cosmetics-act", "medicine regulation": "drugs-cosmetics-act",
      "digital personal data": "dpdp-act", "dpdp": "dpdp-act", "personal data protection": "dpdp-act",
      aadhaar: "aadhaar-act", "aadhaar card": "aadhaar-act", "unique identification": "aadhaar-act",
      rti: "right-to-information-act", "right to information": "right-to-information-act", "information commission": "right-to-information-act", "transparency": "right-to-information-act",

      // Intellectual Property
      patent: "patents-act", "patent act": "patents-act", "patents act": "patents-act", "intellectual property": "patents-act", "invention": "patents-act", "patentee": "patents-act",
      "geographical indication": "geographical-indications-act", gi: "geographical-indications-act", "gi act": "geographical-indications-act",

      // Banking & Finance
      "reserve bank": "rbi-act", "rbi": "rbi-act", "rbi act": "rbi-act", "monetary policy": "rbi-act", "banking regulation": "rbi-act", "cash reserve ratio": "rbi-act", "statutory liquidity ratio": "rbi-act", "slr": "rbi-act", "crr": "rbi-act",
      irdai: "irdai-act", "insurance regulatory": "irdai-act", "insurance act": "irdai-act", "insurance company": "irdai-act", "insurance policy": "irdai-act", "solvency margin": "irdai-act", "insurance claim": "irdai-act", "insurance": "irdai-act",

      // Miscellaneous Acts
      "contempt of court": "contempt-of-courts-act", "contempt": "contempt-of-courts-act", "scandalising court": "contempt-of-courts-act", "contempt of courts act": "contempt-of-courts-act",
      "official secrets": "official-secrets-act", "official secrets act": "official-secrets-act", "state secrets": "official-secrets-act",
      passport: "passport-act", "passport act": "passport-act", "passport renewal": "passport-act", "passport application": "passport-act",
      "indian telegraph": "indian-telegraph-act", "telegraph act": "indian-telegraph-act", "wiretap": "indian-telegraph-act", "interception": "indian-telegraph-act",
      census: "census-act", "census act": "census-act", "population census": "census-act",
      "epidemic diseases": "epidemic-diseases-act", "epidemic act": "epidemic-diseases-act", "quarantine": "epidemic-diseases-act", "pandemic": "epidemic-diseases-act", "public health emergency": "epidemic-diseases-act",

      // Constitutional Reference
      "fundamental rights": "fundamental-rights", "right to equality": "fundamental-rights", "right to freedom": "fundamental-rights", "freedom of speech": "fundamental-rights", "right to life": "fundamental-rights", "article 21": "fundamental-rights", "article 14": "fundamental-rights", "article 19": "fundamental-rights", "right to property": "fundamental-rights", "right to religion": "fundamental-rights", "constitutional remedies": "fundamental-rights",
      "directive principles": "dpsp-fundamental-duties", dpsp: "dpsp-fundamental-duties", "fundamental duties": "dpsp-fundamental-duties", "article 51a": "dpsp-fundamental-duties", "uniform civil code": "dpsp-fundamental-duties", "state policy": "dpsp-fundamental-duties",
      "constitution schedule": "constitutional-schedules", schedules: "constitutional-schedules", "seventh schedule": "constitutional-schedules", "union list": "constitutional-schedules", "state list": "constitutional-schedules", "concurrent list": "constitutional-schedules",
      "constitution part": "constitutional-parts", "part iii": "constitutional-parts", "part iv": "constitutional-parts", "emergency provisions": "constitutional-parts", "amendment procedure": "constitutional-parts",

      // Reference & Judgments
      "landmark judgment": "landmark-judgments", "landmark case": "landmark-judgments", "sc judgment": "landmark-judgments", "supreme court judgment": "landmark-judgments",
      "more landmark judgment": "more-landmark-judgments", "more sc judgment": "more-landmark-judgments",
      "constitutional amendment": "constitutional-amendments", "amendment": "constitutional-amendments",
      "legal maxim": "legal-reference", "legal doctrine": "legal-reference", "legal doctrines": "legal-reference",
      "interpretation": "legal-reference", "statutory interpretation": "legal-reference",
      "legal dictionary": "legal-dictionary", "legal term": "legal-dictionary",
      "court hierarchy": "court-hierarchy-procedure", "court procedure": "court-hierarchy-procedure", "court system": "court-hierarchy-procedure",
      "indian legal system": "indian-legal-system", "sources of law": "indian-legal-system",
      "how to file fir": "practical-guides", "filing fir": "practical-guides", "file fir": "practical-guides",
      "consumer complaint": "practical-guides", "file consumer complaint": "practical-guides",
      "apply for bail": "practical-guides",
      "rti application": "practical-guides",
      "marriage registration": "practical-guides", "register marriage": "practical-guides",
      "divorce": "practical-guides", "get divorce": "practical-guides",
      "legal notice": "practical-guides", "send legal notice": "practical-guides",
      "property registration": "practical-guides", "register property": "practical-guides",
      "ndps bail": "practical-guides",
      "file pil": "practical-guides-2",
      "file appeal": "practical-guides-2", "appeal": "practical-guides-2",
      "domestic violence protection": "practical-guides-2", "dv protection": "practical-guides-2", "dv act": "practical-guides-2",
      "maintenance": "practical-guides-2", "section 125": "practical-guides-2",
      "nhrc": "practical-guides-2", "human rights complaint": "practical-guides-2", "shrc": "practical-guides-2",
      "anticipatory bail": "practical-guides-2", "438 bail": "practical-guides-2",
      "child custody": "practical-guides-2", "custody": "practical-guides-2",
      "challenge government": "practical-guides-2", "writ petition": "practical-guides-2",
      "legal heir certificate": "practical-guides-3", "succession certificate": "practical-guides-3",
      "register company": "practical-guides-3", "company registration": "practical-guides-3", "private limited": "practical-guides-3",
      "income tax return": "practical-guides-3", "itr filing": "practical-guides-3", "file itr": "practical-guides-3",
      "disability certificate": "practical-guides-3", "pwd certificate": "practical-guides-3",
      "birth certificate": "practical-guides-3", "death certificate": "practical-guides-3",
      "apply passport": "practical-guides-3",
      "file insolvency": "practical-guides-3", bankruptcy: "practical-guides-3",
      "government order appeal": "practical-guides-3", "appeal government order": "practical-guides-3",
      "check case status": "practical-guides-4", "case status": "practical-guides-4", "court case status": "practical-guides-4",
      "police clearance certificate": "practical-guides-4", "pcc": "practical-guides-4", "police clearance": "practical-guides-4",
      "respond to legal notice": "practical-guides-4", "reply to legal notice": "practical-guides-4", "legal notice response": "practical-guides-4",
      "rti follow up": "practical-guides-4", "rti appeal": "practical-guides-4", "rti status": "practical-guides-4",
      "police complaint vs fir": "practical-guides-4", "fir vs complaint": "practical-guides-4",
      "consumer complaint online": "practical-guides-4", "file consumer complaint online": "practical-guides-4", "consumer helpline": "practical-guides-4", "edaakhil": "practical-guides-4",
      "duplicate document": "practical-guides-4", "lost document": "practical-guides-4", "duplicate certificate": "practical-guides-4",

      // Existing S3 KB acts (already uploaded)
      arbitration: "arbitration-act", conciliation: "arbitration-act",
      "negotiable instrument": "negotiable-instruments-act", cheque: "negotiable-instruments-act",
      limitation: "limitation-act",
      companies: "companies-act", "company act": "companies-act",
      "motor vehicles": "motor-vehicles-act", traffic: "motor-vehicles-act",
      "sale of goods": "sale-of-goods-act",
      ndps: "ndps-act", narcotic: "ndps-act",
      copyright: "copyright-act", "copyright act": "copyright-act",
      "juvenile justice": "juvenile-justice-act", "juvenile act": "juvenile-justice-act",
      pocso: "pocso-act", "protection of children": "pocso-act",
      registration: "registration-act", "registration act": "registration-act",
      "indian stamp": "indian-stamp-act", "stamp act": "indian-stamp-act",
      "indian partnership": "indian-partnership-act", "partnership act": "indian-partnership-act",
      "sc st": "sc-st-act", atrocities: "sc-st-act", "prevention of atrocities": "sc-st-act",
      "environment protection": "environment-protection-act", "environment act": "environment-protection-act",
      "trade marks": "trade-marks-act", trademark: "trade-marks-act",
      sarfaesi: "sarfaesi-act", securitisation: "sarfaesi-act",
    };

    // Find which act is being referenced
    let targetAct = "";
    for (const [key, val] of Object.entries(actMap)) {
      if (lower.includes(key)) { targetAct = val; break; }
    }

    const fullTextActs = new Set([
      // Newly ingested acts (PDF-based)
      "bharatiya-nyaya-sanhita", "bharatiya-nagrik-suraksha-sanhita", "bharatiya-sakshya-adhiniyam",
      "code-of-civil-procedure", "transfer-of-property-act", "indian-contract-act", "specific-relief-act",
      "family-law", "indian-succession-act", "hindu-succession-act", "domestic-violence-act",
      "consumer-protection-act",
      "information-technology-act", "cyber-law-forensics", "data-protection", "hacking-laws",
      "identity-theft", "online-frauds", "cyber-crime-detection", "digital-evidence",
      "constitutional-law-jurisprudence", "legal-terminology",
      "jurisdiction-structure-of-courts", "tort-law",
      "civil-appeals", "judicial-review", "writ-jurisprudence", "public-interest-litigation", "revision-of-courts",
      "police-act-1861", "fir-procedures", "arrest-guidelines", "search-and-seizure", "nia-act",
      "charge-sheets", "preventive-detention",
      "indian-polity", "local-government", "fundamental-rules", "general-financial-rules",
      "delegated-legislation", "public-administration",
      "protection-of-human-rights-act", "prisoner-rights", "women-rights", "child-rights", "minority-rights",
      "posh-act", "maternity-benefit-act", "mental-healthcare-act", "national-food-security-act",
      "rpwd-act", "child-labour-act",
      "hindu-marriage-act", "special-marriage-act", "hindu-adoption-maintenance-act", "hindu-minority-guardianship-act",
      "rera", "larr-act", "lokpal-act",
      "landmark-judgments", "constitutional-amendments", "legal-reference", "practical-guides",
      "more-landmark-judgments", "practical-guides-2",
      "legal-dictionary", "court-hierarchy-procedure", "indian-legal-system",
      "corporate-business-laws",
      "employment-law", "minimum-wages-act", "payment-of-wages-act", "industrial-disputes-act",
      "social-security-act", "trade-unions-act",
      "income-tax-act", "cgst-act", "customs-act", "central-excise-act", "taxation-law",
      "legal-drafting",
      // Criminal Special Acts
      "arms-act", "dowry-prohibition-act", "uapa-act", "pmla-act",
      "explosive-substances-act", "prevention-of-corruption-amended-act", "armed-forces-special-powers-act",
      // Commercial Acts
      "competition-act", "sebi-act", "fema-act", "fema-non-pci-act",
      "msme-act", "benami-transactions-act", "black-money-act",
      // Family & Personal Law
      "muslim-personal-law-act", "dissolution-of-muslim-marriages-act",
      "indian-divorce-act", "parsi-marriage-divorce-act", "indian-christian-marriage-act",
      "prohibition-child-marriage-act", "guardian-wards-act", "maintenance-parents-senior-citizens-act",
      // Environment & Labour
      "wildlife-protection-act", "forest-conservation-act", "water-act", "air-act",
      "national-green-tribunal-act", "biological-diversity-act",
      "factories-act", "essential-commodities-act",
      // Consumer & IT
      "food-safety-standards-act", "drugs-cosmetics-act", "dpdp-act", "aadhaar-act",
      // Intellectual Property
      "patents-act", "geographical-indications-act",
      // Banking & Finance
      "rbi-act", "irdai-act",
      // Miscellaneous Acts
      "contempt-of-courts-act", "official-secrets-act", "passport-act",
      "indian-telegraph-act", "census-act", "epidemic-diseases-act",
      // Constitutional Reference
      "fundamental-rights", "dpsp-fundamental-duties", "constitutional-schedules", "constitutional-parts",
      "practical-guides-3", "practical-guides-4",
      // Pre-existing S3 KB acts
      "arbitration-act",
      "negotiable-instruments-act", "limitation-act", "companies-act", "right-to-information-act",
      "prevention-of-corruption-act", "motor-vehicles-act", "sale-of-goods-act", "ndps-act", "ibc",
      "banking-regulation-act", "copyright-act",
      "juvenile-justice-act", "pocso-act", "registration-act", "indian-stamp-act",
      "indian-partnership-act", "sc-st-act", "environment-protection-act",
      "trade-marks-act", "sarfaesi-act",
    ]);

    // Case 1: Specific act + section number → getSection
    if (targetAct && sectionMatches.length > 0) {
      for (const match of sectionMatches) {
        const secNum = match[1];
        const sec = await s3kb.getSection(targetAct, secNum);
        if (sec) parts.push(`[${targetAct.toUpperCase()} Section ${sec.section}] ${sec.title}: ${sec.text}`);
      }
    }

    // Case 1b: Section number but no act → search all acts (skip constitution, it uses "article")
    if (!targetAct && sectionMatches.length > 0) {
      const raw = await s3kb.getFullTextIndex();
      if (raw) {
        for (const entry of raw) {
          const id = typeof entry === "string" ? entry : entry.id;
          if (id === "constitution") continue; // constitution has articles, not sections
          for (const match of sectionMatches) {
            const sec = await s3kb.getSection(id, match[1]);
            if (sec) {
              parts.push(`[${id.toUpperCase()} Section ${sec.section}] ${sec.title}: ${sec.text}`);
              break;
            }
          }
          if (parts.length > 0) break;
        }
      }
    }

    // Case 1c: Constitution article (only if "constitution" explicitly mentioned)
    if (targetAct === "constitution" && articleMatches.length > 0) {
      for (const match of articleMatches) {
        const sec = await s3kb.getSection("constitution", match[1]);
        if (sec) parts.push(`[Constitution Article ${sec.section}] ${sec.title}: ${sec.text}`);
      }
    }

    // Case 1d: Article number query → assume Constitution (article queries always map to Constitution,
    // even if actMap matched a false positive like "rti" inside "article")
    if (articleMatches.length > 0 && targetAct !== "constitution") {
      for (const match of articleMatches) {
        const sec = await s3kb.getSection("constitution", match[1]);
        if (sec) parts.push(`[Constitution Article ${sec.section}] ${sec.title}: ${sec.text}`);
      }
    }

    // Case 2: Act name but no section → full text or search within act
    if (targetAct && parts.length === 0) {
      if (fullTextActs.has(targetAct)) {
        const full = await s3kb.getFullText(targetAct);
        if (full) parts.push(`[${targetAct.toUpperCase()} Full Text]\n${full.substring(0, 3000)}...`);
      } else {
        // Acts with individual section files (IPC, CrPC, etc.) - search their titles
        const sections = await s3kb.getFullTextIndex();
        if (sections) {
          const secList = await s3kb.getSectionList(targetAct);
          if (secList) {
            const words = lower.replace(/[^a-z\s]/g, " ").split(/\s+/).filter(w => w.length > 3 && !["what", "the", "for", "and", "that", "this", "with", "under", "from", "about"].includes(w));
            let bestMatch = null;
            let bestScore = 0;
            for (const s of secList) {
              const titleLower = s.title.toLowerCase();
              let score = 0;
              for (const w of words) {
                if (titleLower.includes(w)) score++;
              }
              if (score > bestScore) { bestScore = score; bestMatch = s; }
            }
            if (bestMatch && bestScore > 0) {
              const sec = await s3kb.getSection(targetAct, bestMatch.section);
              if (sec) parts.push(`[${targetAct.toUpperCase()} Section ${sec.section}] ${sec.title}: ${sec.text}`);
            }
          }
        }
      }
    }

    // Case 3: No act match → search across all acts
    if (parts.length === 0) {
      // Extract meaningful keywords from query
      const keywords = lower.replace(/[^a-z\s]/g, " ").split(/\s+/)
        .filter(w => w.length > 2 && !["the", "for", "and", "what", "can", "with", "are", "not", "under", "from", "about", "explain", "tell", "does", "say", "section", "article"].includes(w));
      const searchQuery = keywords.join(" ");

      const searchResults = await s3kb.searchActs(searchQuery);
      if (searchResults.length > 0) {
        for (const r of searchResults.slice(0, 5)) {
          const sec = await s3kb.getSection(r.act, r.section);
          const text = sec ? sec.text : "";
          if (text) parts.push(`[${r.act.toUpperCase()} ${r.section}] ${r.title}: ${text}`);
        }
      }
    }

    // Fetch reference data if relevant
    const refChecks: Array<{ keywords: string[]; key: string; label: string }> = [
      { keywords: ["bail", "bailable", "non-bailable"], key: "bailable-offenses", label: "Bailable/Non-Bailable Offenses" },
      { keywords: ["limitation", "time limit", "file a case", "file suit"], key: "limitation-periods", label: "Limitation Periods" },
      { keywords: ["writ", "habeas", "mandamus", "certiorari", "quo warranto"], key: "writ-types", label: "Types of Writs" },
      { keywords: ["court", "jurisdiction", "supreme court", "high court", "district court"], key: "court-hierarchy", label: "Court Hierarchy" },
    ];

    for (const ref of refChecks) {
      if (ref.keywords.some(k => lower.includes(k))) {
        const data = await s3kb.getReference<any>(ref.key);
        if (data) parts.push(`\n[${ref.label}]:\n${JSON.stringify(data, null, 2)}`);
      }
    }

    return parts.length > 0 ? `Legal Knowledge Base:\n${parts.join("\n\n")}` : "";
  } catch (error) {
    console.error("S3 knowledge error:", error);
    return "";
  }
}

export async function POST(request: NextRequest) {
  const { messages, conversationType } = await request.json();

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "NVIDIA_API_KEY is not configured" }, { status: 500 });
  }

  const systemPrompt = getSystemPrompt(conversationType);
  const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop();

  function extractTextFromContent(content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>): string {
    if (typeof content === "string") return content;
    return content.filter((p: { type: string }) => p.type === "text").map((p: { text?: string }) => p.text || "").join(" ");
  }

  const userQuery = lastUserMessage ? extractTextFromContent(lastUserMessage.content) : "";

  let needsSearch = false;
  if (userQuery) {
    needsSearch = await classifyQuery(userQuery, apiKey);
  }

  let webSearchContext = "";
  if (needsSearch) {
    webSearchContext = await webSearch(userQuery);
  }

  // Only fetch from S3 if the query does NOT need web search
  const legalContext = needsSearch ? "" : await getLegalKnowledge(userQuery);

  let finalSystemPrompt = systemPrompt;
  const contextParts: string[] = [];
  if (webSearchContext) contextParts.push(webSearchContext);
  if (legalContext) contextParts.push(legalContext);
  if (contextParts.length > 0) {
    finalSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Use the following information to answer the user's question. Incorporate this into your response:\n\n${contextParts.join("\n\n")}`;
  }

  const messagesWithSystem = [
    { role: "system", content: finalSystemPrompt },
    ...messages.filter((m: { role: string }) => m.role !== "system"),
  ];

  const maxTokens = conversationType === "analysis" ? 1024 : conversationType === "grill" ? 512 : conversationType === "review" ? 2048 : 256;

  const hasMultimodalContent = Array.isArray(lastUserMessage?.content) && lastUserMessage.content.some((p: { type: string }) => p.type === "image_url");
  const model = (conversationType === "review" || hasMultimodalContent) ? REVIEW_MODEL : NVIDIA_MODEL;

  const chatController = new AbortController();
  const chatTimeout = setTimeout(() => chatController.abort(), 30000);
  const response = await fetch(NVIDIA_API_URL, {
    signal: chatController.signal,
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify({
        model,
        messages: messagesWithSystem,
      max_tokens: maxTokens,
      temperature: 1.0,
      top_p: 0.95,
      stream: true,
    }),
  });
  clearTimeout(chatTimeout);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("NVIDIA API error:", response.status, errorText);
    return Response.json({ error: "Failed to get response from AI" }, { status: response.status });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function stripThinkingTokens(text: string): string {
    return text
      .replace(/<\|channel\|?>[\s\S]*?(?=\n|$|<)/g, "")
      .replace(/<channel\|?>[\s\S]*?(?=\n|$|<)/g, "")
      .replace(/\|channel\|?>[\s\S]*?(?=\n|$|<)/g, "")
      .replace(/<\|channel[^\n<]*/g, "")
      .replace(/<channel[^\n<]*/g, "")
      .replace(/\|channel[^\n<]*/g, "");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      let sseBuffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          sseBuffer += chunk;
          const parts = sseBuffer.split("\n");
          sseBuffer = parts.pop() ?? "";

          for (const line of parts) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  const cleaned = stripThinkingTokens(content);
                  if (cleaned) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content: cleaned })}\n\n`)
                    );
                  }
                }
              } catch {
                // skip malformed JSON lines
              }
            }
          }
        }
      } catch (error) {
        console.error("Stream processing error:", error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
