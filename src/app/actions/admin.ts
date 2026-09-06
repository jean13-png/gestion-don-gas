"use server";

import prisma from "@/lib/prisma";

export async function validateDon(donId: string, observations?: string) {
  try {
    await prisma.don.update({
      where: { id: donId },
      data: {
        statut: "VALIDE",
        observations: observations || null,
        validatedAt: new Date(),
      },
    });
    return { success: true };
  } catch (error) {
    console.error("[validateDon] Erreur:", error);
    return { success: false, error: "Erreur lors de la validation." };
  }
}
