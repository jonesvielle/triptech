import { makeSession, setSessionCookie, verifyPassword } from "../_auth";
import { getMasterPasswordHash, listAdminUsersForLogin } from "../_db";
import { errorResponse, jsonResponse } from "../_sqlite";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const password = String(payload.password || "");
    const storedMasterHash = await getMasterPasswordHash();
    const masterPassword = process.env.ADMIN_MASTER_PASSWORD || "TRIP2026";
    const masterPasswordMatches = storedMasterHash
      ? verifyPassword(password, storedMasterHash)
      : password === masterPassword;
    if (masterPasswordMatches) {
      const masterUser = {
        id: "master-admin",
        name: "Master admin",
        email: process.env.NEXT_PUBLIC_SUPPORTEMAILADDRESS || "admin@tri-p.tech",
        role: "Admin",
      };
      const session = makeSession(masterUser);
      return setSessionCookie(jsonResponse({ user: masterUser, session }), session);
    }

    const users = await listAdminUsersForLogin();
    const matchedUser = users.find((user: Record<string, unknown>) => verifyPassword(password, user.password_hash));
    if (!matchedUser) {
      return jsonResponse({ error: "Invalid password." }, 401);
    }
    const { password_hash: _passwordHash, ...safeUser } = matchedUser as Record<string, unknown>;
    const session = makeSession(safeUser);
    return setSessionCookie(jsonResponse({ user: safeUser, session }), session);
  } catch (error) {
    return errorResponse(error, 400);
  }
}
