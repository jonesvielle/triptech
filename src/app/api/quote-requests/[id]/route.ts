import { requireAdminSession } from "../../_auth";
import { updateQuote } from "../../_db";
import { errorResponse, jsonResponse } from "../../_sqlite";

export const runtime = "nodejs";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminSession(["Admin", "Sales", "Engineer"]);
    if (auth.response) return auth.response;
    const payload = await request.json();
    return jsonResponse(await updateQuote(params.id, payload));
  } catch (error) {
    return errorResponse(error, 400);
  }
}
