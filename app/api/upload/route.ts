import { NextRequest, NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be under 10MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const doc = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let fullText = "";
    const numPages = doc.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    if (!fullText || fullText.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from PDF. The file may be scanned or image-based." }, { status: 400 });
    }

    return NextResponse.json({
      text: fullText,
      numPages,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}
