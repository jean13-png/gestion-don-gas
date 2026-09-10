"use server";

import { del, put } from "@vercel/blob";
import sharp from "sharp";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function uploadPhoto(formData: FormData) {
  await requireAdmin();

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

  if (don.photos.length >= 10) {
    return { success: false, error: "Limite de 10 photos atteinte." };
  }

  try {
    const normalized = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const blob = await put(
      `dons/${don.reference}/photo-${Date.now()}.jpg`,
      normalized,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: "image/jpeg",
      },
    );

    const photo = await prisma.photo.create({
      data: {
        url: blob.url,
        donId: don.id,
      },
    });

    return { success: true, photo };
  } catch (error) {
    console.error("[uploadPhoto] Échec du traitement:", error);
    return {
      success: false,
      error: "Nous n'avons pas pu ajouter cette photo. Vérifiez le fichier puis réessayez.",
    };
  }
}

export async function deletePhoto(formData: FormData) {
  await requireAdmin();

  const photoId = formData.get("photoId") as string | null;
  const donId = formData.get("donId") as string | null;

  if (!photoId || !donId) {
    return { success: false, error: "Photo ou don manquant." };
  }

  const photo = await prisma.photo.findFirst({
    where: { id: photoId, donId },
  });

  if (!photo) {
    return { success: false, error: "Photo introuvable." };
  }

  await del(photo.url);
  await prisma.photo.delete({ where: { id: photo.id } });

  return { success: true };
}
