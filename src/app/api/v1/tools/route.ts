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

interface ToolsResponse {
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
      "/api/v1/tools",
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
    const category = searchParams.get("category");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sort") || "trend_score";
    const order = searchParams.get("order") || "desc";

    let query = supabaseAdmin
      .from("tools")
      .select("*, category:categories(*)", { count: "exact" })
      .eq("is_published", true);

    if (category) {
      query = query.eq("category.slug", category);
    }

    const validSortFields = ["trend_score", "trend_score_24h", "trend_score_7d", "github_stars", "created_at"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "trend_score";
    const sortOrder = order === "asc" ? { ascending: true } : { ascending: false };

    query = query.order(sortField, sortOrder).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      const errorResponse: ErrorResponse = {
        error: "database_error",
        code: "DB_QUERY_FAILED",
        message: error.message,
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: ToolsResponse = {
      data: data || [],
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
    };

    await logApiUsage(
      apiKeyData.id,
      "/api/v1/tools",
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
    const errorResponse: ErrorResponse = {
      error: "internal_error",
      code: "INTERNAL_SERVER_ERROR",
      message: error instanceof Error ? error.message : "Unknown error",
    };

    await logApiUsage(
      apiKeyData.id,
      "/api/v1/tools",
      "GET",
      500,
      Date.now() - startTime,
      request.headers.get("user-agent"),
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
    );

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
