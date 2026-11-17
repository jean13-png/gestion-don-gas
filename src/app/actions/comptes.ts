"use server";

import prisma from "@/lib/prisma";
import { CLES_PERMISSIONS, aPermission, requirePermission } from "@/lib/auth";
import { journaliserAction } from "@/lib/mail";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

const MOT_DE_PASSE_MIN = 8;

/** Liste des autorisations envoyées par un formulaire, filtrée sur le catalogue officiel. */
function lirePermissions(formData: FormData): string[] {
  return formData
    .getAll("permissions")
    .map(String)
    .filter((cle) => CLES_PERMISSIONS.includes(cle));
}

function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Crée un compte administrateur. Réservé aux comptes disposant de
 * l'autorisation « comptes.gerer ».
 */
export async function creerCompteAdmin(prevState: unknown, formData: FormData) {
  const admin = await requirePermission("comptes.gerer");

  const nom = formData.get("nom")?.toString().trim() || "";
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const motDePasse = formData.get("motDePasse")?.toString() || "";
  const permissions = lirePermissions(formData);

  if (nom.length < 2) {
    return { error: "Le nom du compte est obligatoire (au moins 2 caractères)." };
  }
  if (!emailValide(email)) {
    return { error: "L'adresse e-mail saisie n'est pas valide." };
  }
  if (motDePasse.length < MOT_DE_PASSE_MIN) {
    return { error: `Le mot de passe doit contenir au moins ${MOT_DE_PASSE_MIN} caractères.` };
  }
  if (permissions.length === 0) {
    return { error: "Sélectionnez au moins une autorisation pour ce compte." };
  }

  const existant = await prisma.admin.findUnique({ where: { email } });
  if (existant) {
    return { error: "Un compte existe déjà avec cette adresse e-mail." };
  }

  const passwordHash = await bcrypt.hash(motDePasse, 12);
  const compte = await prisma.admin.create({
    data: { nom, email, passwordHash, permissions, actif: true },
  });

  await journaliserAction(
    undefined,
    `Compte créé : ${compte.nom} (${compte.email}) avec ${permissions.length} autorisation(s), par ${admin.nom}`,
  );

  revalidatePath("/admin/comptes");
  return { success: true, message: `Le compte de ${nom} a été créé.` };
}

/**
 * Modifie le nom et les autorisations d'un compte.
 * Règle de sécurité : au moins un compte actif doit toujours garder
 * l'autorisation « comptes.gerer ».
 */
export async function modifierCompteAdmin(formData: FormData) {
  const admin = await requirePermission("comptes.gerer");

  const id = formData.get("id")?.toString().trim() || "";
  const nom = formData.get("nom")?.toString().trim() || "";
  const permissions = lirePermissions(formData);

  if (!id) {
    return { error: "Compte introuvable." };
  }
  if (nom.length < 2) {
    return { error: "Le nom du compte est obligatoire (au moins 2 caractères)." };
  }
  if (permissions.length === 0) {
    return { error: "Sélectionnez au moins une autorisation pour ce compte." };
  }

  const compte = await prisma.admin.findUnique({ where: { id } });
  if (!compte) {
    return { error: "Compte introuvable." };
  }

  // Sécurité anti-verrouillage : si l'on retire « comptes.gerer » à ce compte,
  // un autre compte actif doit déjà la détenir.
  const perdGestionComptes =
    aPermission(compte, "comptes.gerer") && !permissions.includes("comptes.gerer");
  if (perdGestionComptes) {
    const autres = await prisma.admin.findMany({
      where: { id: { not: id }, actif: true },
      select: { permissions: true },
    });
    const gardeExiste = autres.some((autre) => aPermission(autre, "comptes.gerer"));
    if (!gardeExiste) {
      return {
        error:
          "Impossible : au moins un compte actif doit garder l'autorisation « Créer et gérer les comptes ».",
      };
    }
  }

  const modifie = await prisma.admin.update({
    where: { id },
    data: { nom, permissions },
  });

  await journaliserAction(
    undefined,
    `Compte modifié : ${modifie.nom} (${modifie.email}) — ${permissions.length} autorisation(s), par ${admin.nom}`,
  );

  revalidatePath("/admin/comptes");
  return { success: true, message: `Le compte de ${nom} a été mis à jour.` };
}

/** Réinitialise le mot de passe d'un compte. */
export async function reinitialiserMotDePasseCompte(formData: FormData) {
  const admin = await requirePermission("comptes.gerer");

  const id = formData.get("id")?.toString().trim() || "";
  const motDePasse = formData.get("motDePasse")?.toString() || "";

  if (!id) {
    return { error: "Compte introuvable." };
  }
  if (motDePasse.length < MOT_DE_PASSE_MIN) {
    return { error: `Le nouveau mot de passe doit contenir au moins ${MOT_DE_PASSE_MIN} caractères.` };
  }

  const compte = await prisma.admin.findUnique({ where: { id } });
  if (!compte) {
    return { error: "Compte introuvable." };
  }

  const passwordHash = await bcrypt.hash(motDePasse, 12);
  await prisma.admin.update({ where: { id }, data: { passwordHash } });

  await journaliserAction(
    undefined,
    `Mot de passe réinitialisé pour le compte ${compte.nom} (${compte.email}) par ${admin.nom}`,
  );

  revalidatePath("/admin/comptes");
  return { success: true, message: `Le mot de passe de ${compte.nom} a été réinitialisé.` };
}

/** Active ou désactive un compte. Un compte désactivé ne peut plus se connecter. */
export async function basculerCompteAdmin(formData: FormData) {
  const admin = await requirePermission("comptes.gerer");

  const id = formData.get("id")?.toString().trim() || "";
  if (!id) {
    return { error: "Compte introuvable." };
  }
  if (id === admin.id) {
    return { error: "Vous ne pouvez pas désactiver votre propre compte." };
  }

  const compte = await prisma.admin.findUnique({ where: { id } });
  if (!compte) {
    return { error: "Compte introuvable." };
  }

  const actif = !compte.actif;

  // Sécurité : ne pas désactiver le dernier compte actif pouvant gérer les comptes.
  if (!actif && aPermission(compte, "comptes.gerer")) {
    const autres = await prisma.admin.findMany({
      where: { id: { not: id }, actif: true },
      select: { permissions: true },
    });
    const gardeExiste = autres.some((autre) => aPermission(autre, "comptes.gerer"));
    if (!gardeExiste) {
      return {
        error:
          "Impossible : au moins un compte actif doit garder l'autorisation « Créer et gérer les comptes ».",
      };
    }
  }

  await prisma.admin.update({ where: { id }, data: { actif } });

  await journaliserAction(
    undefined,
    `Compte ${actif ? "activé" : "désactivé"} : ${compte.nom} (${compte.email}), par ${admin.nom}`,
  );

  revalidatePath("/admin/comptes");
  return {
    success: true,
    message: `Le compte de ${compte.nom} a été ${actif ? "activé" : "désactivé"}.`,
  };
}
