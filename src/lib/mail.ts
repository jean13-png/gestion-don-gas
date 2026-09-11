import { Resend } from "resend";
import prisma from "@/lib/prisma";

const DEFAULT_FROM = "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.MAIL_ADMIN_EMAIL || "infos@ongglobalactionsolidarite.com";
const EMAIL_HEADER = "https://gestion-don-gas.vercel.app/images/entete-mail.png";

let resend: Resend | null = null;

function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function getExpediteur() {
  const [email, nom] = await Promise.all([
    prisma.parametre.findUnique({ where: { cle: "MAIL_FROM_EMAIL" } }),
    prisma.parametre.findUnique({ where: { cle: "MAIL_FROM_NAME" } }),
  ]);
  return { email: email?.valeur || DEFAULT_FROM, nom: nom?.valeur || "ONG-GAS" };
}

export function templateEmail(contenu: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F9FD;"><tr><td align="center" style="padding:24px 12px;"><table role="presentation" width="600" style="max-width:600px;width:100%;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;background:#fff;"><tr><td><img src="${EMAIL_HEADER}" width="600" alt="ONG Global Actions Solidarité — Projet Informatique Pour Tous" style="display:block;width:100%;max-width:600px;height:auto;" /></td></tr><tr><td style="padding:24px 32px;color:#22323B;font-size:15px;line-height:1.6;">${contenu}</td></tr><tr><td style="padding:18px 32px;background:#0F3A5F;color:#B9C9D6;font-size:12px;line-height:1.7;">ONG Global Actions Solidarité · Abomey-Calavi, Bénin<br/>+229 01 46 46 66 56 · infos@ongglobalactionsolidarite.com<br/>N° 2025/372/MISP/DC/SGM/DAIC/SACC/SA</td></tr></table></td></tr></table>`;
}

export async function envoyerMail(opts: {
  to: string;
  sujet: string;
  html: string;
  pieceJointe?: { nom: string; contenu: Buffer };
  donId?: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY manquante");
    const exp = await getExpediteur();
    const { error } = await getResend().emails.send({
      from: `${exp.nom} <${exp.email}>`,
      to: opts.to,
      subject: opts.sujet,
      html: opts.html,
      attachments: opts.pieceJointe
        ? [{ filename: opts.pieceJointe.nom, content: opts.pieceJointe.contenu }]
        : undefined,
    });
    if (error) throw new Error(JSON.stringify(error));
    await prisma.historique.create({
      data: { type: "MAIL", donId: opts.donId, destinataire: opts.to, sujet: opts.sujet, contenuHtml: opts.html, statut: "ENVOYE" },
    });
    return { sent: true };
  } catch (error) {
    console.error("[mail] Envoi échoué:", error);
    await prisma.historique.create({
      data: { type: "MAIL", donId: opts.donId, destinataire: opts.to, sujet: opts.sujet, contenuHtml: opts.html, statut: "ECHEC", erreur: String(error).slice(0, 500) },
    }).catch((historyError) => console.error("[mail] Journalisation échouée:", historyError));
    return { sent: false, error: String(error) };
  }
}

export async function journaliserAction(donId: string | undefined, message: string) {
  try {
    await prisma.historique.create({ data: { type: "ACTION", donId, statut: "OK", message } });
  } catch (error) {
    console.error("[mail] Journalisation action échouée:", error);
  }
}

export { ADMIN_EMAIL };

export const mailAdmin = ADMIN_EMAIL;
