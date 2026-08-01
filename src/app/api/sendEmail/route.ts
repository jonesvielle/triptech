import { sendMail } from "../_mail";

export async function POST(request: Request) {
  try {
    const { to, subject, text } = await request.json();

    await sendMail({
      to,
      subject,
      html: text,
    });

    return new Response(
      JSON.stringify({ message: "Request sent successfully" }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error sending request:", error);
    return new Response(
      JSON.stringify({
        message: "Error sending email",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
