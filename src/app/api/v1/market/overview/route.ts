import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-auth";
import { checkRateLimit, logApiUsage } from "@/lib/rate-limit";
import { getMarketOverview } from "@/lib/market";

export const runtime = "nodejs";

interface ErrorResponse {
  error: string;
  code: string;
  message: string;
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
      "/api/v1/market/overview",
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
    const overview = await getMarketOverview();

    await logApiUsage(
      apiKeyData.id,
      "/api/v1/market/overview",
      "GET",
      200,
      Date.now() - startTime,
      request.headers.get("user-agent"),
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip")
    );

    return NextResponse.json(overview, {
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
      "/api/v1/market/overview",
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

