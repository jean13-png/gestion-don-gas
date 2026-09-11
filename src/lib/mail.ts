import { Resend } from "resend";
import prisma from "@/lib/prisma";

const DEFAULT_FROM = "onboarding@resend.dev";
const ADMIN_EMAIL = process.env.MAIL_ADMIN_EMAIL || "infos@ongglobalactionsolidarite.com";

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
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F9FD;"><tr><td align="center" style="padding:24px 12px;"><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border:1px solid #DCE5EC;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;background:#fff;"><tr><td style="height:7px;background:#0F3A5F;font-size:0;line-height:0;">&nbsp;</td></tr><tr><td align="center" style="padding:25px 24px 21px;background:#FFFFFF;"><div style="font-size:13px;line-height:18px;letter-spacing:2px;color:#0F3A5F;font-weight:bold;">ONG-GAS</div><div style="margin-top:8px;font-size:24px;line-height:30px;color:#0F3A5F;font-weight:bold;">ONG GLOBAL ACTIONS SOLIDARITÉ</div><div style="margin-top:7px;font-size:16px;line-height:22px;color:#0087A8;">Projet Informatique Pour Tous</div><div style="margin:17px auto 0;width:72px;height:3px;background:#00A0B8;font-size:0;line-height:0;">&nbsp;</div></td></tr><tr><td style="padding:24px 32px;color:#22323B;font-size:15px;line-height:1.6;">${contenu}</td></tr><tr><td style="padding:18px 32px;background:#0F3A5F;color:#B9C9D6;font-size:12px;line-height:1.7;">ONG Global Actions Solidarité · Abomey-Calavi, Bénin<br/>+229 01 46 46 66 56 · infos@ongglobalactionsolidarite.com<br/>N° 2025/372/MISP/DC/SGM/DAIC/SACC/SA</td></tr></table></td></tr></table>`;
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
