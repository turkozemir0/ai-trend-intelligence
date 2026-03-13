import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateApiKey } from "@/lib/api-auth";

export const runtime = "nodejs";

interface ErrorResponse {
  error: string;
  code: string;
  message: string;
}

interface TrendsResponse {
  data: any[];
  window: string;
}

export async function GET(request: NextRequest) {
  const apiKeyData = await validateApiKey(request);

  if (!apiKeyData) {
    const errorResponse: ErrorResponse = {
      error: "unauthorized",
      code: "INVALID_API_KEY",
      message: "Invalid or missing API key",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get("tool_id");
    const window = searchParams.get("window") || "7d";

    if (!toolId) {
      const errorResponse: ErrorResponse = {
        error: "validation_error",
        code: "MISSING_TOOL_ID",
        message: "tool_id parameter is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const validWindows = ["24h", "7d", "30d"];
    if (!validWindows.includes(window)) {
      const errorResponse: ErrorResponse = {
        error: "validation_error",
        code: "INVALID_WINDOW",
        message: "window must be one of: 24h, 7d, 30d",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const now = new Date();
    let startDate: Date;

    switch (window) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const { data: tool } = await supabaseAdmin
      .from("tools")
      .select("id, name, trend_score, trend_score_24h, trend_score_7d, signals_24h, signals_7d, github_stars, stars_weekly_delta")
      .eq("id", toolId)
      .single();

    if (!tool) {
      const errorResponse: ErrorResponse = {
        error: "not_found",
        code: "TOOL_NOT_FOUND",
        message: "Tool not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const { data: signals } = await supabaseAdmin
      .from("signals")
      .select("created_at, score, source")
      .ilike("title", `%${tool.name}%`)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    const response: TrendsResponse = {
      data: signals || [],
      window,
    };

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: "internal_error",
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
