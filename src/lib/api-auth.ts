import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

export interface ApiKeyData {
  id: string;
  user_email: string;
  plan: "free" | "pro" | "team" | "enterprise";
  is_active: boolean;
}

export async function validateApiKey(request: NextRequest): Promise<ApiKeyData | null> {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.substring(7);
  
  if (!apiKey || apiKey.length < 32) {
    return null;
  }

  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  const { data: keyData, error } = await supabaseAdmin
    .from("api_keys")
    .select("id, user_email, plan, is_active, expires_at")
    .eq("key_hash", keyHash)
    .single();

  if (error || !keyData) {
    return null;
  }

  if (!keyData.is_active) {
    return null;
  }

  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return null;
  }

  await supabaseAdmin
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyData.id);

  return {
    id: keyData.id,
    user_email: keyData.user_email,
    plan: keyData.plan as "free" | "pro" | "team" | "enterprise",
    is_active: keyData.is_active,
  };
}

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `ait_${crypto.randomBytes(32).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(key).digest("hex");
  const prefix = key.substring(0, 11);
  
  return { key, hash, prefix };
}
