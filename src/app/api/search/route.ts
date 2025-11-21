export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { search as msSearch } from "@/lib/meilisearch";

// Simple search endpoint: GET /api/search?q=term&index=INDEX
export const GET = async(req: Request) => {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const index = url.searchParams.get("index") || "files";

    if (!q) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    const res = await msSearch(index, q, { limit: 40 });

    return NextResponse.json({ hits: res.hits, offset: res.offset, limit: res.limit, estimatedTotalHits: res.estimatedTotalHits });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
