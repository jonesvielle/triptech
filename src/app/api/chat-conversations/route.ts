import { requireAdminSession } from "../_auth";
import { createChatConversation, createChatMessage, getChatConversation, listChatConversations } from "../_db";
import { errorResponse, jsonResponse } from "../_sqlite";

export const runtime = "nodejs";

function fallbackReply(payload: Record<string, unknown>) {
  const name = String(payload.name || payload.visitor_name || payload.visitorName || "").trim();
  return `Hello${name ? ` ${name}` : ""}, how may I help you today?`;
}

async function getAssistantReply(payload: Record<string, unknown>, message: string, origin: string) {
  try {
    const response = await fetch(`${origin}/api/chat-assistant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CHATBOT_WEBHOOK_SECRET ? { "x-chatbot-secret": process.env.CHATBOT_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify({
        ...payload,
        message,
      }),
    });
    const data = await response.json().catch(() => ({}));
    return String(data.reply || fallbackReply(payload)).trim();
  } catch {
    return fallbackReply(payload);
  }
}

export async function GET() {
  try {
    const auth = requireAdminSession(["Admin", "Sales", "Engineer", "Viewer"]);
    if (auth.response) return auth.response;
    return jsonResponse(await listChatConversations());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const saved = await createChatConversation(payload);
    const conversation = saved.conversation as Record<string, unknown> | undefined;
    const message = String(payload.message || payload.body || payload.text || "").trim();

    if (conversation?.id && message) {
      const reply = await getAssistantReply(payload, message, new URL(request.url).origin);
      await createChatMessage({
        conversation_id: conversation.id,
        sender: "assistant",
        author: "TRI-P assistant",
        body: reply,
      });
      return jsonResponse(await getChatConversation(String(conversation.id)), 201);
    }

    return jsonResponse(saved, 201);
  } catch (error) {
    return errorResponse(error, 400);
  }
}
