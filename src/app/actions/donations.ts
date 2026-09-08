"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { generateReference } from "@/lib/reference";
import { sendEmail } from "@/lib/mail";
import { revalidatePath } from "next/cache";

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 heure
const RATE_LIMIT_MAX = 5; // 5 soumissions max
const submissions = new Map();

async function getClientIp() { 
  const headerList = await headers(); 
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headerList.get("x-real-ip") || "unknown";
}

async function checkRateLimit() {
  const ip = await getClientIp();
  const now = Date.now();
  const record = submissions.get(ip);

  if (!record || now - record.countReset > RATE_LIMIT_WINDOW) {
    submissions.set(ip, { count: 1, countReset: now });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function soumettreDon(prevState, formData) {
  // 1. Rate Limit
  const allowed = await checkRateLimit();
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

  // 3. Validation : Champs obligatoires
  if (!nom ||!prenom ||!email ||!telephone ||!nature ||!description ||!localisation) {
    return { error: "Veuillez remplir tous les champs obligatoires" };
  }

  // 4. Validation : Email
  if (!email.includes("@") ||!email.includes(".")) {
    return { error: "L'adresse email est invalide" };
  }

  // 5. Validation : Téléphone
  if (telephone.length < 8) {
    return { error: "Le numéro de téléphone est invalide" };
  }

  // 6. Validation : Description
  if (description.length < 10) {
    return { error: "La description doit faire au moins 10 caractères" };
  }

  // 7. Validation : Si AUTRE
  if (nature === "AUTRE" &&!natureAutre) {
    return { error: "Veuillez préciser la nature du don" };
  }

  // 8. Validation : Nature valide
  const naturesValides = ["MATERIEL_INFORMATIQUE", "EQUIPEMENT_PEDAGOGIQUE", "DON_FINANCIER", "AUTRE"];
  if (!naturesValides.includes(nature)) {
    return { error: "Nature du don invalide" };
  }

  try {
    // 9. Enregistrement en DB
    const donateur = await prisma.donateur.create({
      data: { nom, prenom, organisme: organisme || null, email, telephone },
    });

    const reference = generateReference();

    await prisma.don.create({
      data: {
        reference,
        nature,
        natureAutre: nature === "AUTRE"? natureAutre : null,
        description,
        localisation,
        donateurId: donateur.id,
      },
    });

    //On tente l'envoie de mail
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
      console.log("Une erreur est survenue lors de l'envoie du mail");
      
    }
    // 11. Redirection
    redirect(`/don/merci?reference=${encodeURIComponent(reference)}`);

  } catch (error) {
    if (error.digest?.includes('NEXT_REDIRECT')) {
      throw error 
    }
    console.error("[soumettreDon] Erreur:", error);
    return { error: "Erreur serveur lors de la soumission. Veuillez réessayer." };
  }
}
// Fonction pour supprimer un don
export async function supprimerDon(prevState, formData) {
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