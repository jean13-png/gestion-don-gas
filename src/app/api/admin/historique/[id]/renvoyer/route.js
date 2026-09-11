import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { envoyerMail } from "@/lib/mail";
import { requireAdmin } from "@/lib/auth";

export async function POST(_request, { params }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé." }, { status: 401 }); }
  const item = await prisma.historique.findUnique({ where: { id: (await params).id } });
  if (!item || item.type !== "MAIL" || !item.destinataire || !item.sujet || !item.contenuHtml) {
    return NextResponse.json({ error: "E-mail introuvable ou non renvoyable." }, { status: 404 });
  }
  await envoyerMail({ to: item.destinataire, sujet: item.sujet, html: item.contenuHtml, donId: item.donId || undefined });
  return NextResponse.json({ success: true });
}
