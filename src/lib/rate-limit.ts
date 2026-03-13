import { supabaseAdmin } from "@/lib/supabase/admin";
import { ApiKeyData } from "@/lib/api-auth";

const PLAN_LIMITS = {
  free: 100,
  pro: 10000,
  team: 100000,
  enterprise: 1000000,
};

export async function checkRateLimit(apiKeyData: ApiKeyData): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = PLAN_LIMITS[apiKeyData.plan];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabaseAdmin
    .from("api_usage")
    .select("*", { count: "exact", head: true })
    .eq("api_key_id", apiKeyData.id)
    .gte("created_at", today.toISOString());

  const used = count || 0;
  const remaining = Math.max(0, limit - used);
  const allowed = used < limit;

  return { allowed, remaining, limit };
}

export async function logApiUsage(
  apiKeyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
  userAgent: string | null,
  ipAddress: string | null
): Promise<void> {
  try {
    await supabaseAdmin.from("api_usage").insert({
      api_key_id: apiKeyId,
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      user_agent: userAgent,
      ip_address: ipAddress,
    });
  } catch (error) {
    console.error("Failed to log API usage:", error);
  }
}
