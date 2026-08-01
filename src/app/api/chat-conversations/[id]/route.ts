import { getAdminSession, requireAdminSession } from "../../_auth";
import { getChatConversation, updateChatConversation } from "../../_db";
import { errorResponse, jsonResponse } from "../../_sqlite";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getChatConversation(params.id);
    const session = getAdminSession();
    if (!session) {
      const requestUrl = new URL(_request.url);
      const token = requestUrl.searchParams.get("token") || "";
      const conversation = data.conversation as { visitor_token?: string };
      if (!token || token !== conversation.visitor_token) {
        return jsonResponse({ error: "Conversation access denied." }, 401);
      }
    }
    return jsonResponse(data);
  } catch (error) {
    return errorResponse(error, 404);
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const auth = requireAdminSession(["Admin", "Sales", "Engineer"]);
    if (auth.response) return auth.response;
    const payload = await request.json();
    return jsonResponse(await updateChatConversation(params.id, payload));
  } catch (error) {
    return errorResponse(error, 400);
  }
}
