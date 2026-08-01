# TRI-P Tech Chat Assistant

This app has a server endpoint for connecting Tawk.to, WhatsApp middleware, or another chat platform to ChatGPT:

```text
POST /api/chat-assistant
```

## Required environment values

```text
OPENAI_API_KEY=your_openai_api_key
CHATBOT_WEBHOOK_SECRET=make_a_private_secret
OPENAI_CHAT_MODEL=gpt-4.1-mini
```

`CHATBOT_WEBHOOK_SECRET` is optional in local testing, but should be set in production. The chat platform should send it as either:

```text
Authorization: Bearer your_secret
```

or:

```text
x-chatbot-secret: your_secret
```

## Request body examples

Simple message:

```json
{
  "message": "I need a solar quote",
  "name": "Client name",
  "phone": "080..."
}
```

Conversation style:

```json
{
  "visitorName": "Client name",
  "pageUrl": "https://tri-p.tech/services/solar",
  "messages": [
    { "role": "user", "content": "I need CCTV for my shop" }
  ]
}
```

## Response

```json
{
  "reply": "Thanks for contacting TRI-P Tech...",
  "source": "openai"
}
```

If `OPENAI_API_KEY` is missing, the endpoint returns a safe fallback response instead of failing.
