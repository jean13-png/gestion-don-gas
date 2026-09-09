import { z } from "zod";

export const natureDonSchema = z.enum([
  "MATERIEL_INFORMATIQUE",
  "EQUIPEMENT_PEDAGOGIQUE",
  "DON_FINANCIER",
  "AUTRE",
]);

export const objectifDonSchema = z.enum([
  "EDUCATION",
  "AIDE_SOCIALE",
  "FORMATION",
  "AUTRES",
]);

export const donationSchema = z.object({
  nom: z.string().trim().min(1).max(120),
  prenom: z.string().trim().min(1).max(120),
  organisme: z.string().trim().max(180),
  email: z.string().trim().email().max(254),
  telephone: z.string().trim().min(8).max(30),
  nature: natureDonSchema,
  natureAutre: z.string().trim().max(180),
  description: z.string().trim().min(10).max(5000),
  localisation: z.string().trim().min(1).max(240),
  objectif: objectifDonSchema,
  objectifAutre: z.string().trim().max(180),
});

export const adminDonDetailsSchema = z.object({
  objectif: objectifDonSchema,
  objectifAutre: z.string().trim().max(180),
  responsable: z.string().trim().min(1).max(180),
  faitA: z.string().trim().max(180),
  dateReception: z.coerce.date().refine((date) => !Number.isNaN(date.getTime())),
});
