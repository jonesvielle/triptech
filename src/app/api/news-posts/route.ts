import { requireAdminSession } from "../_auth";
import { createNewsPost, listNewsPosts } from "../_db";
import { errorResponse, jsonResponse } from "../_sqlite";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const includeDrafts = url.searchParams.get("includeDrafts") === "true";
    if (includeDrafts) {
      const auth = requireAdminSession(["Admin", "Engineer"]);
      if (auth.response) return auth.response;
    }
    return jsonResponse(await listNewsPosts(includeDrafts));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = requireAdminSession(["Admin", "Engineer"]);
    if (auth.response) return auth.response;
    const payload = await request.json();
    return jsonResponse(await createNewsPost(payload), 201);
  } catch (error) {
    return errorResponse(error, 400);
  }
}
