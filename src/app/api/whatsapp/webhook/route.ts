import { createHmac, timingSafeEqual } from "crypto";
import { createChatMessage, getOrCreateChatConversation } from "../../_db";
import { errorResponse, jsonResponse } from "../../_sqlite";

export const runtime = "nodejs";

type WhatsAppMessage = {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
};

type WhatsAppContact = {
  wa_id?: string;
  profile?: { name?: string };
};

function verifySignature(request: Request, rawBody: string) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true;
  const signature = request.headers.get("x-hub-signature-256") || "";
  const expected = `sha256=${createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function messageBody(message: WhatsAppMessage) {
  if (message.text?.body) return message.text.body;
  if (message.button?.text) return message.button.text;
  if (message.interactive?.button_reply?.title) return message.interactive.button_reply.title;
  if (message.interactive?.list_reply?.title) return message.interactive.list_reply.title;
  return message.type ? `[${message.type} message]` : "[WhatsApp message]";
}

function contactName(contacts: WhatsAppContact[], waId: string) {
  return contacts.find((contact) => contact.wa_id === waId)?.profile?.name || `WhatsApp ${waId}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge") || "";

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Webhook verification failed.", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    if (!verifySignature(request, rawBody)) {
      return jsonResponse({ error: "Invalid WhatsApp webhook signature." }, 401);
    }

    const payload = JSON.parse(rawBody || "{}");
    const entries = Array.isArray(payload.entry) ? payload.entry : [];
    let savedMessages = 0;

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change.value || {};
        const contacts = Array.isArray(value.contacts) ? value.contacts as WhatsAppContact[] : [];
        const messages = Array.isArray(value.messages) ? value.messages as WhatsAppMessage[] : [];

        for (const message of messages) {
          const from = String(message.from || "").trim();
          if (!from) continue;
          const name = contactName(contacts, from);
          const thread = await getOrCreateChatConversation({
            channel: "whatsapp",
            external_id: from,
            visitor_name: name,
            phone: from,
            page_url: "WhatsApp",
            status: "waiting",
          });
          const conversation = thread.conversation as { id?: number };
          if (!conversation.id) continue;

          await createChatMessage({
            conversation_id: conversation.id,
            sender: "visitor",
            author: name,
            body: messageBody(message),
            meta: { whatsapp_message_id: message.id, timestamp: message.timestamp },
          });
          savedMessages += 1;
        }
      }
    }

    return jsonResponse({ ok: true, savedMessages });
  } catch (error) {
    return errorResponse(error, 400);
  }
}
