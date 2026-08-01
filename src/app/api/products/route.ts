import { requireAdminSession } from "../_auth";
import { createProduct, listProducts } from "../_db";
import { errorResponse, jsonResponse } from "../_sqlite";

export const runtime = "nodejs";

export async function GET() {
  try {
    return jsonResponse(await listProducts());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = requireAdminSession(["Admin", "Engineer"]);
    if (auth.response) return auth.response;
    const payload = await request.json();
    return jsonResponse(await createProduct(payload), 201);
  } catch (error) {
    return errorResponse(error, 400);
  }
}
