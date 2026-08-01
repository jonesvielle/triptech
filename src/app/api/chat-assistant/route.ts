import { errorResponse, jsonResponse } from "../_sqlite";

export const runtime = "nodejs";

type ChatMessage = {
  role?: string;
  content?: string;
  text?: string;
  message?: string;
};

const OPENAI_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";
const FALLBACK_REPLY =
  "Hello, how may I help you today?";

function fallbackReply(payload: Record<string, unknown>) {
  const visitorName = stringifySafe(payload.name || payload.visitorName || payload.client_name || payload.clientName).trim();
  return `Hello${visitorName ? ` ${visitorName}` : ""}, how may I help you today?`;
}

function headerValue(request: Request, key: string) {
  return request.headers.get(key) || request.headers.get(key.toLowerCase()) || "";
}

function isAuthorized(request: Request) {
  const secret = process.env.CHATBOT_WEBHOOK_SECRET;
  if (!secret) return true;
  const bearer = headerValue(request, "authorization").replace(/^Bearer\s+/i, "");
  const webhookSecret = headerValue(request, "x-chatbot-secret");
  return bearer === secret || webhookSecret === secret;
}

function stringifySafe(value: unknown) {
  if (typeof value === "string") return value;
  if (value == null) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

function extractMessage(payload: Record<string, unknown>) {
  const direct = [
    payload.message,
    payload.text,
    payload.body,
    payload.question,
    payload.query,
    payload.content,
  ].map(stringifySafe).find((value) => value.trim());

  if (direct) return direct.trim();

  const chatMessage = payload.chatMessage as ChatMessage | undefined;
  const nested = [
    chatMessage?.content,
    chatMessage?.text,
    chatMessage?.message,
  ].map(stringifySafe).find((value) => value.trim());

  if (nested) return nested.trim();

  const messages = Array.isArray(payload.messages) ? payload.messages as ChatMessage[] : [];
  const lastUserMessage = messages
    .slice()
    .reverse()
    .find((message) => message.role === "user" || message.role === "visitor" || message.content || message.text);

  return stringifySafe(lastUserMessage?.content || lastUserMessage?.text || lastUserMessage?.message).trim();
}

function buildConversation(payload: Record<string, unknown>, message: string) {
  const messages = Array.isArray(payload.messages) ? payload.messages as ChatMessage[] : [];
  const conversation = messages
    .slice(-8)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: stringifySafe(item.content || item.text || item.message).slice(0, 1200),
    }))
    .filter((item) => item.content.trim());

  if (!conversation.length) {
    conversation.push({ role: "user", content: message.slice(0, 1200) });
  }

  return conversation;
}

async function callOpenAI(payload: Record<string, unknown>, message: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      reply: fallbackReply(payload),
      source: "fallback",
      missingOpenAiKey: true,
    };
  }

  const visitorName = stringifySafe(payload.name || payload.visitorName || payload.client_name || payload.clientName).trim();
  const pageUrl = stringifySafe(payload.pageUrl || payload.url || payload.currentUrl).trim();
  const conversation = buildConversation(payload, message);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.3,
      max_tokens: 280,
      messages: [
        {
          role: "system",
          content: [
            "You are TRI-P Tech's website chat assistant.",
            "TRI-P Tech offers solar system design/installation, CCTV installation, 3D printing/prototyping, and product/shop support.",
            "Be brief, warm, and practical.",
            "The chat form already collects the visitor's contact details, so do not ask for their name, email, or phone number again.",
            "If the visitor only greets you, reply only with: Hello [visitor name if available], how may I help you today?",
            "Do not invent final solar prices, engineering guarantees, warranty terms, stock availability, or delivery promises.",
            "For solar sizing, guide the visitor to the solar calculator and say an engineer will confirm the final setup.",
            "For CCTV, ask for property type, number of areas to cover, location, and whether remote viewing is needed.",
            "For 3D printing, ask for size, material preference if known, quantity, deadline, and whether they have a file or sample.",
            "Answer basic questions directly. If the question needs pricing, scheduling, warranty, complaints, or final technical confirmation, hand over to TRI-P Tech staff.",
            "If the visitor wants a human, say a TRI-P Tech staff member will take over shortly.",
            visitorName ? `Visitor name: ${visitorName}.` : "",
            pageUrl ? `Current page: ${pageUrl}.` : "",
          ].filter(Boolean).join(" "),
        },
        ...conversation,
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI request failed: ${details.slice(0, 240)}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  return {
    reply: reply || FALLBACK_REPLY,
    source: "openai",
  };
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return jsonResponse({ error: "Unauthorized chat assistant request." }, 401);
    }

    const payload = await request.json().catch(() => ({}));
    const message = extractMessage(payload);

    if (!message) {
      return jsonResponse({
        reply: "Please send a message so TRI-P Tech can help.",
        source: "validation",
      }, 400);
    }

    try {
      const result = await callOpenAI(payload, message);
      return jsonResponse(result);
    } catch (error) {
      console.error("TRI-P chat assistant failed:", error);
      return jsonResponse({
        reply: fallbackReply(payload),
        source: "fallback",
        aiUnavailable: true,
        error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
      });
    }
  } catch (error) {
    return errorResponse(error, 500);
  }
}
