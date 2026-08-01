import { requireAdminSession } from "../../_auth";
import { deleteNewsPost, updateNewsPost } from "../../_db";
import { errorResponse, jsonResponse } from "../../_sqlite";

export const runtime = "nodejs";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const auth = requireAdminSession(["Admin", "Engineer"]);
    if (auth.response) return auth.response;
    const payload = await request.json();
    return jsonResponse(await updateNewsPost(context.params.id, payload));
  } catch (error) {
    return errorResponse(error, 400);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const auth = requireAdminSession(["Admin"]);
    if (auth.response) return auth.response;
    return jsonResponse(await deleteNewsPost(context.params.id));
  } catch (error) {
    return errorResponse(error, 400);
  }
}
