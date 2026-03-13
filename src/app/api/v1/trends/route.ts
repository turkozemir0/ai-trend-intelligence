import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { validateApiKey } from "@/lib/api-auth";
import { checkRateLimit, logApiUsage } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface ErrorResponse {
  error: string;
  code: string;
  message: string;
}

interface TrendsResponse {
  data: any[];
  window: string;
  summary?: Record<string, unknown>;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const apiKeyData = await validateApiKey(request);

  if (!apiKeyData) {
    const errorResponse: ErrorResponse = {
      error: "unauthorized",
      code: "INVALID_API_KEY",
      message: "Invalid or missing API key",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  const rateLimit = await checkRateLimit(apiKeyData);

  if (!rateLimit.allowed) {
    const errorResponse: ErrorResponse = {
      error: "rate_limit_exceeded",
      code: "RATE_LIMIT_EXCEEDED",
      message: `Rate limit exceeded. Limit: ${rateLimit.limit} requests per day.`,
    };

    await logApiUsage(
      apiKeyData.id,
      "/api/v1/trends",
      "GET",
      429,
      Date.now() - startTime,
      request.headers.get("user-agent"),
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
    );

    return NextResponse.json(errorResponse, {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
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
      await logApiUsage(
        apiKeyData.id,
        "/api/v1/trends",
        "GET",
        404,
        Date.now() - startTime,
        request.headers.get("user-agent"),
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
      );

      const errorResponse: ErrorResponse = {
        error: "not_found",
        code: "TOOL_NOT_FOUND",
        message: "Tool not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const { data: directSignals } = await supabaseAdmin
      .from("signals")
      .select("created_at, score, source, title, tool_id")
      .eq("tool_id", toolId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true });

    let signals = directSignals || [];

    if (signals.length === 0) {
      const { data: fallbackSignals } = await supabaseAdmin
        .from("signals")
        .select("created_at, score, source, title, tool_id")
        .ilike("title", `%${tool.name}%`)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      signals = fallbackSignals || [];
    }

    const response: TrendsResponse = {
      data: signals,
      window,
      summary: {
        tool_id: tool.id,
        tool_name: tool.name,
        trend_score: tool.trend_score,
        trend_score_24h: tool.trend_score_24h,
        trend_score_7d: tool.trend_score_7d,
        signals_24h: tool.signals_24h,
        signals_7d: tool.signals_7d,
        github_stars: tool.github_stars,
        stars_weekly_delta: tool.stars_weekly_delta,
        matched_signals: signals.length,
      },
    };

    await logApiUsage(
      apiKeyData.id,
      "/api/v1/trends",
      "GET",
      200,
      Date.now() - startTime,
      request.headers.get("user-agent"),
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
    );

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining - 1),
      },
    });
  } catch (error) {
    await logApiUsage(
      apiKeyData.id,
      "/api/v1/trends",
      "GET",
      500,
      Date.now() - startTime,
      request.headers.get("user-agent"),
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
    );

    const errorResponse: ErrorResponse = {
      error: "internal_error",
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
