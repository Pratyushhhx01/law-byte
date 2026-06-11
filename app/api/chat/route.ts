import { NextRequest } from "next/server";
import { tavily } from "@tavily/core";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const BASE_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. You ONLY answer questions about Indian law. Never answer questions about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India.`;

const CHAT_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. When greeted reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. For EVERY other question, answer in EXACTLY TWO SHORT LINES ONLY. Maximum 2 lines. No exceptions. No tables. No bullet points. No lists. No headers. No multiple paragraphs. If you write more than 2 lines you are wrong.`;

const ANALYSIS_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. When greeted reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. When asked a legal question, provide a thorough analysis in 10-15 lines. Cover: brief explanation, relevant laws, key cases, risks, and recommendations. Use NUMBERED POINTS (1. 2. 3. etc.) with each point on a new line. Always put a blank line between points for readability. Do NOT use asterisks, markdown symbols, or any special formatting. Write case names and important terms in plain text only.`;

const TALK_TO_AI_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. When greeted reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. For EVERY other question, answer in EXACTLY TWO SHORT LINES ONLY. Maximum 2 lines. No exceptions. No tables. No bullet points. No lists. No headers. No multiple paragraphs. If you write more than 2 lines you are wrong.`;

const RESEARCH_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant conducting deep research. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. When greeted reply ONLY with: Hello! How can I assist you with Indian legal matters today? Nothing else. When provided with research results, give a comprehensive, well-structured research report in 15-20 lines. Cover: overview, key findings, relevant laws, important cases, current status, and implications. Use NUMBERED POINTS (1. 2. 3. etc.) with each point on a new line. Always put a blank line between points for readability. Do NOT use asterisks, markdown symbols, or any special formatting. Write case names and important terms in plain text only.`;

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
    case "research":
      return RESEARCH_SYSTEM_PROMPT;
    default:
      return CHAT_SYSTEM_PROMPT;
  }
}

async function classifyQuery(query: string, apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: CLASSIFIER_PROMPT },
          { role: "user", content: query },
        ],
        max_tokens: 256,
        temperature: 0,
        stream: false,
      }),
    });

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

async function deepResearch(query: string): Promise<string> {
  try {
    const researchResponse = await tvly.research(query, { stream: false }) as { requestId: string; status: string };
    
    if (researchResponse.status === "failed") {
      return "";
    }

    const requestId = researchResponse.requestId;

    let result = await tvly.getResearch(requestId) as { status?: string; content?: string | Record<string, any>; sources?: Array<{ title: string; url: string }> };
    let attempts = 0;
    while (result.status === "pending" || result.status === "in_progress") {
      if (attempts >= 60) break;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      result = await tvly.getResearch(requestId) as { status?: string; content?: string | Record<string, any>; sources?: Array<{ title: string; url: string }> };
      attempts++;
    }

    if (!result.content) {
      return "";
    }

    const content = typeof result.content === "string" ? result.content : JSON.stringify(result.content);
    const sources = result.sources
      ?.map((s) => `${s.title}: ${s.url}`)
      .join("\n") || "";

    return `Deep Research Results:\n\n${content}\n\nSources:\n${sources}`;
  } catch (error) {
    console.error("Tavily research error:", error);
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
    if (conversationType === "research") {
      webSearchContext = await deepResearch(userQuery);
    } else {
      webSearchContext = await webSearch(userQuery);
    }
  }

  let finalSystemPrompt = systemPrompt;
  if (webSearchContext) {
    finalSystemPrompt = `${systemPrompt}\n\nIMPORTANT: Use the following research results to answer the user's question. Incorporate this real-time information into your response:\n\n${webSearchContext}`;
  }

  const messagesWithSystem = [
    { role: "system", content: finalSystemPrompt },
    ...messages.filter((m: { role: string }) => m.role !== "system"),
  ];

  const maxTokens = conversationType === "analysis" ? 1024 : conversationType === "research" ? 2048 : 256;

  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
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
