import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { envoyerMail, getExpediteur, templateEmail } from "@/lib/mail";
import { requireAdmin } from "@/lib/auth";

async function adminOrUnauthorized() {
  try { await requireAdmin(); return true; } catch { return false; }
}

export async function GET() {
  if (!(await adminOrUnauthorized())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  return NextResponse.json(await getExpediteur());
}

export async function PATCH(request) {
  if (!(await adminOrUnauthorized())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const body = await request.json();
  const email = String(body.email || "").trim();
  const nom = String(body.nom || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !nom) {
    return NextResponse.json({ error: "Nom et adresse e-mail valides requis." }, { status: 400 });
  }
  await prisma.$transaction([
    prisma.parametre.upsert({ where: { cle: "MAIL_FROM_EMAIL" }, update: { valeur: email }, create: { cle: "MAIL_FROM_EMAIL", valeur: email } }),
    prisma.parametre.upsert({ where: { cle: "MAIL_FROM_NAME" }, update: { valeur: nom }, create: { cle: "MAIL_FROM_NAME", valeur: nom } }),
  ]);
  return NextResponse.json({ email, nom });
}

export async function POST() {
  if (!(await adminOrUnauthorized())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  await envoyerMail({
    to: "infos@ongglobalactionsolidarite.com",
    sujet: "E-mail de test ONG-GAS",
    html: templateEmail("<p>Ceci est un e-mail de test envoyé depuis les paramètres de la plateforme ONG-GAS.</p>"),
  });
  return NextResponse.json({ success: true });
}
