import { NextRequest, NextResponse } from "next/server";
import { searchGoogle } from "@/lib/search";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Consulta vacía" }, { status: 400 });
    }

    const results = await searchGoogle(query, 10);

    return NextResponse.json({ results });
  } catch (error) {
    return handleApiError(error, "SEARCH_ERROR");
  }
}
