import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Stockage local des fichiers (photos, logos, fiches PDF).
 * Les fichiers sont enregistrés dans <projet>/uploads/ (ou UPLOAD_DIR)
 * et servis par le serveur web sous le chemin /uploads/...
 * Aucune dépendance à un service externe : tout reste sur notre serveur.
 */

const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "uploads");

/**
 * Enregistre un fichier dans le stockage local.
 * @param sousDossier sous-dossier de stockage (ex: "dons", "fiches")
 * @param nomFichier nom d'origine (utilisé pour un nom sécurisé lisible)
 * @param contenu contenu binaire du fichier
 * @returns l'URL publique relative, ex: "/uploads/dons/photo-xxx.jpg"
 */
export async function saveFile(
  sousDossier: string,
  nomFichier: string,
  contenu: Buffer,
): Promise<string> {
  const dossierCible = path.join(UPLOAD_ROOT, sousDossier);
  await mkdir(dossierCible, { recursive: true });

  // Nom sécurisé : base nettoyée + identifiant unique (anti-collision, anti-traversal)
  const base = path.parse(nomFichier).name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 60);
  const extension = path.parse(nomFichier).ext.toLowerCase();
  const nomFinal = `${base || "fichier"}-${randomUUID().slice(0, 8)}${extension}`;

  await writeFile(path.join(dossierCible, nomFinal), contenu);

  return `/uploads/${sousDossier}/${nomFinal}`;
}

/**
 * Supprime un fichier du stockage local.
 * Les URLs externes (ancien stockage cloud) sont ignorées sans erreur.
 */
export async function removeFile(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/uploads/")) return;

  // Sécurité : ne conserver que des segments de chemin sains (aucune remontée possible)
  const segmentsSains = url
    .slice("/uploads/".length)
    .split("/")
    .filter((segment) => segment && segment !== "." && segment !== "..");
  if (!segmentsSains.length) return;

  try {
    await unlink(path.join(UPLOAD_ROOT, ...segmentsSains));
  } catch {
    // Fichier déjà absent : rien à signaler
  }
}
