import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabaseAdmin
    .from("tools")
    .select("*, category:categories(*)", { count: "exact" })
    .eq("is_published", true);

  if (category) {
    const { data: categoryData } = await supabaseAdmin
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();

    if (categoryData) {
      query = query.eq("category_id", categoryData.id);
    }
  }

  const { data, error, count } = await query
    .order("trend_score", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      data: data || [],
      total: count || 0,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300",
      },
    }
  );
}
