import { NextRequest } from "next/server";

export function getAdminSecret(): string | null {
  return process.env.ADMIN_SECRET || process.env.CRON_SECRET || null;
}

export function isAdminAuthorized(request: NextRequest): boolean {
  const adminSecret = getAdminSecret();
  if (!adminSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${adminSecret}`;
}

