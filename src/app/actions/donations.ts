"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { generateReference } from "@/lib/reference";
import { sendEmail } from "@/lib/mail";

const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const submissions = new Map();

function getClientIp() {
  return headers().then((headerList) => {
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0]?.trim() || "unknown";
    }
    return headerList.get("x-real-ip") || "unknown";
  });
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

const DonateurSchema = z.object({
  nom: z.string().min(2, "Nom requis"),
  prenom: z.string().min(2, "Prénom requis"),
  organisme: z.string().optional(),
  email: z.string().email("Email invalide"),
  telephone: z.string().min(8, "Téléphone invalide"),
});

const DonSchema = z.object({
  nature: z.enum([
    "MATERIEL_INFORMATIQUE",
    "EQUIPEMENT_PEDAGOGIQUE",
    "DON_FINANCIER",
    "AUTRE",
  ]),
  natureAutre: z.string().optional(),
  description: z.string().min(10, "Description trop courte"),
  localisation: z.string().min(2, "Localisation requise"),
});

export async function soumettreDon(formData: FormData) {
  const allowed = await checkRateLimit();
  if (!allowed) {
    return {
      success: false,
      error: "Trop de soumissions. Veuillez réessayer dans quelques minutes.",
    };
  }

  const rawDonateur = {
    nom: formData.get("nom"),
    prenom: formData.get("prenom"),
    organisme: formData.get("organisme"),
    email: formData.get("email"),
    telephone: formData.get("telephone"),
  };

  const rawDon = {
    nature: formData.get("nature"),
    natureAutre: formData.get("natureAutre"),
    description: formData.get("description"),
    localisation: formData.get("localisation"),
  };

  const parsedDonateur = DonateurSchema.safeParse(rawDonateur);
  let parsedDon = DonSchema.safeParse(rawDon);

  if (!parsedDon.success && rawDon.nature === "AUTRE") {
    parsedDon = DonSchema.extend({
      natureAutre: z.string().min(2, "Précisez la nature du don"),
    }).safeParse(rawDon);
  }

  if (!parsedDonateur.success || !parsedDon.success) {
    return {
      success: false,
      errors: {
        donateur: parsedDonateur.error?.flatten() || {},
        don: parsedDon.error?.flatten() || {},
      },
    };
  }

  try {
    const donateur = await prisma.donateur.create({
      data: {
        ...parsedDonateur.data,
      },
    });

    const reference = generateReference();

    const don = await prisma.don.create({
      data: {
        reference,
        nature: parsedDon.data.nature,
        natureAutre: parsedDon.data.natureAutre || null,
        description: parsedDon.data.description,
        localisation: parsedDon.data.localisation,
        donateurId: donateur.id,
      },
    });

    await sendEmail({
      to: donateur.email,
      subject: `Votre don ONG-GAS — Référence ${reference}`,
      html: `
        <p>Bonjour ${donateur.prenom},</p>
        <p>Votre don a été enregistré avec succès.</p>
        <p><strong>Référence :</strong> ${reference}</p>
        <p>Conservez cette référence pour suivre votre dossier.</p>
        <p>Cordialement,<br/>ONG Global Actions Solidarité</p>
      `,
    });

    redirect(`/don/merci?reference=${encodeURIComponent(reference)}`);
  } catch (error) {
    console.error("[soumettreDon] Erreur:", error);
    return { success: false, error: "Erreur serveur lors de la soumission." };
  }
}
