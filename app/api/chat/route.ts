import { NextRequest } from "next/server";

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "NVIDIA_API_KEY is not configured" }, { status: 500 });
  }

  const response = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages,
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
