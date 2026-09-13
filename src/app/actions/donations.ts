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
import { genererFicheReceptionDon, type NatureDon, type ObjectifDon } from "@/lib/pdf";
import { id } from "zod/locales";
import { success } from "zod";
import { error } from "node:console";

const NATURE_MAP: Record<string, NatureDon> = {
  MATERIEL_INFORMATIQUE: "MATERIEL",
  EQUIPEMENT_PEDAGOGIQUE: "MATERIEL",
  DON_FINANCIER: "ESPECES",
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
  const localisation = formData.get("localisation")?.toString().trim() || "";
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
          objectif: objectif as ObjectifDon,
          objectifAutre: objectif === "AUTRES" ? objectifAutre : null,
          donateurId: donateur.id,
        },
      });
    });

    let pieceJointe;
    try {
      const contenu = await genererFicheReceptionDon({
        donateur: {
          nomRaisonSociale: [prenom, nom].filter(Boolean).join(" ") || undefined,
          representant: organisme || undefined,
          adresse: localisation || undefined,
          telephone,
          email,
        },
        nature: NATURE_MAP[nature] || "AUTRES",
        natureAutresDetail: nature === "AUTRE" ? natureAutre : undefined,
        description,
        objectif,
        objectifAutresDetail: objectif === "AUTRES" ? objectifAutre : undefined,
      });
      pieceJointe = { nom: `fiche-${reference}.pdf`, contenu };
    } catch (error) {
      console.error("[soumettreDon] Génération du PDF jointe échouée:", error);
    }

    const recap = `<p>Bonjour ${prenom} ${nom},</p><p>Nous avons bien reçu votre proposition de don. Voici le récapitulatif :</p><ul><li>Référence : ${reference}</li><li>Nature : ${nature}</li><li>Objectif : ${objectif}</li><li>Description : ${description}</li></ul><p>Conservez précieusement votre référence : elle vous permet de suivre l'avancement de votre dossier à tout moment.</p><p><a href="https://gestion-don-gas.vercel.app/suivi">➜ Suivre mon dossier</a></p><p>Notre équipe examine chaque proposition et revient vers vous rapidement.<br/>Merci pour votre solidarité.</p><p>L'équipe ONG-GAS</p>`;
    await envoyerMail({
      to: email,
      sujet: `Accusé de réception de votre don — Réf. ${reference}`,
      html: templateEmail(recap),
      pieceJointe,
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
  const reference = formData.get("reference")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!reference || !message) {
    return { error: "La référence et le message sont obligatoires." };
  }

  const don = await prisma.don.findUnique({
    where: { reference },
    include: { donateur: true },
  });

  if (!don) {
    return { error: "Aucun dossier correspondant n'a été trouvé." };
  }

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
    html: templateEmail(`<p>Le donateur <strong>${don.donateur.prenom} ${don.donateur.nom}</strong> a envoyé un message sur le dossier <strong>${don.reference}</strong>.</p><p><strong>Message :</strong></p><p>${message.replace(/\n/g, "<br/>")}</p><p><a href="https://gestion-don-gas.vercel.app/admin/dons/${don.id}">Ouvrir la fiche du don</a></p>`),
    donId: don.id,
  });

  revalidatePath("/suivi");
  revalidatePath(`/admin/dons/${don.id}`);
  return { success: "Votre message a bien été envoyé à l'équipe." };
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

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return { error: "Date invalide" };
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