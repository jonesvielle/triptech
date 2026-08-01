import { requireAdminSession } from "../../_auth";
import { deleteFeaturedVideo, updateFeaturedVideo } from "../../_db";
import { errorResponse, jsonResponse } from "../../_sqlite";

export const runtime = "nodejs";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const auth = requireAdminSession(["Admin", "Engineer"]);
    if (auth.response) return auth.response;
    const payload = await request.json();
    return jsonResponse(await updateFeaturedVideo(params.id, payload));
  } catch (error) {
    return errorResponse(error, 400);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const auth = requireAdminSession(["Admin"]);
    if (auth.response) return auth.response;
    return jsonResponse(await deleteFeaturedVideo(params.id));
  } catch (error) {
    return errorResponse(error, 400);
  }
}
