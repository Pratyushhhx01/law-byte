import { NextResponse } from "next/server";
import { tavily } from "@tavily/core";

const tvly = process.env.TAVILY_API_KEY
  ? tavily({ apiKey: process.env.TAVILY_API_KEY })
  : null;

interface NewsItem {
  title: string;
  url: string;
  snippet: string;
  date?: string;
}

export async function GET() {
  if (!tvly) {
    return NextResponse.json(
      { error: "Tavily API not configured" },
      { status: 500 },
    );
  }

  try {
    const queries = [
      "India Supreme Court judgment today 2026",
      "Indian law amendment new act 2026",
      "High Court India landmark ruling 2026",
    ];

    const allResults: NewsItem[] = [];

    const queryResults = await Promise.allSettled(
      queries.map((query) =>
        tvly.search(query, {
          search_depth: "basic",
          max_results: 5,
          include_answer: false,
        }),
      ),
    );

    for (const result of queryResults) {
      if (result.status === "fulfilled") {
        for (const r of result.value.results ?? []) {
          if (r.url && r.title) {
            allResults.push({
              title: r.title,
              url: r.url,
              snippet: (r.content || "").slice(0, 300),
              date: r.publishedDate || undefined,
            });
          }
        }
      }
    }

    const seen = new Set<string>();
    const legalKeywords = [
      "court",
      "judgment",
      "law",
      "legal",
      "act",
      "bill",
      "justice",
      "constitution",
      "parliament",
      "supreme",
      "high court",
      "tribunal",
      "criminal",
      "civil",
      "amendment",
      "section",
      "article",
      "penal",
      "contract",
      "tax",
      "gst",
    ];
    const junkDomains = [
      "instagram.com",
      "facebook.com",
      "twitter.com",
      "x.com",
      "tiktok.com",
      "youtube.com",
    ];
    const unique = allResults
      .filter((item) => {
        if (seen.has(item.url)) return false;
        seen.add(item.url);
        try {
          const host = new URL(item.url).hostname.toLowerCase();
          if (junkDomains.some((d) => host.includes(d))) return false;
        } catch {
          /* allow */
        }
        const text = `${item.title} ${item.snippet}`.toLowerCase();
        return legalKeywords.some((kw) => text.includes(kw));
      })
      .slice(0, 15);

    return NextResponse.json({ news: unique.slice(0, 15) });
  } catch (err) {
    console.error("News fetch error:", err);
    return NextResponse.json({ news: [] });
  }
}
