import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[mail] RESEND_API_KEY manquant, email non envoyé :", subject);
    return { skipped: true };
  }

  const client = getResend();
  const { data, error } = await client.emails.send({
    from: process.env.EMAIL_FROM || "noreply@pipt-ong-gas.bj",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[mail] Erreur envoi email:", error);
    throw new Error("Erreur lors de l'envoi de l'email");
  }

  return { id: data?.id };
}
