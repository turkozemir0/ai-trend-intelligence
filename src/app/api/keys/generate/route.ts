import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generateApiKey } from "@/lib/api-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_email, name, plan } = body;

    if (!user_email || !name) {
      return NextResponse.json(
        { error: "user_email and name are required" },
        { status: 400 }
      );
    }

    const validPlans = ["free", "pro", "team", "enterprise"];
    const selectedPlan = validPlans.includes(plan) ? plan : "free";

    const { key, hash, prefix } = generateApiKey();

    const { data, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        user_email,
        name,
        key_hash: hash,
        key_prefix: prefix,
        plan: selectedPlan,
        is_active: true,
      })
      .select("id, key_prefix, plan, created_at")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create API key", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      api_key: key,
      key_prefix: prefix,
      plan: selectedPlan,
      warning: "Save this key securely. It will not be shown again.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
