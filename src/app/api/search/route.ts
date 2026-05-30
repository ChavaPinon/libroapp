import { NextResponse } from "next/server";
import { searchBooks } from "@/lib/openlibrary";

// GET /api/search?q=dune — proxies Open Library search to the client.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const results = await searchBooks(q);
  return NextResponse.json({ results });
}
