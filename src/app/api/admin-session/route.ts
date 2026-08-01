import { clearSessionCookie, getAdminSession } from "../_auth";
import { jsonResponse } from "../_sqlite";

export const runtime = "nodejs";

export async function GET() {
  const session = getAdminSession();
  if (!session) return jsonResponse({ user: null }, 401);
  return jsonResponse({ user: session });
}

export async function DELETE() {
  return clearSessionCookie(jsonResponse({ signedOut: true }));
}
