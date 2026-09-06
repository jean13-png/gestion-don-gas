"use server";

import prisma from "@/lib/prisma";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "photos");

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function uploadPhoto(formData: FormData) {
  const file = formData.get("photo") as File | null;
  const donId = formData.get("donId") as string | null;

  if (!file || !donId) {
    return { success: false, error: "Fichier ou identifiant manquant." };
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: "Format non supporté. Utilisez JPG, PNG ou WEBP." };
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { success: false, error: "Fichier trop volumineux (max 5 MB)." };
  }

  const don = await prisma.don.findUnique({
    where: { id: donId },
    include: { photos: true },
  });

  if (!don) {
    return { success: false, error: "Don introuvable." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `photo-${don.reference}-${Date.now()}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  writeFileSync(filepath, bytes);

  const photo = await prisma.photo.create({
    data: {
      url: `/uploads/photos/${filename}`,
      donId: don.id,
    },
  });

  return { success: true, photo };
}
