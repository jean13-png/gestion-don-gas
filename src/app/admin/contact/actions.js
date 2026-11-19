"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function marquerLu(id) {
  await requireAdmin();
  await prisma.contactMessage.update({
    where: { id },
    data: { lu: true },
  });
}

export async function marquerNonLu(id) {
  await requireAdmin();
  await prisma.contactMessage.update({
    where: { id },
    data: { lu: false },
  });
}

export async function supprimerMessage(id) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
}
