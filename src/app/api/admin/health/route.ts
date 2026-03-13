import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getBaseUrl } from "@/lib/seo-utils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const health: any = {
    timestamp: new Date().toISOString(),
    env: {
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      cron_secret: !!process.env.CRON_SECRET,
      site_url: getBaseUrl(),
    },
    data: {},
    errors: [],
  };

  try {
    const { data: lastCronRun, error: cronError } = await supabaseAdmin
      .from("cron_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (cronError && cronError.code !== "PGRST116") {
      health.errors.push(`cron_runs query error: ${cronError.message}`);
    } else {
      health.data.last_cron_run = lastCronRun;
    }
  } catch (error) {
    health.errors.push(`cron_runs error: ${error instanceof Error ? error.message : "unknown"}`);
  }

  try {
    const { data: recentSignals, error: signalsError } = await supabaseAdmin
      .from("signals")
      .select("id, source, title, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (signalsError) {
      health.errors.push(`signals query error: ${signalsError.message}`);
    } else {
      health.data.recent_signals = recentSignals;
    }
  } catch (error) {
    health.errors.push(`signals error: ${error instanceof Error ? error.message : "unknown"}`);
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: signalCountToday, error: countError } = await supabaseAdmin
      .from("signals")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    if (countError) {
      health.errors.push(`signal count error: ${countError.message}`);
    } else {
      health.data.signals_today = signalCountToday;
    }
  } catch (error) {
    health.errors.push(`signal count error: ${error instanceof Error ? error.message : "unknown"}`);
  }

  try {
    const { count: toolsCount, error: toolsError } = await supabaseAdmin
      .from("tools")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    if (toolsError) {
      health.errors.push(`tools count error: ${toolsError.message}`);
    } else {
      health.data.tools_count = toolsCount;
    }
  } catch (error) {
    health.errors.push(`tools count error: ${error instanceof Error ? error.message : "unknown"}`);
  }

  return NextResponse.json(health);
}
