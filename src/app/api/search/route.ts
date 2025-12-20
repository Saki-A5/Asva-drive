export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { search as msSearch } from "@/lib/meilisearch";

// Simple search endpoint: GET /api/search?q=term&index=INDEX
export const GET = async(req: Request) => {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "";
    const index = url.searchParams.get("index") || "files";
    const filter = url.searchParams.get("filter") || undefined;
    const sort = url.searchParams.get("sort") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "40", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    if (!q) {
      return NextResponse.json({ error: "Missing query parameter 'q'" }, { status: 400 });
    }

    // Build MeiliSearch options
    const options: any = { limit, offset };
    if (filter) options.filter = filter;
    if (sort) options.sort = [sort];

    const res = await msSearch(index, q, options);

    return NextResponse.json({
      hits: res.hits,
      offset: res.offset,
      limit: res.limit,
      estimatedTotalHits: res.estimatedTotalHits,
      processingTimeMs: res.processingTimeMs,
      query: res.query,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
