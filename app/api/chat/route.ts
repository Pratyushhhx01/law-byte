import { NextRequest } from "next/server";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const BASE_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. You ONLY answer questions about Indian law. Never answer questions about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India.`;

const CHAT_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. When greeted reply: Hello! How can I assist you with Indian legal matters today? IMPORTANT: Each distinct topic or concept MUST be a SEPARATE paragraph separated by a blank line. For example, if asked about CAA and NRC, write about CAA first, then leave a blank line, then write about NRC. For EVERY other question, answer in EXACTLY TWO SHORT LINES. Nothing more. No tables. No bullet points. No lists. No headers. No paragraphs. Just two lines. If you write more than two lines you are wrong.`;

const ANALYSIS_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. When greeted reply: Hello! How can I assist you with Indian legal matters today? When asked a legal question, give a clear analysis using NUMBERED POINTS (1. 2. 3. etc.) with each point on a new line. IMPORTANT: Each distinct topic, concept, law, or item MUST be a SEPARATE numbered point. For example, if asked about CAA and NRC, write them as two separate points (one for CAA, one for NRC) — never combine multiple topics in one point. Cover: brief explanation, relevant laws, key cases, risks, and recommendations. Maximum 10 points. Each point must start with a number followed by a period and a space, then the point content. Always put a blank line between points for readability. Do NOT use asterisks, markdown symbols, or any special formatting. Write case names and important terms in plain text only.`;

const TALK_TO_AI_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: I can only provide information related to Indian law. Please ask a legal question concerning India. When greeted reply: Hello! How can I assist you with Indian legal matters today? IMPORTANT: Each distinct topic or concept MUST be a SEPARATE paragraph separated by a blank line. For example, if asked about CAA and NRC, write about CAA first, then leave a blank line, then write about NRC. Be conversational, helpful, and informative about Indian legal topics.`;

function getSystemPrompt(conversationType?: string) {
  switch (conversationType) {
    case "analysis":
      return ANALYSIS_SYSTEM_PROMPT;
    case "talk-to-ai":
      return TALK_TO_AI_SYSTEM_PROMPT;
    default:
      return CHAT_SYSTEM_PROMPT;
  }
}

export async function POST(request: NextRequest) {
  const { messages, conversationType } = await request.json();

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "NVIDIA_API_KEY is not configured" }, { status: 500 });
  }

  const systemPrompt = getSystemPrompt(conversationType);

  const messagesWithSystem = [
    { role: "system", content: systemPrompt },
    ...messages.filter((m: { role: string }) => m.role !== "system"),
  ];

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
      max_tokens: 16384,
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
