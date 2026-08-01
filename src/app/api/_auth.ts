import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type AdminRole = "Admin" | "Sales" | "Engineer" | "Viewer";

export type AdminSession = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  exp: number;
};

const sessionCookieName = "trip_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 8;

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || process.env.EMAIL_PASS || "trip-dev-session-secret";
}

function base64Url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function normalizeRole(value: unknown): AdminRole {
  const role = String(value || "").trim();
  return ["Admin", "Sales", "Engineer", "Viewer"].includes(role) ? role as AdminRole : "Viewer";
}

function signPayload(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: unknown) {
  const hash = String(storedHash || "");
  if (!password || !hash) return false;

  if (hash.startsWith("scrypt$")) {
    const [, salt, saved] = hash.split("$");
    if (!salt || !saved) return false;
    const current = scryptSync(password, salt, 64);
    const savedBuffer = Buffer.from(saved, "hex");
    return savedBuffer.length === current.length && timingSafeEqual(savedBuffer, current);
  }

  const legacySha = createHash("sha256").update(password).digest("hex");
  return legacySha === hash;
}

export function makeSession(user: Record<string, unknown>): AdminSession {
  return {
    id: String(user.id || ""),
    name: String(user.name || "Admin"),
    email: String(user.email || ""),
    role: normalizeRole(user.role),
    exp: Math.floor(Date.now() / 1000) + sessionMaxAgeSeconds,
  };
}

export function setSessionCookie(response: Response, session: AdminSession) {
  const payload = base64Url(JSON.stringify(session));
  const signature = signPayload(payload);
  response.headers.append(
    "Set-Cookie",
    `${sessionCookieName}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionMaxAgeSeconds}; ${
      process.env.NODE_ENV === "production" ? "Secure; " : ""
    }`
  );
  return response;
}

export function clearSessionCookie(response: Response) {
  response.headers.append(
    "Set-Cookie",
    `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${
      process.env.NODE_ENV === "production" ? "Secure; " : ""
    }`
  );
  return response;
}

export function getAdminSession(): AdminSession | null {
  const raw = cookies().get(sessionCookieName)?.value || "";
  const [payload, signature] = raw.split(".");
  if (!payload || !signature || signPayload(payload) !== signature) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      ...session,
      role: normalizeRole(session.role),
    };
  } catch {
    return null;
  }
}

export function requireAdminSession(roles: AdminRole[] = ["Admin", "Sales", "Engineer", "Viewer"]) {
  const session = getAdminSession();
  if (!session) {
    return { session: null, response: Response.json({ error: "Admin login required." }, { status: 401 }) };
  }
  if (!roles.includes(session.role)) {
    return { session: null, response: Response.json({ error: "Your role cannot perform this action." }, { status: 403 }) };
  }
  return { session, response: null };
}
