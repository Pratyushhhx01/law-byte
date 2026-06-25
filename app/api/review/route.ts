import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/utils";
import pdf from "pdf-parse";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 8000;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const ALLOWED_TYPES = ["application/pdf", ...IMAGE_TYPES];

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimitKey = `review:${session.user.id}`;
    const { allowed, retryAfterMs } = checkRateLimit(rateLimitKey, 10, 60_000);
    if (!allowed) {
      return Response.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "File size must be under 10MB" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Unsupported file type. Please upload a PDF or image (PNG, JPEG, WebP, GIF)." },
        { status: 400 }
      );
    }

    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdf(buffer);

      let text = data.text?.trim() ?? "";
      const truncated = text.length > MAX_TEXT_LENGTH;
      if (truncated) {
        text = text.substring(0, MAX_TEXT_LENGTH);
      }

      return Response.json({
        text,
        fileName: file.name,
        pageCount: data.numpages ?? 0,
        truncated,
      });
    }

    if (IMAGE_TYPES.includes(file.type)) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mimeType = file.type;

      return Response.json({
        imageBase64: `data:${mimeType};base64,${base64}`,
        fileName: file.name,
        type: "image",
      });
    }

    return Response.json({ error: "Unsupported file type" }, { status: 400 });
  } catch (error) {
    console.error("Review error:", error);
    return Response.json({ error: "Failed to process file" }, { status: 500 });
  }
}
