import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { DON_STATUS_LABELS } from "@/lib/don-status";

/**
 * Export Excel de la liste des dons.
 * Route API dediee (et non une server action) : le fichier binaire est envoye
 * directement au navigateur avec Content-Disposition, ce qui evite toute
 * corruption du Buffer lors de la serialisation cote client.
 */

const NATURE_LABELS = {
  MATERIEL_INFORMATIQUE: "Matériel informatique",
  EQUIPEMENT_PEDAGOGIQUE: "Équipement pédagogique",
  DON_FINANCIER: "Don financier",
  DES_HABITS: "Des habits",
  DES_VIVRES: "Des vivres",
  MACHINES_A_COUDRE: "Des machines à coudre",
  VEHICULES: "Des véhicules",
  BUS_TRANSPORT: "Un bus de transport en commun",
  ORDINATEURS: "Des ordinateurs",
  MOBILIER: "Du mobilier (tables, chaises, tableaux, bancs…)",
  JOUETS: "Des jouets",
  LIVRES: "Des livres",
  FAUTEUILS_MEDICAUX: "Des fauteuils médicaux",
  BEQUILLES: "Des béquilles",
  APPARTEMENT: "Un appartement",
  MAISON: "Une maison",
  MATELAS: "Des matelas",
  IMPRIMANTES: "Des imprimantes",
  AUTRE: "Autre",
};

const STATUT_COULEURS = {
  SOUMIS: { fond: "FFF9DB", texte: "854D0E" },
  EN_VERIFICATION: { fond: "DBEAFE", texte: "1E40AF" },
  INSPECTE: { fond: "F3E8FF", texte: "6B21A8" },
  VALIDE: { fond: "DCFCE7", texte: "166534" },
  FICHE_GENEREE: { fond: "D1FAE5", texte: "065F46" },
  REJETE: { fond: "FEE2E2", texte: "991B1B" },
  PROGRAMMEE: { fond: "DBEAFE", texte: "1E40AF" },
};

const POLICE = "Times New Roman";
const BLEU = "FF0F3A5F";
const BLEU_CLAIR = "FFF5F9FD";
const GRIS_BORDURE = "FFDCE5EC";

function construireWhere(search, statut, nature, periode) {
  const where = {};
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { reference: { contains: q, mode: "insensitive" } },
      { donateur: { nom: { contains: q, mode: "insensitive" } } },
      { donateur: { prenom: { contains: q, mode: "insensitive" } } },
      { donateur: { email: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (statut && statut !== "ALL") where.statut = statut;
  if (nature && nature !== "ALL") where.nature = nature;
  if (periode && periode !== "all") {
    const now = new Date();
    let start;
    switch (periode) {
      case "7j": start = new Date(now.getTime() - 7 * 24 * 3600 * 1000); break;
      case "30j": start = new Date(now.getTime() - 30 * 24 * 3600 * 1000); break;
      case "90j": start = new Date(now.getTime() - 90 * 24 * 3600 * 1000); break;
      case "12m": start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()); break;
      default: start = new Date(0);
    }
    where.createdAt = { gte: start };
  }
  return where;
}

export async function GET(request) {
  try {
    await requirePermission("dons.export");
  } catch {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const statut = searchParams.get("statut") || "ALL";
  const nature = searchParams.get("nature") || "ALL";
  const periode = searchParams.get("periode") || "all";

  const dons = await prisma.don.findMany({
    where: construireWhere(search, statut, nature, periode),
    orderBy: { createdAt: "desc" },
    include: { donateur: true },
  });

  const classeur = new ExcelJS.Workbook();
  classeur.creator = "ONG Global Actions Solidarité";
  classeur.created = new Date();
  const feuille = classeur.addWorksheet("Dons", {
    views: [{ state: "frozen", ySplit: 7 }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  const COLONNES = [
    { header: "N°", key: "num", width: 5 },
    { header: "Référence", key: "reference", width: 18 },
    { header: "Nom", key: "nom", width: 18 },
    { header: "Prénom", key: "prenom", width: 16 },
    { header: "Téléphone", key: "telephone", width: 15 },
    { header: "Date de soumission", key: "soumission", width: 15 },
    { header: "Date de validation", key: "validation", width: 15 },
    { header: "Nature", key: "nature", width: 26 },
    { header: "Statut", key: "statut", width: 16 },
    { header: "Localisation", key: "localisation", width: 28 },
    { header: "Objectif", key: "objectif", width: 18 },
    { header: "Ce à quoi le don a servi", key: "servi", width: 42 },
    { header: "E-mail", key: "email", width: 28 },
  ];
  feuille.columns = COLONNES;

  // ---- Bandeau d'en-tete ----
  const derniereColonne = COLONNES.length; // 13 -> M
  feuille.mergeCells(3, 3, 3, derniereColonne);
  feuille.mergeCells(4, 3, 4, derniereColonne);
  feuille.mergeCells(5, 3, 5, derniereColonne);

  const titre = feuille.getCell("C3");
  titre.value = "ONG GLOBAL ACTIONS SOLIDARITÉ";
  titre.font = { name: POLICE, size: 20, bold: true, color: { argb: BLEU } };

  const sousTitre = feuille.getCell("C4");
  sousTitre.value = "Plateforme de gestion des dons · Projet Informatique Pour Tous";
  sousTitre.font = { name: POLICE, size: 12, italic: true, color: { argb: "FF0087A8" } };

  const filtresDescritifs = [
    statut !== "ALL" ? `statut : ${DON_STATUS_LABELS[statut] || statut}` : null,
    nature !== "ALL" ? `nature : ${NATURE_LABELS[nature] || nature}` : null,
    periode !== "all" ? `période : ${periode}` : null,
    search ? `recherche : « ${search} »` : null,
  ].filter(Boolean);

  const exportLigne = feuille.getCell("C5");
  exportLigne.value =
    `Liste des dons — exporté le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
    + (filtresDescritifs.length ? ` (${filtresDescritifs.join(", ")})` : " (tous les dons)");
  exportLigne.font = { name: POLICE, size: 11, color: { argb: "FF64748B" } };

  // Contact sous le titre (ligne 6, discrete)
  feuille.mergeCells(6, 3, 6, derniereColonne);
  const contact = feuille.getCell("C6");
  contact.value = "Abomey-Calavi, Bénin · infos@ongglobalactionsolidarite.com · +229 01 46 46 66 56";
  contact.font = { name: POLICE, size: 10, color: { argb: "FF8892A8" } };

  // Logo en haut a gauche
  try {
    const cheminLogo = path.join(process.cwd(), "public", "images", "logo-ong-gas.png");
    if (fs.existsSync(cheminLogo)) {
      const logo = classeur.addImage({
        base64: fs.readFileSync(cheminLogo).toString("base64"),
        extension: "png",
      });
      feuille.addImage(logo, {
        tl: { col: 0.15, row: 0.15 },
        ext: { width: 96, height: 96 },
      });
    }
  } catch (logoError) {
    console.error("[export] Logo non ajoute:", logoError);
  }

  // Hauteurs des lignes du bandeau
  for (let l = 1; l <= 6; l += 1) {
    feuille.getRow(l).height = l === 6 ? 14 : 22;
  }
  feuille.getRow(1).height = 26;
  feuille.getRow(2).height = 26;
  feuille.getRow(3).height = 28;
  feuille.getRow(4).height = 18;
  feuille.getRow(5).height = 18;

  // ---- Ligne d'en-tete du tableau (ligne 7) ----
  const ligneEntete = feuille.getRow(7);
  ligneEntete.height = 26;
  COLONNES.forEach((colonne, index) => {
    const cellule = ligneEntete.getCell(index + 1);
    cellule.value = colonne.header;
    cellule.font = { name: POLICE, size: 12, bold: true, color: { argb: "FFFFFFFF" } };
    cellule.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLEU } };
    cellule.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cellule.border = {
      top: { style: "thin", color: { argb: BLEU } },
      left: { style: "thin", color: { argb: BLEU } },
      bottom: { style: "medium", color: { argb: BLEU } },
      right: { style: "thin", color: { argb: BLEU } },
    };
  });

  // ---- Donnees ----
  const formaterDate = (d) => (d ? new Date(d).toLocaleDateString("fr-FR") : "");

  dons.forEach((don, index) => {
    const ligne = feuille.getRow(8 + index);
    const valeurs = [
      index + 1,
      don.reference,
      don.donateur.nom,
      don.donateur.prenom,
      don.donateur.telephone,
      formaterDate(don.createdAt),
      formaterDate(don.validatedAt),
      don.nature === "AUTRE" && don.natureAutre
        ? `Autre (${don.natureAutre})`
        : NATURE_LABELS[don.nature] || don.nature,
      DON_STATUS_LABELS[don.statut] || don.statut,
      don.localisation || [don.ville, don.pays].filter(Boolean).join(" - "),
      don.objectif === "AUTRES" && don.objectifAutre
        ? `Autres (${don.objectifAutre})`
        : don.objectif === "EDUCATION" ? "Éducation"
          : don.objectif === "AIDE_SOCIALE" ? "Aide sociale"
            : don.objectif === "FORMATION" ? "Formation" : don.objectif,
      don.aQuoiServi || "",
      don.donateur.email,
    ];

    const pair = index % 2 === 1;
    valeurs.forEach((valeur, colIndex) => {
      const cellule = ligne.getCell(colIndex + 1);
      cellule.value = valeur;
      cellule.font = { name: POLICE, size: 13, color: { argb: "FF22323B" } };
      cellule.alignment = {
        vertical: "middle",
        horizontal: colIndex === 0 ? "center" : "left",
        wrapText: colIndex >= 9,
      };
      cellule.border = {
        top: { style: "thin", color: { argb: GRIS_BORDURE } },
        left: { style: "thin", color: { argb: GRIS_BORDURE } },
        bottom: { style: "thin", color: { argb: GRIS_BORDURE } },
        right: { style: "thin", color: { argb: GRIS_BORDURE } },
      };
      if (pair) {
        cellule.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLEU_CLAIR } };
      }
    });

    // Mise en evidence du statut
    const couleurs = STATUT_COULEURS[don.statut];
    if (couleurs) {
      const celluleStatut = ligne.getCell(9);
      celluleStatut.fill = { type: "pattern", pattern: "solid", fgColor: { argb: couleurs.fond } };
      celluleStatut.font = { name: POLICE, size: 13, bold: true, color: { argb: couleurs.texte } };
      celluleStatut.alignment = { vertical: "middle", horizontal: "center" };
    }

    ligne.height = 20;
  });

  // ---- Ligne de total ----
  const ligneTotal = feuille.getRow(8 + dons.length + 1);
  feuille.mergeCells(8 + dons.length + 1, 1, 8 + dons.length + 1, 13);
  const celluleTotal = ligneTotal.getCell(1);
  celluleTotal.value = dons.length
    ? `Total : ${dons.length} don${dons.length > 1 ? "s" : ""}`
    : "Aucun don ne correspond aux filtres sélectionnés.";
  celluleTotal.font = { name: POLICE, size: 13, bold: true, italic: true, color: { argb: BLEU } };
  celluleTotal.alignment = { vertical: "middle", horizontal: "left" };
  ligneTotal.height = 24;

  // Filtre automatique sur l'en-tete du tableau
  feuille.autoFilter = { from: { row: 7, column: 1 }, to: { row: 7, column: COLONNES.length } };

  const contenu = await classeur.xlsx.writeBuffer();
  const nomFichier = `dons-ong-gas-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(contenu, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${nomFichier}"`,
      "Cache-Control": "no-store",
    },
  });
}
