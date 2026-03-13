import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const { data: categories, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { data: categories },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
