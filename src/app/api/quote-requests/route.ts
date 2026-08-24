import { requireAdminSession } from "../_auth";
import { createQuote, listQuotes } from "../_db";
import { errorResponse, jsonResponse } from "../_sqlite";
import { sendMail, supportEmailAddress } from "../_mail";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = requireAdminSession(["Admin", "Sales", "Engineer", "Viewer"]);
    if (auth.response) return auth.response;
    return jsonResponse(await listQuotes());
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const savedQuote = await createQuote(payload);
    const emailResult = await sendQuoteEmails(payload);

    return jsonResponse({ ...savedQuote, email: emailResult }, 201);
  } catch (error) {
    return errorResponse(error, 400);
  }
}

function htmlEscape(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatNaira(value: unknown) {
  const amount = Math.round(Number(value || 0));
  return `₦${amount.toLocaleString()}`;
}

function quoteSummary(payload: Record<string, unknown>) {
  const quote = payload.quote && typeof payload.quote === "object"
    ? payload.quote as Record<string, unknown>
    : {};
  const recommendation = quote.recommendation && typeof quote.recommendation === "object"
    ? quote.recommendation as Record<string, unknown>
    : {};
  const quoteLines = Array.isArray(recommendation.quoteLines)
    ? recommendation.quoteLines as Array<Record<string, unknown>>
    : [];
  const topLines = quoteLines.slice(0, 8).map((line) => `
    <tr>
      <td style="padding:8px;border:1px solid #d8e7e3;">${htmlEscape(line.name)}</td>
      <td style="padding:8px;border:1px solid #d8e7e3;">${htmlEscape(line.description)}</td>
      <td style="padding:8px;border:1px solid #d8e7e3;text-align:right;">${htmlEscape(line.quantity)}</td>
      <td style="padding:8px;border:1px solid #d8e7e3;text-align:right;">${formatNaira(line.amount)}</td>
    </tr>
  `).join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:12px;font-family:Arial,sans-serif;font-size:13px;">
      <tr style="background:#082c3a;color:#fff;">
        <th style="padding:8px;text-align:left;">Item</th>
        <th style="padding:8px;text-align:left;">Description</th>
        <th style="padding:8px;text-align:right;">Qty</th>
        <th style="padding:8px;text-align:right;">Amount</th>
      </tr>
      ${topLines || `<tr><td colspan="4" style="padding:8px;border:1px solid #d8e7e3;">Quote items are attached in the saved request.</td></tr>`}
    </table>
  `;
}

function requestType(payload: Record<string, unknown>) {
  const quote = payload.quote && typeof payload.quote === "object"
    ? payload.quote as Record<string, unknown>
    : {};
  return String(quote.requestType || payload.requestType || "solar").trim().toLowerCase();
}

function clientEmailHtml(payload: Record<string, unknown>) {
  const type = requestType(payload);

  if (type === "contact" || type === "general") {
    return `
    <div style="font-family:Arial,sans-serif;color:#17323a;line-height:1.55;">
      <h2 style="color:#082c3a;margin-bottom:4px;">TRI-P Tech message received</h2>
      <p>Hello ${htmlEscape(payload.client_name || payload.clientName || "Client")},</p>
      <p>Thank you for contacting TRI-P Tech Limited. Our team has received your message and will follow up with the right next step.</p>
      <p style="margin-top:18px;color:#60777f;font-size:13px;">If this is urgent, you can still reach us through the phone or WhatsApp contact on our website.</p>
    </div>
  `;
  }

  return `
    <div style="font-family:Arial,sans-serif;color:#17323a;line-height:1.55;">
      <h2 style="color:#082c3a;margin-bottom:4px;">TRI-P Tech ${type === "cctv" ? "CCTV" : "solar"} quote request received</h2>
      <p>Hello ${htmlEscape(payload.client_name || payload.clientName || "Client")},</p>
      <p>${type === "cctv"
        ? "Thank you for requesting a TRI-P Tech CCTV estimate. Our team has received your camera coverage details and will follow up."
        : "Thank you for requesting a TRI-P Tech solar estimate. Our team has received your load details and will review the recommendation before final confirmation."}</p>
      ${type === "cctv" ? "" : `
      <p><strong>Estimated equipment cost:</strong> ${formatNaira(payload.total_cost)}</p>
      <p><strong>Daily energy:</strong> ${htmlEscape(payload.daily_energy_wh)} Wh</p>
      <p><strong>System voltage:</strong> ${htmlEscape(payload.system_voltage)} V</p>`}
      <p style="margin-top:18px;color:#60777f;font-size:13px;">This is an estimate request only. Final scope, product availability, installation route, and site details will be confirmed by TRI-P Tech engineers.</p>
    </div>
  `;
}

function internalEmailHtml(payload: Record<string, unknown>) {
  const type = requestType(payload);

  if (type === "contact" || type === "general") {
    return `
    <div style="font-family:Arial,sans-serif;color:#17323a;line-height:1.55;">
      <h2 style="color:#082c3a;margin-bottom:4px;">New TRI-P Tech website enquiry</h2>
      <p><strong>Client:</strong> ${htmlEscape(payload.client_name || payload.clientName || "Client")}</p>
      <p><strong>Email:</strong> ${htmlEscape(payload.email || payload.client_email || payload.clientEmail || "Not provided")}</p>
      <p><strong>Phone/WhatsApp:</strong> ${htmlEscape(payload.phone || "Not provided")}</p>
      <p><strong>Source:</strong> ${htmlEscape(payload.location || "Contact page")}</p>
      <p><strong>Message:</strong><br>${htmlEscape(payload.site_note || payload.siteNote || "Not provided")}</p>
    </div>
  `;
  }

  return `
    <div style="font-family:Arial,sans-serif;color:#17323a;line-height:1.55;">
      <h2 style="color:#082c3a;margin-bottom:4px;">New ${type === "cctv" ? "CCTV" : "solar"} quote request</h2>
      <p><strong>Client:</strong> ${htmlEscape(payload.client_name || payload.clientName || "Client")}</p>
      <p><strong>Email:</strong> ${htmlEscape(payload.email || payload.client_email || payload.clientEmail || "Not provided")}</p>
      <p><strong>Phone/WhatsApp:</strong> ${htmlEscape(payload.phone || "Not provided")}</p>
      <p><strong>Location:</strong> ${htmlEscape(payload.location || "Not provided")}</p>
      <p><strong>Site note:</strong> ${htmlEscape(payload.site_note || payload.siteNote || "Not provided")}</p>
      ${type === "cctv" ? "" : `<p><strong>Total estimate:</strong> ${formatNaira(payload.total_cost)}</p>`}
      ${quoteSummary(payload)}
    </div>
  `;
}

async function sendQuoteEmails(payload: Record<string, unknown>) {
  const type = requestType(payload);
  const isContact = type === "contact" || type === "general";
  const clientEmail = String(payload.email || payload.client_email || payload.clientEmail || "").trim();
  const internalEmail = supportEmailAddress();
  const result = {
    clientSent: false,
    internalSent: false,
    errors: [] as string[],
  };

  if (clientEmail) {
    try {
      await sendMail({
        to: clientEmail,
        subject: isContact
          ? "TRI-P Tech message received"
          : `TRI-P Tech ${type === "cctv" ? "CCTV" : "solar"} quote request received`,
        html: clientEmailHtml(payload),
      });
      result.clientSent = true;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : "Client email failed.");
    }
  }

  if (internalEmail) {
    try {
      await sendMail({
        to: internalEmail,
        subject: isContact
          ? "New TRI-P Tech website enquiry"
          : `New TRI-P Tech ${type === "cctv" ? "CCTV" : "solar"} quote request`,
        html: internalEmailHtml(payload),
      });
      result.internalSent = true;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : "Internal email failed.");
    }
  }

  return result;
}
