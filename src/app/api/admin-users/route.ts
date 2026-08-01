import { requireAdminSession } from "../_auth";
import { createAdminUser, listAdminUsers } from "../_db";
import { errorResponse, jsonResponse } from "../_sqlite";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = requireAdminSession(["Admin", "Sales", "Engineer", "Viewer"]);
    if (auth.response) return auth.response;
    return jsonResponse(await listAdminUsers());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = requireAdminSession(["Admin"]);
    if (auth.response) return auth.response;
    const payload = await request.json();
    return jsonResponse(await createAdminUser(payload), 201);
  } catch (error) {
    return errorResponse(error, 400);
  }
}
