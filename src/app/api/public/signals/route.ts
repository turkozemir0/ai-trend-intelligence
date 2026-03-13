import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const source = searchParams.get("source");
  const limit = parseInt(searchParams.get("limit") || "20");

  let query = supabaseAdmin
    .from("signals")
    .select("*");

  if (source && (source === "github" || source === "hackernews")) {
    query = query.eq("source", source);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      data: data || [],
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60",
      },
    }
  );
}
