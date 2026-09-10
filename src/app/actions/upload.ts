"use server";

import { put } from "@vercel/blob";
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

  if (don.photos.length >= 4) {
    return { success: false, error: "Limite de 4 photos atteinte." };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const blob = await put(
    `dons/${don.reference}/photo-${Date.now()}.${ext}`,
    file,
    {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    },
  );

  const photo = await prisma.photo.create({
    data: {
      url: blob.url,
      donId: don.id,
    },
  });

  return { success: true, photo };
}
