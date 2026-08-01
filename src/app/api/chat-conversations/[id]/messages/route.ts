import { getAdminSession } from "../../../_auth";
import { createChatMessage, getChatConversation } from "../../../_db";
import { errorResponse, jsonResponse } from "../../../_sqlite";

export const runtime = "nodejs";

type ChatConversationAccess = {
  visitor_token?: string;
  channel?: string;
  external_id?: string;
  phone?: string;
};

async function sendWhatsAppText(to: string, body: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || "v20.0";

  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp API credentials are not configured.");
  }

  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        preview_url: false,
        body,
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`WhatsApp send failed: ${details.slice(0, 240)}`);
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = await request.json();
    const session = getAdminSession();
    const token = String(payload.visitor_token || payload.visitorToken || "").trim();
    const current = await getChatConversation(params.id);
    const conversation = current.conversation as ChatConversationAccess;
    const isVisitorTokenValid = Boolean(token && conversation?.visitor_token && token === conversation.visitor_token);

    if (!session && !isVisitorTokenValid) {
      return jsonResponse({ error: "Conversation access denied." }, 401);
    }

    const sender = isVisitorTokenValid ? "visitor" : "staff";
    const author = isVisitorTokenValid
      ? String(payload.author || payload.visitor_name || payload.visitorName || "Website visitor").trim()
      : session?.name || "TRI-P staff";
    const body = String(payload.body || "").trim();

    if (!body) {
      return jsonResponse({ error: "Message cannot be empty." }, 400);
    }

    if (!isVisitorTokenValid && conversation.channel === "whatsapp") {
      const recipient = String(conversation.external_id || conversation.phone || "").replace(/\D/g, "");
      if (!recipient) {
        return jsonResponse({ error: "This WhatsApp conversation has no recipient number." }, 400);
      }
      await sendWhatsAppText(recipient, body);
    }

    await createChatMessage({
      ...payload,
      conversation_id: params.id,
      sender,
      author,
      body,
    });
    return jsonResponse(await getChatConversation(params.id), 201);
  } catch (error) {
    return errorResponse(error, 400);
  }
}
