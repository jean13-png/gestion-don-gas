"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { adminDonDetailsSchema } from "@/lib/validation";
import { OWNER_EMAIL, envoyerMail, journaliserAction, templateEmail } from "@/lib/mail";
import { donationSchema } from "@/lib/validation";
import { generateReference } from "@/lib/reference";
import { genererFicheReceptionDon } from "@/lib/pdf";
import type { NatureDon } from "@/lib/pdf";
import { genererRecuDonPdf } from "@/lib/recap-don-pdf";
import { buildDonLocalisation } from "@/lib/location";
import * as XLSX from "xlsx";

const NATURE_MAP: Record<string, NatureDon> = {
  MATERIEL_INFORMATIQUE: "MATERIEL",
  EQUIPEMENT_PEDAGOGIQUE: "MATERIEL",
  DON_FINANCIER: "ESPECES",
  DES_HABITS: "MATERIEL",
  DES_VIVRES: "MATERIEL",
  MACHINES_A_COUDRE: "MATERIEL",
  VEHICULES: "MATERIEL",
  BUS_TRANSPORT: "MATERIEL",
  ORDINATEURS: "MATERIEL",
  MOBILIER: "MATERIEL",
  JOUETS: "MATERIEL",
  LIVRES: "MATERIEL",
  FAUTEUILS_MEDICAUX: "MATERIEL",
  BEQUILLES: "MATERIEL",
  APPARTEMENT: "MATERIEL",
  MAISON: "MATERIEL",
  MATELAS: "MATERIEL",
  IMPRIMANTES: "MATERIEL",
  AUTRE: "AUTRES",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character]);
}

export async function creerDonAdmin(prevState: unknown, formData: FormData) {
  const admin = await requireAdmin();
  const values = {
    nom: formData.get("nom")?.toString().trim() || "",
    prenom: formData.get("prenom")?.toString().trim() || "",
    organisme: formData.get("organisme")?.toString().trim() || "",
    email: formData.get("email")?.toString().trim().toLowerCase() || "",
    telephone: formData.get("telephone")?.toString().trim() || "",
    nature: formData.get("nature")?.toString().trim() || "",
    natureAutre: formData.get("natureAutre")?.toString().trim() || "",
    description: formData.get("description")?.toString().trim() || "",
    pays: formData.get("pays")?.toString().trim() || "",
    ville: formData.get("ville")?.toString().trim() || "",
    quartierVillage: formData.get("quartierVillage")?.toString().trim() || "",
    localisationInput: formData.get("localisation")?.toString().trim() || "",
    objectif: formData.get("objectif")?.toString().trim() || "",
    objectifAutre: formData.get("objectifAutre")?.toString().trim() || "",
  };
  const localisation = buildDonLocalisation({
    localisation: values.localisationInput,
    pays: values.pays,
    ville: values.ville,
    quartierVillage: values.quartierVillage,
  });
  const parsed = donationSchema.safeParse({
    ...values,
    localisation,
  });

  if (!parsed.success) return { error: "Veuillez corriger les informations saisies." };
  if (values.nature === "AUTRE" && !values.natureAutre) {
    return { error: "Veuillez préciser la nature du don." };
  }
  if (values.objectif === "AUTRES" && !values.objectifAutre) {
    return { error: "Veuillez préciser l'objectif du don." };
  }

  const reference = generateReference();
  const don = await prisma.$transaction(async (transaction) => {
    const donateur = await transaction.donateur.create({
      data: {
        nom: values.nom,
        prenom: values.prenom,
        organisme: values.organisme || null,
        email: values.email,
        telephone: values.telephone,
      },
    });

    return transaction.don.create({
      data: {
        reference,
        nature: parsed.data.nature,
        natureAutre: parsed.data.nature === "AUTRE" ? parsed.data.natureAutre : null,
        description: values.description,
        localisation,
        pays: values.pays || null,
        ville: values.ville || null,
        quartierVillage: values.quartierVillage || null,
        objectif: parsed.data.objectif,
        objectifAutre: parsed.data.objectif === "AUTRES" ? parsed.data.objectifAutre : null,
        donateurId: donateur.id,
      },
    });
  });

  const recapPdf = await genererRecuDonPdf({
    reference,
    statut: "SOUMIS",
    donateur: { prenom: values.prenom, nom: values.nom },
    nature: parsed.data.nature === "AUTRE" ? values.natureAutre : values.nature,
    description: values.description,
    localisation,
    pays: values.pays,
    ville: values.ville,
    quartierVillage: values.quartierVillage,
    createdAt: new Date(),
  });

  const donorName = escapeHtml(`${values.prenom} ${values.nom}`);
  const donorMail = await envoyerMail({
    to: values.email,
    sujet: `Accusé de réception de votre don — Réf. ${reference}`,
    html: templateEmail(`<p>Bonjour ${donorName},</p><p>Votre proposition de don a été enregistrée par notre équipe.</p><p>Référence : <strong>${reference}</strong></p><p>Conservez cette référence pour suivre votre dossier.</p><p><a href="https://gestion-don-gas.vercel.app/suivi?reference=${encodeURIComponent(reference)}">Suivre mon dossier</a></p>`),
    pieceJointe: { nom: `recu-don-${reference}.pdf`, contenu: recapPdf },
    donId: don.id,
  });

  if (values.email !== OWNER_EMAIL) {
    await envoyerMail({
      to: OWNER_EMAIL,
      sujet: `Don créé par l'administration — ${reference}`,
      html: templateEmail(`<p>Le don <strong>${escapeHtml(reference)}</strong> a été créé par ${escapeHtml(admin.nom)}.</p><p>Donateur : ${donorName}<br>E-mail : ${escapeHtml(values.email)}<br>Nature : ${escapeHtml(values.nature)}</p><p><a href="https://gestion-don-gas.vercel.app/admin/dons/${don.id}">Ouvrir le dossier</a></p>`),
      donId: don.id,
    });
  }

  await journaliserAction(don.id, `Don ${reference} créé par ${admin.nom}; accusé donateur ${donorMail.sent ? "envoyé" : "en échec"}`);
  revalidatePath("/admin/dons");
  revalidatePath("/admin/dashboard");
  return { success: true, donId: don.id, reference };
}

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
    where: { id: donId, statut: "INSPECTE" },
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

const STATUS_TRANSITIONS = {
  SOUMIS: ["EN_VERIFICATION", "REJETE"],
  EN_VERIFICATION: ["INSPECTE", "REJETE"],
  INSPECTE: ["VALIDE", "REJETE"],
  PROGRAMMEE: ["VALIDE", "REJETE", "EN_VERIFICATION"],
  VALIDE: [],
  FICHE_GENEREE: [],
  REJETE: ["EN_VERIFICATION"],
};

export async function updateDonStatus(donId: string, nextStatus: string, observations?: string) {
  const admin = await requireAdmin();

  const normalizedNextStatus = nextStatus?.trim();
  if (!normalizedNextStatus || !Object.hasOwn(STATUS_TRANSITIONS, normalizedNextStatus)) {
    throw new Error("DON_STATUS_INVALID");
  }

  const cleanObservations = observations?.trim() || "";
  if (normalizedNextStatus === "REJETE" && (cleanObservations.length < 10 || cleanObservations.length > 1000)) {
    throw new Error("DON_REJECTION_REASON_INVALID");
  }

  const don = await prisma.don.findUnique({ where: { id: donId }, select: { statut: true } });
  if (!don) {
    throw new Error("DON_NOT_FOUND");
  }

  if (don.statut === normalizedNextStatus) {
    return don;
  }

  if (!STATUS_TRANSITIONS[don.statut]?.includes(normalizedNextStatus)) {
    throw new Error("DON_STATUS_TRANSITION_INVALID");
  }

  const updated = await prisma.don.update({
    where: { id: donId, statut: don.statut },
    data: {
      statut: normalizedNextStatus,
      observations: cleanObservations || undefined,
      validatedAt: normalizedNextStatus === "VALIDE" ? new Date() : undefined,
    },
  });

  const detail = await prisma.don.findUnique({ where: { id: donId }, include: { donateur: true } });
  if (detail) {
    const label = nextStatus.replaceAll("_", " ");
    await envoyerMail({
      to: OWNER_EMAIL,
      sujet: `[${label}] Don ${detail.reference}`,
      html: templateEmail(`<p>Le don <strong>${detail.reference}</strong> est passé au statut « ${label} » le ${new Date().toLocaleString("fr-FR")} par ${admin.nom}.</p>`),
      donId,
    });
    await journaliserAction(donId, `Statut changé de ${don.statut} à ${nextStatus} par ${admin.nom}`);
  }

  revalidatePath("/admin/dons");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dons/${donId}`);
  return updated;
}

export async function markDonFicheGenerated(donId: string, ficheUrl: string) {
  const admin = await requireAdmin();
  if (!ficheUrl) throw new Error("DON_FICHE_URL_INVALID");

  const currentDon = await prisma.don.findUnique({ where: { id: donId }, select: { statut: true } });
  if (!currentDon || !["VALIDE", "PROGRAMMEE"].includes(currentDon.statut)) {
    throw new Error("DON_MUST_BE_VALIDATED");
  }

  const don = await prisma.don.findUnique({ where: { id: donId } });
  const updated = await prisma.don.update({
    where: { id: donId, statut: currentDon.statut },
    data: { ficheUrl, statut: "FICHE_GENEREE" },
  });
  if (don) {
    await envoyerMail({
      to: OWNER_EMAIL,
      sujet: `[FICHE_GENEREE] Don ${don.reference}`,
      html: templateEmail(`<p>Le don <strong>${don.reference}</strong> est passé au statut « FICHE GENEREE » le ${new Date().toLocaleString("fr-FR")} par ${admin.nom}.</p>`),
      donId,
    });
  }
  await journaliserAction(donId, `Fiche générée par ${admin.nom}`);

  revalidatePath("/admin/dons");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dons/${donId}`);
  return updated;
}

export async function repondreMessageAdmin(formData: FormData) {
  const admin = await requireAdmin();

  const donId = formData.get("donId")?.toString().trim();
  const contenu = formData.get("contenu")?.toString().trim();

  if (!donId || !contenu) {
    throw new Error("MESSAGE_INVALID");
  }

  const don = await prisma.don.findUnique({
    where: { id: donId },
    include: { donateur: true },
  });

  if (!don) {
    throw new Error("DON_NOT_FOUND");
  }

  await prisma.donMessage.create({
    data: {
      donId,
      expediteur: "ADMIN",
      contenu,
    },
  });

  await envoyerMail({
    to: don.donateur.email,
    sujet: `Réponse de l'équipe — Don ${don.reference}`,
    html: templateEmail(`<p>Bonjour ${don.donateur.prenom} ${don.donateur.nom},</p><p>Une réponse a été ajoutée à votre dossier de don.</p><p><strong>Message :</strong></p><p>${contenu.replace(/\n/g, "<br/>")}</p><p>Référence de suivi : <strong>${don.reference}</strong></p><p><a href="https://gestion-don-gas.vercel.app/suivi?reference=${encodeURIComponent(don.reference)}">Suivre mon dossier</a></p>`),
    donId,
  });

  await journaliserAction(donId, `Réponse admin envoyée à ${don.donateur.email}`);

  revalidatePath("/admin/dons");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/dons/${donId}`);
  revalidatePath("/suivi");

  return { success: "Réponse envoyée au donateur." };
}

export async function mettreAJourDonDetails(donId: string, formData: FormData) {
  await requireAdmin();

  const parsed = adminDonDetailsSchema.safeParse({
    objectif: formData.get("objectif")?.toString().trim() || "AUTRES",
    objectifAutre: formData.get("objectifAutre")?.toString().trim() || "",
    responsable: formData.get("responsable")?.toString().trim() || "HEDJE ZINSOU RAOUL",
    faitA: formData.get("faitA")?.toString().trim() || "",
    dateReception: formData.get("dateReception")?.toString().trim() || new Date().toISOString(),
    aQuoiServi: formData.get("aQuoiServi")?.toString().trim() || "",
  });

  if (!parsed.success) {
    throw new Error("DON_DETAILS_INVALID");
  }

  const { objectif, objectifAutre, responsable, faitA, dateReception, aQuoiServi } = parsed.data;

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
  data.aQuoiServi = aQuoiServi || null;

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
      aQuoiServi: don.aQuoiServi ?? "",
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

  const rows = [[
    "N°",
    "Référence",
    "Nom",
    "Prénom",
    "Date de soumission",
    "Date de validation",
    "Nature",
    "Statut",
    "Localisation",
    "Objectif",
    "Ce à quoi le don a servi",
    "Email",
  ]];

  for (const [index, don] of result.dons.entries()) {
    const donData = await prisma.don.findUnique({
      where: { id: don.id },
      select: {
        ville: true,
        pays: true,
        localisation: true,
        objectif: true,
        objectifAutre: true,
        aQuoiServi: true,
        validatedAt: true,
      },
    });

    rows.push([
      index + 1,
      don.reference,
      don.donateur.nom,
      don.donateur.prenom,
      new Date(don.createdAt).toLocaleDateString("fr-FR"),
      donData?.validatedAt ? new Date(donData.validatedAt).toLocaleDateString("fr-FR") : "",
      don.nature,
      don.statut,
      donData?.localisation || [donData?.ville, donData?.pays].filter(Boolean).join(" - ") || "",
      donData?.objectif === "AUTRES" && donData.objectifAutre ? donData.objectifAutre : donData?.objectif || "",
      donData?.aQuoiServi || "",
      don.donateur.email,
    ]);
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dons");

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer",
  });

  revalidatePath("/admin/dons");
  revalidatePath("/admin/dashboard");

  return {
    content: buffer,
    filename: `dons-ong-gas-${new Date().toISOString().slice(0, 10)}.xlsx`,
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
