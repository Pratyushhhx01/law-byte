import { NextRequest } from "next/server";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

const BASE_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. You ONLY answer questions about Indian law. Never answer questions about laws of any other country. If not about Indian law, respond ONLY with: Please ask a question related to Indian law or legal matters.`;

const CHAT_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. When greeted reply: Hello! How can I assist you with Indian legal matters today? For EVERY other question, answer in EXACTLY TWO SHORT LINES. Nothing more. No tables. No bullet points. No lists. No headers. No paragraphs. Just two lines. If you write more than two lines you are wrong.`;

const ANALYSIS_SYSTEM_PROMPT = `NEVER write more than 8-10 lines. Maximum 10 lines. Stop after 10 lines no matter what. Never use asterisks, markdown, or any special formatting symbols. Plain text only. You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: Please ask a question related to Indian law or legal matters. When greeted reply: Hello! How can I assist you with Indian legal matters today? When asked a legal question, give a clear analysis covering: brief explanation, relevant laws, key cases, risks, and recommendations — all within 10 lines maximum.`;

const TALK_TO_AI_SYSTEM_PROMPT = `You are Lawbite AI, an Indian legal assistant. ONLY answer about Indian law. Never answer about laws of any other country. If not about Indian law, respond ONLY with: Please ask a question related to Indian legal matters. When greeted reply: Hello! How can I assist you with Indian legal matters today? Be conversational, helpful, and informative about Indian legal topics.`;

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
                  const cleaned = content.replace(/\*\*/g, "");
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ content: cleaned })}\n\n`)
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
