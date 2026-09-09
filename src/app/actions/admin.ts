"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { adminDonDetailsSchema } from "@/lib/validation";

export type AdminDonsFilter = {
  search?: string;
  statut?: string;
  nature?: string;
  periode?: "7j" | "30j" | "90j" | "12m" | "all";
  page?: number;
  limit?: number;
};

export type AdminDonsResult = {
  dons: Array<{
    id: string;
    reference: string;
    nature: string;
    statut: string;
    createdAt: string;
    donateur: {
      prenom: string;
      nom: string;
      email: string;
    };
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function validateDon(donId: string, observations?: string) {
  await requireAdmin();

  const updated = await prisma.don.update({
    where: { id: donId },
    data: {
      statut: "VALIDE",
      validatedAt: new Date(),
      observations: observations || undefined,
    },
  });

  revalidatePath("/admin/dons");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dons/${donId}`);

  return updated;
}

export async function mettreAJourDonDetails(donId: string, formData: FormData) {
  await requireAdmin();

  const parsed = adminDonDetailsSchema.safeParse({
    objectif: formData.get("objectif")?.toString().trim() || "AUTRES",
    objectifAutre: formData.get("objectifAutre")?.toString().trim() || "",
    responsable: formData.get("responsable")?.toString().trim() || "HEDJE ZINSOU RAOUL",
    faitA: formData.get("faitA")?.toString().trim() || "",
    dateReception: formData.get("dateReception")?.toString().trim() || new Date().toISOString(),
  });

  if (!parsed.success) {
    throw new Error("DON_DETAILS_INVALID");
  }

  const { objectif, objectifAutre, responsable, faitA, dateReception } = parsed.data;

  const data: Record<string, unknown> = {
    objectif,
    responsable,
  };

  if (objectif === "AUTRES") {
    data.objectifAutre = objectifAutre;
  } else {
    data.objectifAutre = null;
  }

  data.faitA = faitA || null;
  data.dateReception = dateReception;

  const updated = await prisma.don.update({
    where: { id: donId },
    data,
  });

  revalidatePath("/admin/dons");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dons/${donId}`);

  return updated;
}

export async function getAdminDons(filter: AdminDonsFilter = {}): Promise<AdminDonsResult> {
  await requireAdmin();

  const page = filter.page && filter.page > 0 ? filter.page : 1;
  const limit = filter.limit && filter.limit > 0 ? filter.limit : 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim();
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { donateur: { nom: { contains: q, mode: "insensitive" } } },
      { donateur: { prenom: { contains: q, mode: "insensitive" } } },
      { donateur: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  if (filter.statut && filter.statut !== "ALL") {
    where.statut = filter.statut;
  }

  if (filter.nature && filter.nature !== "ALL") {
    where.nature = filter.nature;
  }

  if (filter.periode && filter.periode !== "all") {
    const now = new Date();
    let start: Date;
    switch (filter.periode) {
      case "7j":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30j":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90j":
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "12m":
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        start = new Date(0);
    }
    where.createdAt = { gte: start };
  }

  const [dons, total] = await Promise.all([
    prisma.don.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { donateur: true },
    }),
    prisma.don.count({ where }),
  ]);

  return {
    dons: dons.map((don) => ({
      id: don.id,
      reference: don.reference,
      nature: don.nature,
      statut: don.statut,
      createdAt: don.createdAt.toISOString(),
      donateur: {
        prenom: don.donateur.prenom,
        nom: don.donateur.nom,
        email: don.donateur.email,
      },
    })),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function exportAdminDonsCsv(filter: Omit<AdminDonsFilter, "page" | "limit"> = {}) {
  await requireAdmin();

  const result = await getAdminDons({ ...filter, page: 1, limit: 1000 });

  const rows = [["Reference", "Nature", "Statut", "Date", "Donateur", "Email"]];
  for (const don of result.dons) {
    rows.push([
      don.reference,
      don.nature,
      don.statut,
      new Date(don.createdAt).toLocaleDateString("fr-FR"),
      `${don.donateur.prenom} ${don.donateur.nom}`,
      don.donateur.email,
    ]);
  }

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
  const buffer = Buffer.from(`\uFEFF${csv}`, "utf-8");

  revalidatePath("/admin/dons");
  revalidatePath("/admin/dashboard");

  return {
    content: buffer,
    filename: `dons-ong-gas-${new Date().toISOString().slice(0, 10)}.csv`,
    contentType: "text/csv; charset=utf-8",
  };
}
