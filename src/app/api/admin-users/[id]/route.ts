import { requireAdminSession } from "../../_auth";
import { deleteAdminUser, updateAdminUser } from "../../_db";
import { errorResponse, jsonResponse } from "../../_sqlite";

export const runtime = "nodejs";

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const auth = requireAdminSession(["Admin"]);
    if (auth.response) return auth.response;
    const payload = await request.json();
    return jsonResponse(await updateAdminUser(context.params.id, payload));
  } catch (error) {
    return errorResponse(error, 400);
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  try {
    const auth = requireAdminSession(["Admin"]);
    if (auth.response) return auth.response;
    return jsonResponse(await deleteAdminUser(context.params.id));
  } catch (error) {
    return errorResponse(error, 400);
  }
}
