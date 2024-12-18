// app/api/sendEmail/route.ts
/* eslint-disable  */

import nodemailer from "nodemailer";

export async function POST(request: Request) {
  //   return;
  try {
    console.log("EMAIL_USER", process.env?.EMAIL_USER);
    const { to, subject, text } = await request.json();

    console.log("in route", {
      user: process.env?.EMAIL_USER, // Use environment variable
      pass: process.env?.EMAIL_PASS, // Use environment variable
    });

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env?.EMAIL_USER, // Use environment variable
        pass: process.env?.EMAIL_PASS, // Use environment variable
      },
    });

    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: text,
    });

    return new Response(
      JSON.stringify({ message: "Request sent successfully" }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending request:", error);
    return new Response(
      JSON.stringify({
        message: "Error sending email",
        error: error?.message ?? "Unknown error",
      }),
      { status: 500 }
    );
  }
}
