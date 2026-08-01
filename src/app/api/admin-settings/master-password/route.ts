import { requireAdminSession } from "../../_auth";
import { getMasterPasswordHash, updateMasterPassword } from "../../_db";
import { errorResponse, jsonResponse } from "../../_sqlite";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = requireAdminSession(["Admin"]);
    if (auth.response) return auth.response;
    const hash = await getMasterPasswordHash();
    return jsonResponse({ configured: Boolean(hash) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = requireAdminSession(["Admin"]);
    if (auth.response) return auth.response;
    const payload = await request.json();
    const password = String(payload.password || "").trim();
    if (password.length < 8) {
      return jsonResponse({ error: "Use at least 8 characters for the master password." }, 400);
    }
    await updateMasterPassword(password);
    return jsonResponse({ saved: true });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
