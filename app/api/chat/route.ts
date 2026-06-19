import { NextRequest } from "next/server";
import { tavily } from "@tavily/core";
import { s3kb } from "@/lib/s3";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const BASE_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. You ONLY answer questions about Indian law. Never answer questions about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. IMPORTANT: Never confuse sections (used in Acts/Codes like CrPC, IPC) with articles (used in the Constitution). They are different provisions. Never invent or hallucinate section numbers, article numbers, amendment numbers, or case names. Only use facts from the legal knowledge provided to you.`;

const CHAT_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. If the user's message is ONLY a greeting word (hi, hello, hey, namaste) with no legal question, reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. Otherwise, answer the question directly without any greeting. For EVERY other question, answer in EXACTLY TWO SHORT LINES ONLY. Maximum 2 lines. No exceptions. No tables. No bullet points. No lists. No headers. No multiple paragraphs. If you write more than 2 lines you are wrong. IMPORTANT: Never confuse sections (used in Acts/Codes like CrPC, IPC) with articles (used in the Constitution). They are different provisions. Never invent or hallucinate section numbers, article numbers, amendment numbers, or case names. Only use facts from the legal knowledge provided to you.`;

const ANALYSIS_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. If the user's message is ONLY a greeting word (hi, hello, hey, namaste) with no legal question, reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. Otherwise, answer the question directly without any greeting. When asked a legal question, provide a thorough analysis in 10-12 lines. Use NUMBERED POINTS (1. 2. 3. etc.) with each point on a new line. Always put a blank line between points for readability. After the numbered points, end with a single CONCLUSION paragraph that summarizes the key takeaway in 1-2 sentences. Do NOT use asterisks, markdown symbols, or any special formatting. Write case names and important terms in plain text only. IMPORTANT: Never confuse sections (used in Acts/Codes like CrPC, IPC) with articles (used in the Constitution). They are different provisions. Only use facts from the legal knowledge provided. Never invent section numbers, article numbers, amendments, or case names.`;

const TALK_TO_AI_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. If the user's message is ONLY a greeting word (hi, hello, hey, namaste) with no legal question, reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. Otherwise, answer the question directly without any greeting. For EVERY other question, answer in EXACTLY TWO SHORT LINES ONLY. Maximum 2 lines. No exceptions. No tables. No bullet points. No lists. No headers. No multiple paragraphs. If you write more than 2 lines you are wrong. IMPORTANT: Never confuse sections (used in Acts/Codes like CrPC, IPC) with articles (used in the Constitution). They are different provisions. Never invent or hallucinate section numbers, article numbers, amendment numbers, or case names. Only use facts from the legal knowledge provided to you.`;

const GRILL_SYSTEM_PROMPT = `You are Lawbite AI, a rigorous Indian legal advisor running a structured interrogation session called "Grill Me."

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
- When greeted, reply ONLY with: "I am ready to grill your idea. What legal problem are you facing?"
- Never use markdown, asterisks, or bullet points. Use plain text only.`;

const CLASSIFIER_PROMPT = `You are a query classifier. Determine if the user's query requires real-time web search to answer accurately.

Return ONLY "yes" or "no".

Use web search ("yes") when the query asks about:
- Current holders of positions (e.g., "who is the current Chief Justice", "who is the current President")
- Latest or recent events, judgments, or news
- Real-time data that changes frequently
- Recent amendments or new laws
- Anything with "current", "latest", "recent", "today", "now", "new", "2024", "2025", "2026"

Use normal response ("no") when the query asks about:
- Static legal concepts (e.g., "what is article 21")
- Established laws or procedures
- Historical legal information
- General legal advice
- Greetings or casual conversation`;

function getSystemPrompt(conversationType?: string) {
  switch (conversationType) {
    case "analysis":
      return ANALYSIS_SYSTEM_PROMPT;
    case "talk-to-ai":
      return TALK_TO_AI_SYSTEM_PROMPT;
    case "grill":
      return GRILL_SYSTEM_PROMPT;
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
      ipc: "ipc", "penal code": "ipc", "indian penal code": "ipc",
      bns: "bns", "nyaya sanhita": "bns", "bharatiya nyaya": "bns",
      crpc: "crpc", "criminal procedure": "crpc",
      bnss: "bnss", "nagarik suraksha": "bnss",
      cpc: "cpc", "civil procedure": "cpc",
      evidence: "evidence-act", "evidence act": "evidence-act",
      bsa: "bsa", "sakshya adhiniyam": "bsa", "sakshya": "bsa",
      constitution: "constitution",
      "transfer of property": "transfer-of-property-act", "property act": "transfer-of-property-act", "tpa": "transfer-of-property-act",
      contract: "indian-contract-act", "contract act": "indian-contract-act",
      "consumer protection": "consumer-protection-act", "consumer act": "consumer-protection-act",
      succession: "indian-succession-act", "succession act": "indian-succession-act",
      "hindu succession": "hindu-succession-act",
      "specific relief": "specific-relief-act",
      "police act": "police-act-1861",
      nia: "nia-act", "investigation agency": "nia-act",
      "human rights": "protection-of-human-rights-act",
      "domestic violence": "domestic-violence-act",
      "industrial dispute": "industrial-disputes-act",
      "payment of wages": "payment-of-wages-act",
      cgst: "cgst-act", "gst": "cgst-act",
      customs: "customs-act",
      excise: "excise-act",
      "trade union": "trade-unions-act",
      arbitration: "arbitration-act", "conciliation": "arbitration-act",
      "negotiable instrument": "negotiable-instruments-act", "cheque": "negotiable-instruments-act",
      limitation: "limitation-act",
      companies: "companies-act", "company act": "companies-act",
      "right to information": "right-to-information-act", rti: "right-to-information-act",
      "prevention of corruption": "prevention-of-corruption-act", corruption: "prevention-of-corruption-act",
      "motor vehicles": "motor-vehicles-act", "traffic": "motor-vehicles-act",
      "sale of goods": "sale-of-goods-act",
      ndps: "ndps-act", narcotic: "ndps-act",
      ibc: "ibc", "insolvency": "ibc", "bankruptcy": "ibc",
      "banking regulation": "banking-regulation-act", "banking act": "banking-regulation-act",
      copyright: "copyright-act", "copyright act": "copyright-act",
      "information technology": "information-technology-act", "it act": "information-technology-act",
      "juvenile justice": "juvenile-justice-act", "juvenile act": "juvenile-justice-act",
      pocso: "pocso-act", "protection of children": "pocso-act",
      registration: "registration-act", "registration act": "registration-act",
      "indian stamp": "indian-stamp-act", "stamp act": "indian-stamp-act",
      "indian partnership": "indian-partnership-act", "partnership act": "indian-partnership-act",
      "sc st": "sc-st-act", "atrocities": "sc-st-act", "prevention of atrocities": "sc-st-act",
      "environment protection": "environment-protection-act", "environment act": "environment-protection-act",
      "trade marks": "trade-marks-act", "trademark": "trade-marks-act",
      sarfaesi: "sarfaesi-act", "securitisation": "sarfaesi-act",
    };

    // Find which act is being referenced
    let targetAct = "";
    for (const [key, val] of Object.entries(actMap)) {
      if (lower.includes(key)) { targetAct = val; break; }
    }

    const fullTextActs = new Set([
      "bns", "bnss", "bsa", "transfer-of-property-act", "indian-contract-act",
      "consumer-protection-act", "indian-succession-act", "hindu-succession-act",
      "specific-relief-act", "police-act-1861", "nia-act", "protection-of-human-rights-act",
      "domestic-violence-act", "industrial-disputes-act", "payment-of-wages-act",
      "cgst-act", "customs-act", "excise-act", "trade-unions-act", "arbitration-act",
      "negotiable-instruments-act", "limitation-act", "companies-act", "right-to-information-act",
      "prevention-of-corruption-act", "motor-vehicles-act", "sale-of-goods-act", "ndps-act", "ibc",
      "banking-regulation-act", "copyright-act", "information-technology-act",
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

    // Case 1d: Article number query without specifying an act → assume Constitution
    // Runs regardless of whether sections were already found (e.g. "difference between article 144 and section 144")
    if (!targetAct && articleMatches.length > 0) {
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
  const userQuery = lastUserMessage?.content || "";

  let needsSearch = false;
  if (userQuery) {
    needsSearch = await classifyQuery(userQuery, apiKey);
  }

  let webSearchContext = "";
  if (needsSearch) {
    webSearchContext = await webSearch(userQuery);
  }

  const legalContext = await getLegalKnowledge(userQuery);

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

  const maxTokens = conversationType === "analysis" ? 1024 : conversationType === "grill" ? 512 : 256;

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
      model: NVIDIA_MODEL,
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

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
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
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                  );
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
