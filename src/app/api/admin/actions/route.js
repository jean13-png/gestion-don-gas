import { del, put } from "@vercel/blob";
import sharp from "sharp";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const MAX_BYTES = 2 * 1024 * 1024;
const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_VISIBLE_ACTIONS = 6;

async function ensureAdmin() {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

async function countVisibleActions() {
  return prisma.actionAccueil.count({ where: { visible: true } });
}

export async function POST(request) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const formData = await request.formData();
  const titre = formData.get("titre")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || "";
  const file = formData.get("image");
  const visible = formData.get("visible") === "true";

  if (!titre || !(file instanceof File) || !VALID_TYPES.includes(file.type) || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Titre et image JPG/PNG/WEBP de 2 Mo maximum requis." }, { status: 400 });
  }

  const visibleCount = await countVisibleActions();
  if (visible && visibleCount >= MAX_VISIBLE_ACTIONS) {
    return NextResponse.json({ error: `Le nombre maximum d'actions visibles est de ${MAX_VISIBLE_ACTIONS}.` }, { status: 400 });
  }

  try {
    const image = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 1200, height: 900, fit: "cover", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const blob = await put(`actions-accueil/${Date.now()}.webp`, image, {
      access: "public",
      addRandomSuffix: true,
      contentType: "image/webp",
    });

    const last = await prisma.actionAccueil.findFirst({ orderBy: { ordre: "desc" }, select: { ordre: true } });
    const action = await prisma.actionAccueil.create({
      data: {
        titre,
        description: description || null,
        imageUrl: blob.url,
        visible,
        ordre: (last?.ordre ?? -1) + 1,
      },
    });

    return NextResponse.json(action, { status: 201 });
  } catch (error) {
    console.error("[actions] Création échouée:", error);
    return NextResponse.json({ error: "Nous n'avons pas pu enregistrer cette action." }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await request.json();
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Action introuvable." }, { status: 400 });

  const data = {};
  if (typeof body.visible === "boolean") data.visible = body.visible;
  if (Number.isInteger(body.ordre)) data.ordre = body.ordre;

  const current = await prisma.actionAccueil.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Action introuvable." }, { status: 404 });

  if (body.visible === true && current.visible !== true) {
    const visibleCount = await countVisibleActions();
    if (visibleCount >= MAX_VISIBLE_ACTIONS) {
      return NextResponse.json({ error: `Le nombre maximum d'actions visibles est de ${MAX_VISIBLE_ACTIONS}.` }, { status: 400 });
    }
  }

  if (!Object.keys(data).length) return NextResponse.json({ error: "Modification invalide." }, { status: 400 });

  const action = await prisma.actionAccueil.update({ where: { id }, data });
  return NextResponse.json(action);
}

export async function DELETE(request) {
  if (!(await ensureAdmin())) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await request.json();
  if (typeof id !== "string" || !id) return NextResponse.json({ error: "Action introuvable." }, { status: 400 });

  const action = await prisma.actionAccueil.findUnique({ where: { id } });
  if (!action) return NextResponse.json({ error: "Action introuvable." }, { status: 404 });

  try {
    await del(action.imageUrl);
  } catch (error) {
    console.error("[actions] Suppression Blob échouée:", error);
  }

  await prisma.actionAccueil.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
