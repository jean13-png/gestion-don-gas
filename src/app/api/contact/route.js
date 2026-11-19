import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { envoyerMail, templateEmail, OWNER_EMAIL } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Formulaire de contact public (donongas.com/contact).
 * Enregistre le message en base (visible dans l'admin, onglet Contact)
 * et notifie la boite officielle infos@ongglobalactionsolidarite.com.
 */

const SUJETS = {
  DON: "Question sur un don",
  PARTENARIAT: "Demande de partenariat",
  PRESSE: "Presse / média",
  AUTRE: "Autre",
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request) {
  try {
    const ip =
      (request.headers.get("x-forwarded-for") || "").split(",")[0]?.trim() ||
      "unknown";
    const autorise = await checkRateLimit(`contact:${ip}`, 10 * 60_000, 5);
    if (!autorise) {
      return NextResponse.json(
        { ok: false, erreur: "Trop de messages envoyés. Merci de réessayer dans quelques minutes." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const prenom = String(body?.prenom ?? "").trim().slice(0, 80);
    const nom = String(body?.nom ?? "").trim().slice(0, 80);
    const email = String(body?.email ?? "").trim().slice(0, 160);
    const sujet = String(body?.sujet ?? "");
    const message = String(body?.message ?? "").trim().slice(0, 5000);
    const piege = String(body?.site ?? "").trim(); // champ anti-robots caché

    if (
      piege ||
      !prenom ||
      !nom ||
      !message ||
      !SUJETS[sujet] ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
    ) {
      return NextResponse.json(
        { ok: false, erreur: "Formulaire invalide, vérifiez les champs." },
        { status: 400 }
      );
    }

    await prisma.contactMessage.create({
      data: { prenom, nom, email, sujet, message },
    });

    await envoyerMail({
      to: OWNER_EMAIL,
      sujet: `[Contact site dons] ${SUJETS[sujet]} — ${prenom} ${nom}`,
      html: templateEmail(`
        <p><strong>Nouveau message reçu depuis le formulaire de contact du site des dons.</strong></p>
        <p><strong>De :</strong> ${esc(prenom)} ${esc(nom)} — &lt;${esc(email)}&gt;</p>
        <p><strong>Sujet :</strong> ${SUJETS[sujet]}</p>
        <p><strong>Message :</strong></p>
        <p style="white-space:pre-line;background:#F5F9FD;border-left:4px solid #4278E1;padding:12px 14px;">${esc(message)}</p>
      `),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/contact]", error);
    return NextResponse.json(
      { ok: false, erreur: "Une erreur est survenue. Réessayez plus tard." },
      { status: 500 }
    );
  }
}
