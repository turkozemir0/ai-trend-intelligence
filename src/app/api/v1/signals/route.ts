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

interface SignalsResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
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
      "/api/v1/signals",
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
    const source = searchParams.get("source");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const signalType = searchParams.get("type");
    const toolId = searchParams.get("tool_id");

    let query = supabaseAdmin
      .from("signals")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (source) {
      const validSources = ["github", "hackernews", "producthunt", "reddit"];
      if (validSources.includes(source)) {
        query = query.eq("source", source);
      }
    }

    if (signalType) {
      query = query.eq("signal_type", signalType);
    }

    if (toolId) {
      query = query.eq("tool_id", toolId);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      await logApiUsage(
        apiKeyData.id,
        "/api/v1/signals",
        "GET",
        500,
        Date.now() - startTime,
        request.headers.get("user-agent"),
        request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
      );

      const errorResponse: ErrorResponse = {
        error: "database_error",
        code: "DB_QUERY_FAILED",
        message: error.message,
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: SignalsResponse = {
      data: data || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
    };

    await logApiUsage(
      apiKeyData.id,
      "/api/v1/signals",
      "GET",
      200,
      Date.now() - startTime,
      request.headers.get("user-agent"),
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
    );

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining - 1),
      },
    });
  } catch (error) {
    await logApiUsage(
      apiKeyData.id,
      "/api/v1/signals",
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
