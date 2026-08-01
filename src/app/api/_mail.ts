import nodemailer from "nodemailer";

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
};

function mailTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS?.replace(/\s+/g, "");
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 465);
  const secure = String(process.env.EMAIL_SECURE || "true").toLowerCase() !== "false";

  if (!user || !pass) {
    throw new Error("Email sender is not configured.");
  }

  if (host) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export function supportEmailAddress() {
  return (
    process.env.QUOTE_INTERNAL_EMAIL ||
    process.env.EMAIL_USER ||
    process.env.NEXT_PUBLIC_SUPPORTEMAILADDRESS ||
    ""
  );
}

export async function sendMail({ to, subject, html }: SendMailInput) {
  if (!to) {
    throw new Error("Recipient email is required.");
  }

  const from = process.env.EMAIL_USER;
  if (!from) {
    throw new Error("Sender email is not configured.");
  }

  await mailTransporter().sendMail({
    from,
    to,
    subject,
    html,
  });
}
