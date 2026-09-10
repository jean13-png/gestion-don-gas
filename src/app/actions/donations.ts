"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateReference } from "@/lib/reference";
import { sendEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { donationSchema } from "@/lib/validation";

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
    await prisma.$transaction(async (transaction) => {
      const donateur = await transaction.donateur.create({
        data: { nom, prenom, organisme: organisme || null, email, telephone },
      });

      await transaction.don.create({
        data: {
          reference,
          nature,
          natureAutre: nature === "AUTRE" ? natureAutre : null,
          description,
          localisation,
          objectif,
          objectifAutre: objectif === "AUTRES" ? objectifAutre : null,
          donateurId: donateur.id,
        },
      });
    });

    let emailFailed = false;
    try {
      await sendEmail({
        to: email,
        subject: `Votre don ONG-GAS — Référence ${reference}`,
        html: `
          <p>Bonjour ${prenom},</p>
          <p>Votre don a été enregistré avec succès.</p>
          <p><strong>Référence :</strong> ${reference}</p>
          <p>Conservez cette référence pour suivre votre dossier.</p>
          <p>Cordialement,<br/>ONG Global Actions Solidarité</p>
        `,
      });

    } catch (mailError) {
      emailFailed = true;
      console.error("[soumettreDon] Email de confirmation échoué:", mailError);
    }
    redirect(`/don/merci?reference=${encodeURIComponent(reference)}${emailFailed ? "&email=failed" : ""}`);

  } catch (error) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error 
    }
    console.error("[soumettreDon] Erreur:", error);
    return { error: "Nous n'avons pas pu enregistrer votre demande. Veuillez réessayer." };
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