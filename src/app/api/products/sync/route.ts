import { requireAdminSession } from "../../_auth";
import { replaceProducts } from "../../_db";
import { errorResponse, jsonResponse } from "../../_sqlite";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = requireAdminSession(["Admin"]);
    if (auth.response) return auth.response;
    const payload = await request.json();
    return jsonResponse(await replaceProducts(payload));
  } catch (error) {
    return errorResponse(error, 400);
  }
}
