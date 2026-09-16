"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateReference } from "@/lib/reference";
import { OWNER_EMAIL, envoyerMail, journaliserAction, templateEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { donationSchema } from "@/lib/validation";
import { type NatureDon, type ObjectifDon } from "@/lib/pdf";
import { genererRecuDonPdf } from "@/lib/recap-don-pdf";
import { buildDonLocalisation } from "@/lib/location";

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

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 heure
const RATE_LIMIT_MAX = 5; // 5 soumissions max

async function getClientIp() { 
  const headerList = await headers(); 
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headerList.get("x-real-ip") || "unknown";
}

async function checkDonationRateLimit() {
  const ip = await getClientIp();
  return checkRateLimit(`donation:${ip}`, RATE_LIMIT_WINDOW, RATE_LIMIT_MAX);
}

export async function soumettreDon(prevState, formData) {
  // 1. Rate Limit
  let allowed;
  try {
    allowed = await checkDonationRateLimit();
  } catch (error) {
    console.error("[soumettreDon] Rate limit indisponible:", error);
    return { error: "Le service est momentanément indisponible. Veuillez réessayer." };
  }
  if (!allowed) {
    return { error: "Trop de soumissions. Veuillez réessayer dans quelques minutes." };
  }

  // 2. Récupération des données + trim
  const nom = formData.get("nom")?.toString().trim() || "";
  const prenom = formData.get("prenom")?.toString().trim() || "";
  const organisme = formData.get("organisme")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim() || "";
  const telephone = formData.get("telephone")?.toString().trim() || "";

  const nature = formData.get("nature")?.toString().trim() || "";
  const natureAutre = formData.get("natureAutre")?.toString().trim() || "";
  const description = formData.get("description")?.toString().trim() || "";
  const pays = formData.get("pays")?.toString().trim() || "";
  const ville = formData.get("ville")?.toString().trim() || "";
  const quartierVillage = formData.get("quartierVillage")?.toString().trim() || "";
  const localisationInput = formData.get("localisation")?.toString().trim() || "";
  const localisation = buildDonLocalisation({ localisation: localisationInput, pays, ville, quartierVillage });
  const objectif = formData.get("objectif")?.toString().trim() || "";
  const objectifAutre = formData.get("objectifAutre")?.toString().trim() || "";

  const parsed = donationSchema.safeParse({
    nom,
    prenom,
    organisme,
    email,
    telephone,
    nature,
    natureAutre,
    description,
    localisation,
    pays,
    ville,
    quartierVillage,
    objectif,
    objectifAutre,
  });

  if (!parsed.success) {
    return { error: "Veuillez vérifier les informations saisies." };
  }

  if (nature === "AUTRE" && !natureAutre) {
    return { error: "Veuillez préciser la nature du don" };
  }

  if (objectif === "AUTRES" && !objectifAutre) {
    return { error: "Veuillez préciser l'objectif du don" };
  }

  try {
    const reference = generateReference();
    const don = await prisma.$transaction(async (transaction) => {
      const donateur = await transaction.donateur.create({
        data: { nom, prenom, organisme: organisme || null, email, telephone },
      });

      return transaction.don.create({
        data: {
          reference,
          nature,
          natureAutre: nature === "AUTRE" ? natureAutre : null,
          description,
          localisation,
          pays: pays || null,
          ville: ville || null,
          quartierVillage: quartierVillage || null,
          objectif: objectif as ObjectifDon,
          objectifAutre: objectif === "AUTRES" ? objectifAutre : null,
          donateurId: donateur.id,
        },
      });
    });

    const recapPdf = await genererRecuDonPdf({
      reference,
      statut: "SOUMIS",
      donateur: { prenom, nom },
      nature: nature === "AUTRE" && natureAutre ? natureAutre : nature,
      description,
      localisation,
      pays,
      ville,
      quartierVillage,
      createdAt: new Date(),
    });

    const recap = `<p>Bonjour ${prenom} ${nom},</p><p>Nous avons bien reçu votre proposition de don. Voici le récapitulatif :</p><ul><li>Référence : ${reference}</li><li>Nature : ${nature}</li><li>Objectif : ${objectif}</li><li>Description : ${description}</li></ul><p>Conservez précieusement votre référence : elle vous permet de suivre l'avancement de votre dossier à tout moment.</p><p><a href="https://gestion-don-gas.vercel.app/suivi">➜ Suivre mon dossier</a></p><p>Notre équipe examine chaque proposition et revient vers vous rapidement.<br/>Merci pour votre solidarité.</p><p>L'équipe ONG-GAS</p>`;
    await envoyerMail({
      to: email,
      sujet: `Accusé de réception de votre don — Réf. ${reference}`,
      html: templateEmail(recap),
      pieceJointe: { nom: `recu-don-${reference}.pdf`, contenu: recapPdf },
      donId: don.id,
    });
    await envoyerMail({
      to: OWNER_EMAIL,
      sujet: `Nouveau don soumis — ${reference} (${nature})`,
      html: templateEmail(`<p>Nouveau don soumis : <strong>${reference}</strong></p><p>Donateur : ${prenom} ${nom}<br/>Organisme : ${organisme || "—"}<br/>E-mail : ${email}<br/>Téléphone : ${telephone}<br/>Localisation : ${localisation}</p><p>Nature : ${nature}<br/>Objectif : ${objectif}<br/>Description : ${description}</p><p><a href="https://gestion-don-gas.vercel.app/admin/dons">Ouvrir le back-office</a></p>`),
      donId: don.id,
    });
    await journaliserAction(don.id, `Don ${reference} soumis`);
    redirect(`/don/merci?reference=${encodeURIComponent(reference)}`);

  } catch (error) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error 
    }
    console.error("[soumettreDon] Erreur:", error);
    return { error: "Nous n'avons pas pu enregistrer votre demande. Veuillez réessayer." };
  }
}

export async function posterMessageDonateur(prevState, formData) {
  try {
    const reference = formData.get("reference")?.toString().trim();
    const message = formData.get("message")?.toString().trim();

    if (!reference || !message) {
      return { error: "La référence et le message sont obligatoires." };
    }

    const don = await prisma.don.findUnique({
      where: { reference },
      include: { donateur: true },
    });

    if (!don || !don.donateur) {
      return { error: "Aucun dossier correspondant n'a été trouvé." };
    }

    const donorName = [don.donateur.prenom, don.donateur.nom].filter(Boolean).join(" ") || "Donateur";

    await prisma.donMessage.create({
      data: {
        donId: don.id,
        expediteur: "DONATEUR",
        contenu: message,
      },
    });

    await envoyerMail({
      to: OWNER_EMAIL,
      sujet: `Nouveau message du donateur — ${don.reference}`,
      html: templateEmail(`<p>Le donateur <strong>${donorName}</strong> a envoyé un message sur le dossier <strong>${don.reference}</strong>.</p><p><strong>Message :</strong></p><p>${message.replace(/\n/g, "<br/>")}</p><p><a href="https://gestion-don-gas.vercel.app/admin/dons/${don.id}">Ouvrir la fiche du don</a></p>`),
      donId: don.id,
    });

    revalidatePath("/suivi");
    revalidatePath(`/admin/dons/${don.id}`);
    return { success: "Votre message a bien été envoyé à l'équipe." };
  } catch (error) {
    console.error("[posterMessageDonateur] Erreur:", error);
    return { error: "Nous n'avons pas pu envoyer votre message. Veuillez réessayer." };
  }
}
// Fonction pour supprimer un don
export async function supprimerDon(prevState, formData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Accès interdit" };
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.user.id as string },
  });

  if (!admin) {
    return { error: "Accès interdit" };
  }

  const donId = formData.get("donId")?.toString().trim();

  if (!donId) {
    return { error: "Don introuvable" };
  }

  try {
    await prisma.don.delete({
      where: { id: donId },
    });
  } catch (error) {
    console.error("[supprimerDon] Erreur:", error);
    return { error: "Erreur serveur lors de la suppression. Veuillez réessayer." };
  }

  revalidatePath("/admin/dons");
  redirect("/admin/dons");
}

// Fonction pour programmer un donateur
export async function ProgrammerDonnateur(prevState, formData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Accès interdit" };
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.user.id as string },
  });

  if (!admin) {
    return { error: "Accès interdit" };
  }

  const donId = formData.get("donId")?.toString().trim();

  if (!donId) {
    return { error: "Don introuvable" };
  }

  const date = formData.get("dateProgrammee")?.toString().trim();
  if (!date) {
    return { error: "Veuillez sélectionner une date" };
  }

  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return { error: "Date invalide" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate <= today) {
    return { error: "La date programmée doit être strictement ultérieure à aujourd'hui." };
  }

  try {
    const don = await prisma.don.findUnique({
      where: { id: donId },
      include: { donateur: true },
    });

    if (!don) {
      return { error: "Don introuvable" };
    }

    await prisma.$transaction([
      prisma.don.update({
        where: { id: donId },
        data: {
          statut: "PROGRAMMEE",
          dateProgrammation: parsedDate,
        },
      }),
      prisma.donMessage.create({
        data: {
          donId,
          expediteur: "ADMIN",
          contenu: `Programmation enregistrée pour le ${parsedDate.toLocaleDateString("fr-FR")}.`,
        },
      }),
    ]);

    await envoyerMail({
      to: don.donateur.email,
      sujet: `Programmation de votre rendez-vous de vérification — ${don.reference}`,
      html: templateEmail(`<p>Bonjour ${don.donateur.prenom} ${don.donateur.nom},</p><p>Votre dossier de don a été programmé pour une vérification le <strong>${parsedDate.toLocaleDateString("fr-FR")}</strong>.</p><p>Vous pouvez suivre son évolution via votre référence de suivi : <strong>${don.reference}</strong>.</p><p>Merci pour votre confiance.</p><p>L'équipe ONG-GAS</p>`),
      donId,
    });

    await journaliserAction(donId, `Programmation du don ${don.reference} fixée au ${parsedDate.toLocaleDateString("fr-FR")} par ${admin.nom}`);
    revalidatePath("/admin");
    revalidatePath("/suivi");
    revalidatePath(`/admin/dons/${donId}`);

    return { success: "Donateur programmé avec succès !" };
  } catch (error) {
    console.error("[ProgrammerDonnateur] Erreur:", error);
    return { error: "Une erreur s'est produite lors de la programmation." };
  }
}