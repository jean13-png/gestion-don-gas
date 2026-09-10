import { del, put } from "@vercel/blob";
import sharp from "sharp";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const MAX_BYTES = 1024 * 1024;
const VALID_TYPES = ["image/jpeg", "image/png"];

async function ensureAdmin() {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const formData = await request.formData();
  const nom = formData.get("nom")?.toString().trim();
  const siteWeb = formData.get("siteWeb")?.toString().trim() || null;
  const consentement = formData.get("consentementLogo") === "true";
  const file = formData.get("logo");

  if (!nom || !(file instanceof File) || !VALID_TYPES.includes(file.type) || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Nom et logo JPG/PNG de 1 Mo maximum requis." }, { status: 400 });
  }
  if (!consentement) {
    return NextResponse.json({ error: "L'autorisation d'afficher le logo est obligatoire." }, { status: 400 });
  }
  if (siteWeb) {
    try {
      const url = new URL(siteWeb);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("URL invalide");
    } catch {
      return NextResponse.json({ error: "Le site web doit être une adresse http(s) valide." }, { status: 400 });
    }
  }

  try {
    const image = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 400, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    const blob = await put(`partenaires/${Date.now()}.webp`, image, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/webp",
    });
    const last = await prisma.partenaire.findFirst({ orderBy: { ordre: "desc" }, select: { ordre: true } });
    const partenaire = await prisma.partenaire.create({
      data: {
        nom,
        logoUrl: blob.url,
        siteWeb,
        consentementLogo: true,
        ordre: (last?.ordre ?? -1) + 1,
      },
    });
    return NextResponse.json(partenaire, { status: 201 });
  } catch (error) {
    console.error("[partenaires] Création échouée:", error);
    return NextResponse.json({ error: "Nous n'avons pas pu enregistrer ce partenaire." }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Partenaire introuvable." }, { status: 400 });
  const data = {};
  if (typeof body.visible === "boolean") data.visible = body.visible;
  if (Number.isInteger(body.ordre)) data.ordre = body.ordre;
  if (!Object.keys(data).length) return NextResponse.json({ error: "Modification invalide." }, { status: 400 });
  const partenaire = await prisma.partenaire.update({ where: { id }, data });
  return NextResponse.json(partenaire);
}

export async function DELETE(request) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const { id } = await request.json();
  if (typeof id !== "string" || !id) return NextResponse.json({ error: "Partenaire introuvable." }, { status: 400 });
  const partenaire = await prisma.partenaire.findUnique({ where: { id } });
  if (!partenaire) return NextResponse.json({ error: "Partenaire introuvable." }, { status: 404 });
  try {
    await del(partenaire.logoUrl);
  } catch (error) {
    console.error("[partenaires] Suppression Blob échouée:", error);
  }
  await prisma.partenaire.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
