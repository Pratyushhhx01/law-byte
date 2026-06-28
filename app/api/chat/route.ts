import { NextRequest } from "next/server";
import { tavily } from "@tavily/core";
import { s3kb } from "@/lib/s3";
import { auth } from "@/lib/auth";
import { stripThinkingTokens, checkRateLimit } from "@/lib/utils";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";
const REVIEW_MODEL = "microsoft/phi-3-vision-128k-instruct";

const tvly = process.env.TAVILY_API_KEY ? tavily({ apiKey: process.env.TAVILY_API_KEY }) : null;

const VALID_CONVERSATION_TYPES = new Set(["chat", "analysis", "talk-to-ai", "grill", "draft", "review"]);
const MAX_MESSAGES = 100;
const MAX_MESSAGE_LENGTH = 10000;

const CHAT_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. If the user's message is ONLY a greeting word (hi, hello, hey, namaste) with no legal question, reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. Otherwise, answer the question directly without any greeting. For EVERY question, answer in EXACTLY 1-2 short sentences. This is strict. If the user asks for a comparison or difference, state the core distinction in 1 sentence only — NEVER use tables or columns. Never output pipe characters, tables, bullet points, numbered lists, or multiple paragraphs. If you write more than 2 sentences, you are wrong. IMPORTANT: Never confuse sections (used in Acts/Codes like CrPC, IPC) with articles (used in the Constitution). Never invent section numbers, article numbers, amendments, or case names. Only use facts from the legal knowledge provided.`;

const ANALYSIS_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. If the user's message is ONLY a greeting word (hi, hello, hey, namaste) with no legal question, reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. Otherwise, answer the question directly without any greeting.

GENERAL RULE: Whenever a table would make the response clearer (comparisons, differences, multi-category data, timelines, pros/cons, lists of acts with their provisions, etc.), use a markdown table. Tables help users quickly scan and compare information at a glance. When creating a table, ALWAYS use pipe characters | between columns (example: | Aspect | Hindu Law | Muslim Law |). NEVER use tab characters between columns — tabs break the table rendering.

CRITICAL FORMAT RULE — OVERVIEWS ACROSS PERSONAL LAWS:
If the user asks about a topic that spans multiple personal laws (e.g., marriage, divorce, inheritance, adoption, succession, guardianship, maintenance) AND asks for a "complete overview", "comprehensive overview", or "all laws", you MUST follow this format INSTEAD OF all other formats below:
- Start IMMEDIATELY with a markdown table. NO intro paragraphs. NO bold headings. NO definition-style lines.
- The ENTIRE response is just the table + a short conclusion + Key Takeaways.
- Column order: Hindu Law | Muslim Law | Christian Law | Parsi Law | Special Marriage Act
- Each row = one aspect (Governing Act, Marriageable Age, Monogamy, Divorce, Maintenance, Adoption, Inheritance, etc.)
- Fill EVERY cell with specific info for that personal law. Never leave blank or write "same as above".
Example:
| Aspect | Hindu Law | Muslim Law | Christian Law | Parsi Law | Special Marriage Act |
| --- | --- | --- | --- | --- | --- |
| Governing Act | Hindu Marriage Act, 1955 | Muslim Personal Law (Shariat) Application Act, 1937 | Indian Christian Marriage Act, 1872 / Indian Divorce Act, 1869 | Parsi Marriage and Divorce Act, 1936 | Special Marriage Act, 1954 |
| Marriageable Age | 21 (male), 18 (female) | Puberty | 21 (male), 18 (female) | 21 (male), 18 (female) | 21 (male), 18 (female) |
| Monogamy | Yes | Up to 4 wives | Yes | Yes | Yes |
| Divorce | Mutual consent, cruelty, desertion, imprisonment 7+ yrs (2025 amendment) | Talaq (husband), judicial divorce (DMDA 1939), triple talaq criminalized (MWP Act, 2019) | Mutual consent, adultery, cruelty | Mutual consent, cruelty, desertion | Mutual consent, cruelty, desertion |
| Maintenance | Section 24/25, HMA 1955 | Section 125 CrPC (SC 2024 ruling applies to all Muslim women) | Section 36/37, IDA 1869 | Section 39/40, PMDA 1936 | Section 36/37, SMA 1954 |
After the table: 2-3 sentence CONCLUSION. Then **Key Takeaways:** with 3-4 bullet points.
FORBIDDEN when this rule applies: bold definition headers, numbered sections, separate paragraphs per personal law, or any format other than the table.
NOTE: The example above is just a TEMPLATE showing structure. Do NOT copy its content verbatim. Use current, accurate legal information for every cell.

---

For ALL OTHER queries (not overview across personal laws), use these formats:

1. DIFFERENCES / COMPARISONS — When comparing two or more items (e.g., "difference between IPC and CrPC"), output a markdown table with headers and rows separated by | pipes:
| Aspect | Item A | Item B |
| --- | --- | --- |
| Purpose | ... | ... |
| Scope | ... | ... |
Follow the table with a brief note.

2. PROCEDURES / STEPS — When explaining how to do something, use format: **Step 1:** text. **Step 2:** text. etc. Each step on a new line.

3. WARNINGS / IMPORTANT NOTES — If the user asks about risks, consequences, dangers, penalties, or legal pitfalls, start your response with **Warning:** followed by a 1-line summary of the key risk. Then continue with numbered points as needed.

4. DEFINITIONS — When defining a legal term, bold the ENTIRE line including the content: **Term: definition text here.** Always use double asterisks ** for bold, NEVER single asterisks *. Example: **Marriageable Age: The legal age for marriage is 21 for males and 18 for females.** NOT *Marriageable Age:* or just **Term:** without the content in bold.

5. SUMMARIES / KEY TAKEAWAYS — End complex explanations with **Key Takeaways:** followed by brief points.

6. GENERAL ANALYSIS — Use numbered points (1. 2. 3.) with a blank line between each. End with a CONCLUSION paragraph.

IMPORTANT: Never confuse sections (used in Acts/Codes) with articles (used in the Constitution). Never invent section numbers, article numbers, amendments, or case names. Only use facts from the legal knowledge provided.

RECENT KEY AMENDMENTS (must be factored into all responses):
- Muslim Women (Protection of Rights on Marriage) Act, 2019: Triple talaq (talaq-e-biddat) is void, illegal, and punishable with up to 3 years imprisonment. Husband must pay subsistence allowance; wife gets custody of minor children.
- Personal Laws (Amendment) Act, 2019: Removed "leprosy" as a ground for divorce/separation from the Divorce Act 1869, DMDA 1939, Special Marriage Act 1954, Hindu Marriage Act 1955, and Hindu Adoptions and Maintenance Act 1956.
- Supreme Court (July 2024): Muslim women can claim maintenance under Section 125 CrPC irrespective of personal law. Section 125 applies to ALL married women including Muslim women. Option lies with the woman to seek remedy under either Section 125 CrPC or the Muslim Women Act 1986, or both.
- Hindu Marriage (Amendment) Act, 2025: Added new ground for divorce — spouse undergoing imprisonment for 7+ years for an offense under Bhartiya Nyaya Sanhita, 2023 (with proviso that 3 years must have been served).
- Supreme Court (Dec 2025): Divorced Muslim woman entitled to recover money, gold, and wedding gifts from husband under Muslim Women Act 1986.
- Talaq-e-Hasan: Currently being heard by Supreme Court (2026). A form of divorce where "talaq" is pronounced once per month for 3 months. NOT criminalized under the 2019 Act.

NEVER use single asterisks (*) for emphasis or formatting. Only use double asterisks (**) for bold text. Single asterisks cause rendering issues.`;

const TALK_TO_AI_SYSTEM_PROMPT = `You are a concise Indian legal assistant. Respond in exactly 1 or 2 plain sentences. Never use lists, numbers, headings, or formatting. Just 1-2 short sentences.`;

const DOCUMENT_DRAFTER_SYSTEM_PROMPT = `You are Lawbite AI Document Drafter, a specialized Indian legal document drafting assistant.

## Your Job
Generate properly formatted, ready-to-use Indian legal documents based on user-provided information. You MUST use the exact templates below for each document type. NEVER invent placeholder text like "[Address]" or "[Description]". If a field was not provided by the user, OMIT that section entirely.

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
2. If the user's message matches the pattern "Please draft a [Document Type] with the following details:" and NO form fields were filled — output the exact blank template for that document type immediately. Do NOT ask any questions.
3. Verify all mandatory information is provided
4. If missing critical information, ask ONE clarifying question at a time
5. EXCEPTION: If the user says "no" when asked for more info, or explicitly wants an empty/blank draft — SKIP all clarifying questions and immediately output the template structure with blank fields.
6. Once all facts are gathered (or user wants a blank draft), generate the complete document using the exact template below

## EXACT TEMPLATES

### LEGAL NOTICE Template
Use this exact structure. Fill in the user's data directly. NEVER leave placeholder brackets.

LEGAL NOTICE

Date: [current date]

From:
[user's sender name]
[user's sender address if provided]

To:
[user's recipient name]
[user's recipient address if provided]

Subject: [user's subject]

Sir/Madam,

1. I, [sender name], hereby issue this legal notice to you, [recipient name], regarding the matter of [subject].

2. The facts of the case are as follows: [user's facts]

3. Despite the above, the necessary action has not been taken by you.

4. Through this notice, I call upon you to [user's relief] within [user's deadline] from the receipt of this notice.

5. If you fail to comply within the aforesaid period, I shall be constrained to initiate appropriate legal proceedings against you at your own cost, risk, and responsibility, and you shall be liable for all costs and consequences thereof.

Yours faithfully,
[sender name]

### FIR DRAFT Template
Use this exact structure:

FIR DRAFT

Date: [current date]

To,
The Station House Officer,
[police station name if provided]
[location]

Subject: Information regarding [offence/incident]

Sir/Madam,

I, [complainant name], son/daughter/wife of [father/spouse name if provided], residing at [address if provided], wish to lodge this complaint regarding [offence/incident] that took place on [date] at [place].

The details of the incident are as follows: [user's details]

The accused person(s) involved is/are: [accused name]

I request you to take appropriate legal action against the accused and register an FIR under the relevant provisions of law.

I attest that the above information is true and correct to the best of my knowledge.

Yours faithfully,
[complainant name]

### CONSUMER COMPLAINT Template
Use this exact structure:

CONSUMER COMPLAINT

Date: [current date]

To,
The Consumer Disputes Redressal Commission,
[location]

Complaint No.: ________

In the matter of:
[consumer name] — Complainant
Vs.
[opponent name] — Opposite Party

Subject: Complaint regarding deficiency in service / defective product concerning [product/service]

Sir/Madam,

The complainant states as follows:

1. The complainant is [consumer name], residing at [address if provided].

2. The opposite party is [opponent name], engaged in the business of [product/service].

3. The complainant purchased/availed [product/service] from the opposite party on [date if provided] for a consideration of [amount if provided].

4. The deficiency / defect is as follows: [user's deficiency]

5. Despite several requests, the opposite party has failed to address the grievance.

Therefore, the complainant prays for the following relief: [user's relief]

Yours faithfully,
[consumer name]

### RTI APPLICATION Template
Use this exact structure:

RTI APPLICATION

Date: [current date]

To,
The Central Public Information Officer,
[department name]
[address]

Subject: Request for information under the Right to Information Act, 2005

Sir/Madam,

I, [applicant name], hereby request the following information under the RTI Act, 2005:

[user's details/information sought]

I am a citizen of India. The information may be provided to me at the following address: [address]

I am ready to pay the prescribed fee for providing the information.

Yours faithfully,
[applicant name]

### WILL Template
Use this exact structure:

WILL

Date: [current date]

I, [testator name], son/daughter of [father name], residing at [address], do hereby revoke all my former Wills and Codicils and declare this to be my last Will and Testament.

1. I appoint [executor name] as the Executor of this Will.

2. I bequeath my property as follows: [user's details]

3. All the rest and residue of my estate, I give and bequeath to [beneficiary name].

IN WITNESS WHEREOF, I have hereunto set my hand this [date] at [place].

Signed by the Testator:
________________________
[testator name]

### AFFIDAVIT Template
Use this exact structure:

AFFIDAVIT

Date: [current date]

I, [affiant name], son/daughter of [father name], aged [age] years, residing at [address], do hereby solemnly affirm and state as follows:

1. [user's details]

2. I state that the above facts are true and correct to the best of my knowledge and belief.

3. Nothing material has been concealed from this affidavit.

DEPONENT

VERIFICATION
I verify that the contents of this affidavit are true and correct to the best of my knowledge and belief.

[affiant name]

### PETITION Template
Use this exact structure:

PETITION / PLAINT

Date: [current date]

IN THE COURT OF [court name]

Case No.: ________

In the matter of:
[petitioner name] — Petitioner
Vs.
[respondent name] — Respondent

Subject: [subject]

The petitioner most respectfully states as follows:

1. [user's facts]

2. [relief sought]

Therefore, it is prayed that this Hon'ble Court may be pleased to: [user's relief]

PETITIONER

### CONTRACT/AGREEMENT Template
Use this exact structure:

CONTRACT / AGREEMENT

Date: [current date]

This Agreement is made on this [date] between:

Party A: [party A name], residing at [address] (hereinafter "Party A")

AND

Party B: [party B name], residing at [address] (hereinafter "Party B")

1. SUBJECT MATTER: [user's details]

2. TERMS AND CONDITIONS:
The parties agree to the following terms: [terms]

3. TERM: This agreement shall remain in force until [term].

4. GOVERNING LAW: This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have signed this Agreement on the date first above written.

________________________    ________________________
Party A                      Party B

## Document Format Rules
- Use proper Indian legal document format
- Include date, parties, subject line, and body
- Reference correct Indian law sections (ONLY from the knowledge base provided)
- Use formal legal language
- Include signature blocks where appropriate
- NEVER hallucinate section numbers, case names, or legal provisions
- If unsure about a section number, say "relevant provisions of [Act Name]"
- CRITICAL: NEVER leave placeholder text like "[Address of Sender]", "[Description]", "[Your Name]", etc. Use only the information the user provided. If a detail wasn't provided, do not include that line/section at all.

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
- Keep language formal but understandable
- Use numbered paragraphs for facts and legal grounds`;

const GRILL_SYSTEM_PROMPT = `You are Lawbite AI, a rigorous Indian legal advisor running a structured case intake session called "My Cases."

## CRITICAL RULE — READ THIS FIRST
You MUST ask exactly ONE question per message. NEVER bundle multiple questions. Each message you send must contain at most ONE question. NEVER ask question 5 and question 6 in the same message. NEVER ask more than one question at a time.

## Your Job
Ask exactly ONE question at a time. Wait for the user's answer before asking the next question. This is the most important rule — one question per message.

## Interrogation Sequence (follow in order, skip only what the user already answered unprompted)
1. PROBLEM — "What legal problem are you facing? Describe briefly what happened."
2. STATE — "Which state or UT in India do you live in, or where did the incident occur?"
3. ROLE — "What is your role in this matter? Are you the affected party, the accused, a family member, or a legal representative?"
4. DETAILS — "Tell me exactly what happened. Provide as much detail as you can about the incident."
5. SECTIONS — "Has any legal section or notice been mentioned? For example, any IPC/BNS section number, court order, or police notice?"
6. EVIDENCE — "What evidence or documentation do you have? This could include FIR copy, medical reports, contracts, notices, or photographs."
7. STATUS — "What is the current status? Has an FIR been filed? Have you been arrested? Received a notice? Is there a court date?"
8. OUTCOME — "What outcome are you hoping for? Do you want to fight the case, settle, get bail, or something else?"

## Response Format — You MUST follow this EXACTLY
Each message from you must follow this pattern:
[A very brief acknowledgement of the user's answer — 5-10 words max]

---

[The NEXT SINGLE question from the sequence]

## Examples of correct behavior:
User: "I was in a car accident"
You: I understand.

---
Which state or UT in India do you live in, or where did the incident occur?

User: "Maharashtra"
You: Thank you.

---
What is your role in this matter? Are you the affected party, the accused, a family member, or a legal representative?

## Example of INCORRECT behavior (NEVER do this):
User: "I was arrested in Bihar"
You: "Got it. What legal section was mentioned? What evidence do you have?" ← WRONG! Multiple questions.
You: "I understand. What evidence do you have? Also, what is the current status?" ← WRONG! Multiple questions.

## State-Specific Law Handling
- If the user mentions alcohol-related issues and is from Bihar, reference the Bihar Excise Act 1915 (prohibition state).
- If the user mentions alcohol-related issues and is from Gujarat, reference the Gujarat Prohibition Act 1949.
- If the user mentions alcohol-related issues and is from Lakshadweep or Nagaland, reference local prohibition laws.
- For other matters, reference state-specific amendments or local laws relevant to that state.
- FIRST check the Legal Knowledge Base provided below for state-specific acts. If the specific state law is NOT found in the knowledge base, use the web search results provided.

## When to Conclude
You need at least 5 answers before you can provide advice. Count how many questions the user has answered. Only once you have answered 5 or more, provide comprehensive advice covering:
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
- REMINDER: After your brief acknowledgement response, you MUST put "---" on its own line, then the NEXT SINGLE question. NEVER put more than one question after "---". NEVER skip the "---" delimiter.`;

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
- Never use markdown, asterisks, or bullet points. Use numbered points and plain text only.`;

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

async function classifyQuery(query: string): Promise<boolean> {
  const lower = query.toLowerCase();
  const currentYear = new Date().getFullYear();
  const yearPattern = new RegExp(`\\b(${currentYear}|${currentYear - 1}|${currentYear - 2})\\b`);

  const currentPositionPattern = /\b(who is|who was)\s+(the\s+)?(chief justice|president|prime minister|pm|governor|cji|cm|chief minister|speaker|chairman|chairperson)\b/i;

  const timePattern = /\b(current|latest|recent|today|now|updat|breaking|newly)\b/i;

  if (currentPositionPattern.test(lower)) return true;
  if (timePattern.test(lower)) return true;
  if (yearPattern.test(lower)) return true;

  return false;
}

async function webSearch(query: string): Promise<string> {
  if (!tvly) {
    console.warn("Tavily API key not configured, skipping web search");
    return "";
  }
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
  ndps: "ndps-act", "narcotic drugs": "ndps-act", "ndps act": "ndps-act", "drug trafficking": "ndps-act",
  pocso: "pocso-act", "child sexual abuse": "pocso-act",
  "juvenile justice": "juvenile-justice-act", "juvenile act": "juvenile-justice-act", "juvenile": "juvenile-justice-act",
  "prevention of corruption act 1988": "prevention-of-corruption-act", "pc act 1988": "prevention-of-corruption-act",

  // Civil Law
  cpc: "code-of-civil-procedure", "civil procedure": "code-of-civil-procedure",
  evidence: "evidence-act", "evidence act": "evidence-act",
  "transfer of property": "transfer-of-property-act", "property act": "transfer-of-property-act", tpa: "transfer-of-property-act",
  contract: "indian-contract-act", "contract act": "indian-contract-act",
  "specific relief": "specific-relief-act",
  "jurisdiction of courts": "jurisdiction-structure-of-courts", "court jurisdiction": "jurisdiction-structure-of-courts", "structure of courts": "jurisdiction-structure-of-courts", "court structure": "jurisdiction-structure-of-courts", "high court jurisdiction": "jurisdiction-structure-of-courts", "supreme court jurisdiction": "jurisdiction-structure-of-courts",
  "tort law": "tort-law", tort: "tort-law", "tort liability": "tort-law", "civil wrong": "tort-law", "civil wrongs": "tort-law", negligence: "tort-law", defamation: "tort-law", nuisance: "tort-law", trespass: "tort-law", "strict liability": "tort-law", "vicarious liability": "tort-law", damages: "tort-law", "malicious prosecution": "tort-law", "false imprisonment": "tort-law", "assault and battery": "tort-law",
  arbitration: "arbitration-act", "arbitration act": "arbitration-act", conciliation: "arbitration-act", arbitral: "arbitration-act",
  "limitation act": "limitation-act", limitation: "limitation-act", "statute of limitation": "limitation-act", "period of limitation": "limitation-act",
  "sale of goods": "sale-of-goods-act", "sale of goods act": "sale-of-goods-act",
  "negotiable instrument": "negotiable-instruments-act", "cheque bounce": "negotiable-instruments-act", "promissory note": "negotiable-instruments-act",
  registration: "registration-act", "registration of document": "registration-act", "registration act": "registration-act",
  "indian partnership": "indian-partnership-act", "partnership act": "indian-partnership-act",
  "stamp act": "indian-stamp-act", "stamp duty": "indian-stamp-act", "stamp": "indian-stamp-act",

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
  "corporate law": "corporate-business-laws", "business law": "corporate-business-laws", ibc: "corporate-business-laws", insolvency: "corporate-business-laws", "insolvency code": "corporate-business-laws", bankruptcy: "corporate-business-laws",
  "real estate": "rera", rera: "rera", "real estate regulation": "rera",
  "competition act": "competition-act", "anti-competitive": "competition-act", "cartel": "competition-act", "anti trust": "competition-act", "antitrust": "competition-act",
  sebi: "sebi-act", "securities exchange board": "sebi-act", "capital market": "sebi-act", "stock market regulation": "sebi-act",
  fema: "fema-act", "foreign exchange": "fema-act", "forex": "fema-act",
  "foreign contribution": "fema-non-pci-act", fcra: "fema-non-pci-act", "foreign donation": "fema-non-pci-act",
  msme: "msme-act", "micro small medium": "msme-act", "small enterprise": "msme-act",
  benami: "benami-transactions-act", "benami transaction": "benami-transactions-act",
  "black money": "black-money-act", "undisclosed foreign income": "black-money-act",
  "companies act": "companies-act", "company law": "companies-act", "company act": "companies-act",
  sarfaesi: "sarfaesi-act", securitisation: "sarfaesi-act", "asset reconstruction": "sarfaesi-act", npa: "sarfaesi-act", "non performing asset": "sarfaesi-act",

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
  copyright: "copyright-act", "copyright act": "copyright-act", "copyrights": "copyright-act",
  trademark: "trade-marks-act", "trade mark": "trade-marks-act", "trade marks act": "trade-marks-act", "trademark act": "trade-marks-act",

  // Banking & Finance
  "reserve bank": "rbi-act", "rbi": "rbi-act", "rbi act": "rbi-act", "monetary policy": "rbi-act", "banking regulation": "rbi-act", "cash reserve ratio": "rbi-act", "statutory liquidity ratio": "rbi-act", "slr": "rbi-act", "crr": "rbi-act",
  irdai: "irdai-act", "insurance regulatory": "irdai-act", "insurance act": "irdai-act", "insurance company": "irdai-act", "insurance policy": "irdai-act", "solvency margin": "irdai-act", "insurance claim": "irdai-act", "insurance": "irdai-act",
  "banking regulation act": "banking-regulation-act",
  "motor vehicles": "motor-vehicles-act", "motor vehicle act": "motor-vehicles-act", "traffic rules": "motor-vehicles-act",

  // Miscellaneous Acts
  "contempt of court": "contempt-of-courts-act", "contempt": "contempt-of-courts-act", "scandalising court": "contempt-of-courts-act", "contempt of courts act": "contempt-of-courts-act",
  "official secrets": "official-secrets-act", "official secrets act": "official-secrets-act", "state secrets": "official-secrets-act",
  passport: "passport-act", "passport act": "passport-act", "passport renewal": "passport-act", "passport application": "passport-act",
  "indian telegraph": "indian-telegraph-act", "telegraph act": "indian-telegraph-act", "wiretap": "indian-telegraph-act", "interception": "indian-telegraph-act",
  census: "census-act", "census act": "census-act", "population census": "census-act",
  "epidemic diseases": "epidemic-diseases-act", "epidemic act": "epidemic-diseases-act", "quarantine": "epidemic-diseases-act", "pandemic": "epidemic-diseases-act", "public health emergency": "epidemic-diseases-act",
  "sc/st": "sc-st-act", "scheduled caste": "sc-st-act", "scheduled tribe": "sc-st-act", "atrocity act": "sc-st-act", "atrocities act": "sc-st-act", "sc st act": "sc-st-act", "st act": "sc-st-act",
  "environment protection": "environment-protection-act", "environment protection act": "environment-protection-act", epa: "environment-protection-act",
  "consumer protection act amendment": "consumer-protection-act-amended", "consumer protection 2019": "consumer-protection-act-amended",
  "indian legal system": "indian-legal-system", "legal system india": "indian-legal-system",
  "court hierarchy": "court-hierarchy-procedure", "hierarchy of courts": "court-hierarchy-procedure",

  // Reference & Practical Guides
  "landmark judgment": "landmark-judgments", "landmark judgments": "landmark-judgments",
  "legal dictionary": "legal-dictionary", "legal reference": "legal-reference",
  "practical guide": "practical-guides",

  // Constitutional Reference (now point to dedicated S3 keys)
  "fundamental rights": "fundamental-rights", "right to equality": "fundamental-rights", "right to freedom": "fundamental-rights", "freedom of speech": "fundamental-rights", "right to life": "fundamental-rights", "article 21": "fundamental-rights", "article 14": "fundamental-rights", "article 19": "fundamental-rights", "right to religion": "fundamental-rights", "constitutional remedies": "fundamental-rights",
  "fundamental duties": "dpsp-fundamental-duties", "directive principles": "dpsp-fundamental-duties", dpsp: "dpsp-fundamental-duties", "uniform civil code": "dpsp-fundamental-duties", "state policy": "dpsp-fundamental-duties",
  "constitution schedule": "constitutional-schedules", schedules: "constitutional-schedules", "seventh schedule": "constitutional-schedules", "union list": "constitutional-schedules", "state list": "constitutional-schedules", "concurrent list": "constitutional-schedules",
  "constitution part": "constitutional-parts", "part iii": "constitutional-parts", "part iv": "constitutional-parts", "emergency provisions": "constitutional-parts",
  "constitutional amendment": "constitutional-amendments", "constitutional amendments": "constitutional-amendments", "amendment procedure": "constitutional-amendments",
};

const fullTextActs = new Set([
  "constitution", "bharatiya-nyaya-sanhita", "bharatiya-nagrik-suraksha-sanhita", "bharatiya-sakshya-adhiniyam",
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
  "corporate-business-laws",
  "employment-law", "minimum-wages-act", "payment-of-wages-act", "industrial-disputes-act",
  "social-security-act", "trade-unions-act",
  "income-tax-act", "cgst-act", "customs-act", "central-excise-act", "taxation-law",
  "legal-drafting",
  "arms-act", "dowry-prohibition-act", "uapa-act", "pmla-act",
  "explosive-substances-act", "prevention-of-corruption-amended-act", "armed-forces-special-powers-act",
  "competition-act", "sebi-act", "fema-act", "fema-non-pci-act",
  "msme-act", "benami-transactions-act", "black-money-act",
  "arbitration-act", "companies-act", "copyright-act", "limitation-act",
  "negotiable-instruments-act", "sale-of-goods-act", "registration-act",
  "indian-partnership-act", "indian-stamp-act", "juvenile-justice-act",
  "motor-vehicles-act", "ndps-act", "pocso-act", "sarfaesi-act",
  "sc-st-act", "trade-marks-act", "banking-regulation-act",
  "prevention-of-corruption-act",
  "muslim-personal-law-act", "dissolution-of-muslim-marriages-act",
  "indian-divorce-act", "parsi-marriage-divorce-act", "indian-christian-marriage-act",
  "prohibition-child-marriage-act", "guardian-wards-act", "maintenance-parents-senior-citizens-act",
  "wildlife-protection-act", "forest-conservation-act", "water-act", "air-act",
  "national-green-tribunal-act", "biological-diversity-act",
  "factories-act", "essential-commodities-act",
  "food-safety-standards-act", "drugs-cosmetics-act", "dpdp-act", "aadhaar-act",
  "right-to-information-act", "consumer-protection-act-amended",
  "fundamental-rights", "dpsp-fundamental-duties", "constitutional-schedules",
  "constitutional-parts", "constitutional-amendments",
  "environment-protection-act",
  "court-hierarchy-procedure", "indian-legal-system",
  "patents-act", "geographical-indications-act",
  "rbi-act", "irdai-act",
  "contempt-of-courts-act", "official-secrets-act", "passport-act",
  "indian-telegraph-act", "census-act", "epidemic-diseases-act",
]);

async function getLegalKnowledge(query: string): Promise<string> {
  try {
    const parts: string[] = [];
    const lower = query.toLowerCase();

    const sectionMatches = [...query.matchAll(SECTION_PATTERN)];
    const articleMatches = [...query.matchAll(ARTICLE_PATTERN)];

    let targetAct = "";
    for (const [key, val] of Object.entries(actMap)) {
      if (lower.includes(key)) { targetAct = val; break; }
    }

    if (targetAct && sectionMatches.length > 0) {
      for (const match of sectionMatches) {
        const secNum = match[1];
        const sec = await s3kb.getSection(targetAct, secNum);
        if (sec) parts.push(`[${targetAct.toUpperCase()} Section ${sec.section}] ${sec.title}: ${sec.text}`);
      }
    }

    if (!targetAct && sectionMatches.length > 0) {
      const raw = await s3kb.getFullTextIndex();
      if (raw) {
        for (const entry of raw) {
          const id = typeof entry === "string" ? entry : entry.id;
          if (id === "constitution") continue;
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

    if (targetAct === "constitution" && articleMatches.length > 0) {
      for (const match of articleMatches) {
        const sec = await s3kb.getSection("constitution", match[1]);
        if (sec) parts.push(`[Constitution Article ${sec.section}] ${sec.title}: ${sec.text}`);
      }
    }

    if (articleMatches.length > 0 && targetAct !== "constitution") {
      for (const match of articleMatches) {
        const sec = await s3kb.getSection("constitution", match[1]);
        if (sec) parts.push(`[Constitution Article ${sec.section}] ${sec.title}: ${sec.text}`);
      }
    }

    if (targetAct && parts.length === 0) {
      if (fullTextActs.has(targetAct)) {
        const full = await s3kb.getFullText(targetAct);
        if (full) parts.push(`[${targetAct.toUpperCase()} Full Text]\n${full.substring(0, 3000)}...`);
      } else {
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

    if (parts.length === 0) {
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

    const refChecks: Array<{ keywords: string[]; key: string; label: string }> = [
      { keywords: ["bail", "bailable", "non-bailable"], key: "bailable-offenses", label: "Bailable/Non-Bailable Offenses" },
      { keywords: ["limitation", "time limit", "file a case", "file suit"], key: "limitation-periods", label: "Limitation Periods" },
      { keywords: ["writ", "habeas", "mandamus", "certiorari", "quo warranto"], key: "writ-types", label: "Types of Writs" },
      { keywords: ["court", "jurisdiction", "supreme court", "high court", "district court"], key: "court-hierarchy", label: "Court Hierarchy" },
    ];

    for (const ref of refChecks) {
      if (ref.keywords.some(k => lower.includes(k))) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

function extractTextFromContent(content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>): string {
  if (typeof content === "string") return content;
  return content.filter((p: { type: string }) => p.type === "text").map((p: { text?: string }) => p.text || "").join(" ");
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitKey = `chat:${session.user.id}`;
    const { allowed, retryAfterMs } = checkRateLimit(rateLimitKey, 30, 60_000);
    if (!allowed) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { messages, conversationType: rawConversationType } = body as { messages?: unknown; conversationType?: string };
    let conversationType = rawConversationType;
    if (conversationType === "chat") conversationType = "talk-to-ai";

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "messages must be a non-empty array" }, { status: 400 });
    }

    if (messages.length > MAX_MESSAGES) {
      return Response.json({ error: `Too many messages. Maximum is ${MAX_MESSAGES}.` }, { status: 400 });
    }

    if (conversationType && !VALID_CONVERSATION_TYPES.has(conversationType)) {
      return Response.json({ error: "Invalid conversationType" }, { status: 400 });
    }

    for (const msg of messages) {
      if (!msg || typeof msg !== "object") {
        return Response.json({ error: "Each message must be an object" }, { status: 400 });
      }
      const m = msg as { role?: string; content?: unknown };
      if (m.role !== "user" && m.role !== "assistant" && m.role !== "system") {
        return Response.json({ error: "Each message must have role: user, assistant, or system" }, { status: 400 });
      }
      if (typeof m.content === "string" && m.content.length > MAX_MESSAGE_LENGTH) {
        return Response.json({ error: `Message content too long. Maximum is ${MAX_MESSAGE_LENGTH} characters.` }, { status: 400 });
      }
      if (Array.isArray(m.content)) {
        for (const part of m.content) {
          if (!part || typeof part !== "object") {
            return Response.json({ error: "Invalid content part structure" }, { status: 400 });
          }
          const p = part as { type?: string };
          if (p.type !== "text" && p.type !== "image_url") {
            return Response.json({ error: "Content parts must be type 'text' or 'image_url'" }, { status: 400 });
          }
        }
      }
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "NVIDIA_API_KEY is not configured" }, { status: 500 });
    }

    const systemPrompt = getSystemPrompt(conversationType);
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop();

    const userQuery = lastUserMessage ? extractTextFromContent(lastUserMessage.content) : "";

    const greetingPattern = /^(hi|hello|hey|namaste|namaskar|good\s*(morning|afternoon|evening)|yo|sup|hii|helloo|hey there|hello there)\s*[!.]*$/i;
    if (userQuery && greetingPattern.test(userQuery.trim()) && conversationType !== "grill") {
      const greeting = "Hello! How can I assist you with Indian legal matters today?";
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: greeting })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    let needsSearch = false;
    if (userQuery) {
      needsSearch = await classifyQuery(userQuery);
    }

    let webSearchContext = "";
    if (needsSearch) {
      webSearchContext = await webSearch(userQuery);
    }

    const isTalkToAi = conversationType === "talk-to-ai";
    const legalContext = (isTalkToAi || needsSearch) ? "" : await getLegalKnowledge(userQuery);

    let finalSystemPrompt = systemPrompt;
    const contextParts: string[] = [];
    if (webSearchContext) contextParts.push(webSearchContext);
    if (legalContext) contextParts.push(legalContext);
    if (contextParts.length > 0) {
      finalSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Use the following information to answer the user's question. Incorporate this into your response:\n\n${contextParts.join("\n\n")}`;
    }

    let messagesWithSystem: { role: string; content: unknown }[];
    if (isTalkToAi) {
      const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").slice(-1);
      messagesWithSystem = [
        { role: "system", content: finalSystemPrompt },
        ...lastUserMsg,
      ];
    } else {
      messagesWithSystem = [
        { role: "system", content: finalSystemPrompt },
        ...messages.filter((m: { role: string }) => m.role !== "system"),
      ];
    }

    const maxTokens = conversationType === "analysis" ? 3072 : conversationType === "talk-to-ai" ? 2048 : conversationType === "grill" ? 768 : conversationType === "review" ? 3072 : conversationType === "draft" ? 3072 : 1024;

    const hasMultimodalContent = Array.isArray(lastUserMessage?.content) && lastUserMessage.content.some((p: { type: string }) => p.type === "image_url");
    const model = (conversationType === "review" || hasMultimodalContent) ? REVIEW_MODEL : NVIDIA_MODEL;

    const response = await fetch(NVIDIA_API_URL, {
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NVIDIA API error:", response.status, errorText);
      return Response.json({ error: "Failed to get response from AI" }, { status: response.status });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    function truncateToTwoSentences(text: string): string {
      const cleaned = text
        .replace(/\*{1,2}/g, "")
        .replace(/^(hello|hi|hey|good\s+morning|good\s+afternoon|good\s+evening|namaste|namaskar)[\s,!.]*/i, "")
        .replace(/^(step|key takeaways|summary|conclusion|to summarize|in summary|warning|note|important)\s*\d*\s*:?\s*/gim, "")
        .replace(/^[-#>\d]+\.?\s*/gm, "")
        .replace(/^[A-Za-z\s,]+:\s*$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      const sentences = [...cleaned.matchAll(/[A-Z][^.!?\n]+[.!?\n]+/g)];
      if (sentences.length >= 2) {
        return sentences.slice(0, 2).map(m => m[0].trim()).join(" ").trim();
      }
      if (sentences.length === 1) {
        return sentences[0][0].trim();
      }
      const firstMatch = cleaned.match(/[A-Z][^.!?\n]*[.!?\n]*/);
      return firstMatch ? firstMatch[0].trim() : "";
    }

    const stream = new ReadableStream({
      cancel() { /* client disconnected, clean up */ },
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let sseBuffer = "";
        let fullContent = "";

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
                const data = line.slice(6).trim();
                if (data === "[DONE]" || !data) continue;
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    if (isTalkToAi) {
                      fullContent += content;
                    } else {
                      const cleaned = stripThinkingTokens(content);
                      if (cleaned) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: cleaned })}\n\n`));
                      }
                    }
                  }
                } catch { /* skip */ }
              }
            }
          }

          if (isTalkToAi) {
            const truncated = truncateToTwoSentences(fullContent);
            if (truncated) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: truncated })}\n\n`));
            }
          }


          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          console.warn("Stream interrupted:", (error as Error).message);
        } finally {
          try { controller.enqueue(encoder.encode("data: [DONE]\n\n")); } catch { /* skip */ }
          try { controller.close(); } catch { /* stream already closed */ }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.warn("Chat API error:", (error as Error).message);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
