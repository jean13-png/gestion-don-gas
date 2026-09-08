import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* ---------------------------------------------------------------------------
 * TYPES — champs dynamiques (cf. spec §6)
 * ------------------------------------------------------------------------- */

export type NatureDon = "ESPECES" | "MATERIEL" | "VIVRES" | "AUTRES";
export type ObjectifDon = "EDUCATION" | "AIDE_SOCIALE" | "FORMATION" | "AUTRES";

export interface DonFicheData {
  donateur: {
    nomRaisonSociale?: string;
    representant?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
  };
  nature?: NatureDon;
  /** Si nature = AUTRES : détail écrit après « Autres » (remplace les «……»). */
  natureAutresDetail?: string;
  description?: string;
  objectif?: ObjectifDon;
  /** Si objectif = AUTRES : détail écrit après « Autres » (remplace les «…»). */
  objectifAutresDetail?: string;
  /** Ex. « Abomey-Calavi » */
  faitA?: string;
  /** Format « JJ/MM/AAAA » */
  dateReception?: string;
  /** Texte écrit après « Responsable d » (ex. « e la plateforme — M. TOSSA »). */
  responsable?: string;
}

/* ---------------------------------------------------------------------------
 * RÉSOLUTION DES FICHIERS (polices & images)
 * ------------------------------------------------------------------------- */

const FONTS = path.join(process.cwd(), "public", "fiche-don", "fonts");
const ASSETS = path.join(process.cwd(), "public", "fiche-don");

const FALLBACK_FONTS = path.join(__dirname, "fonts");
const FALLBACK_ASSETS = path.join(__dirname, "assets");

function resolveFont(candidates: string[]): string | null {
  for (const c of candidates) {
    const p = path.join(FONTS, c);
    if (fs.existsSync(p)) return p;
  }
  for (const c of candidates) {
    const p = path.join(FALLBACK_FONTS, c);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const F = {
  Calibri: resolveFont(["Calibri-subset.ttf", "Carlito-Regular.ttf"]),
  CalibriBold: resolveFont(["Calibri-Bold-subset.ttf", "Carlito-Bold.ttf"]),
  CalibriBoldItalic: resolveFont(["Calibri-BoldItalic-subset.ttf", "Carlito-BoldItalic.ttf", "Carlito-Bold.ttf"]),
  Times: resolveFont(["TimesNewRoman-subset.ttf", "LiberationSerif-Regular.ttf"]),
  TimesBold: resolveFont(["TimesNewRoman-Bold-subset.ttf", "LiberationSerif-Bold.ttf"]),
  Georgia: resolveFont(["Georgia-subset.ttf", "Gelasio-Regular.ttf", "LiberationSerif-Regular.ttf"]),
  GeorgiaBold: resolveFont(["Georgia-Bold-subset.ttf", "Gelasio-Bold.ttf", "LiberationSerif-Bold.ttf"]),
  Berlin: resolveFont(["BerlinSansFB-subset.ttf", "BRLNSR.TTF", "Carlito-Regular.ttf"]),
  Dyn: resolveFont(["TimesNewRoman.ttf", "times.ttf", "LiberationSerif-Regular.ttf"]),
  DynBold: resolveFont(["TimesNewRoman-Bold.ttf", "timesbd.ttf", "LiberationSerif-Bold.ttf"]),
  DynBerlin: resolveFont(["BerlinSansFB.ttf", "BRLNSR.TTF", "Carlito-Regular.ttf"]),
};

const IMG = {
  logo: path.join(ASSETS, "logo-ong-gas.jpg"),
  iconeMail: path.join(ASSETS, "icone-mail.png"),
  iconeTel: path.join(ASSETS, "icone-telephone.png"),
  fondCentral: path.join(ASSETS, "fond-central.jpg"),
  bandeauTitre: path.join(ASSETS, "bandeau-titre.png"),
  colonneCreme: path.join(ASSETS, "fond-colonne-creme.png"),
  colonneLilas: path.join(ASSETS, "fond-colonne-lilas.png"),
};

function resolveAsset(name: string): string {
  const primary = path.join(ASSETS, name);
  const fallback = path.join(FALLBACK_ASSETS, name);
  if (fs.existsSync(primary)) return primary;
  if (fs.existsSync(fallback)) return fallback;
  return primary;
}

/* ---------------------------------------------------------------------------
 * CONSTANTES DE MISE EN PAGE (mesurées sur le modèle — spec §4/§5)
 * ------------------------------------------------------------------------- */

const PAGE = { W: 595.2, H: 841.92 }; // A4 exact du modèle

const C = {
  noir: "#000000",
  blanc: "#FFFFFF",
  bleuTitre: "#2E74B5", // ligne 1 en-tête
  bleuColonnes: "#4471C4", // en-têtes de colonnes
  bleuDonateur: "#D9E1F3", // bandeau LE DONATEUR
  rouge: "#FF0000", // NATURE DU DON
  vert: "#00B050", // OBJECTIF DU DON
  vertSouligne: "#00AF50",
  marine: "#001F5F", // cases à cocher + cadre description
  bleuCase: "#006FC0", // cases objectif 1 & 3
};

/**
 * Correction verticale par police (pt). PDFKit et le modèle Word/PDF n'ancrent
 * pas la ligne exactement de la même façon (ascender des subsets extraites).
 * Valeurs calées par le test de superposition — NE PAS modifier sans re-tester.
 */
const Y_ADJ: Record<string, number> = {
  Calibri: 0, CalibriBold: 0, CalibriBoldItalic: 0,
  Times: 0, TimesBold: 0,
  Georgia: 0, GeorgiaBold: 0, Berlin: 0,
  Dyn: 0, DynBold: 0, DynBerlin: 0,
};

/* Textes statiques des colonnes — [x, y, texte, police] (spec §5) */
type Ligne = [number, number, string, keyof typeof F | null];

const BUILT_IN: Record<string, string> = {
  Calibri: "Helvetica",
  CalibriBold: "Helvetica-Bold",
  CalibriBoldItalic: "Helvetica-BoldOblique",
  Times: "Times-Roman",
  TimesBold: "Times-Bold",
  Georgia: "Times-Roman",
  GeorgiaBold: "Times-Bold",
  Berlin: "Helvetica",
  Dyn: "Times-Roman",
  DynBold: "Times-Bold",
  DynBerlin: "Helvetica",
};

function safeFont(key: keyof typeof F | null | undefined): string {
  if (key && F[key]) return F[key]!;
  if (key && BUILT_IN[key]) return BUILT_IN[key]!;
  return "Helvetica";
}

const COL_ACC: Ligne[] = [
  [83.8, 193.3, "•Secours", "Times"],
  [83.8, 205.3, "•aide sociale", "Times"],
  [83.8, 217.6, "•", "Times"],        // puce et mot séparés dans le modèle
  [90.8, 217.6, "humanitaire", "Times"],
  [83.8, 229.6, "•soutien", "Times"],
  [88.4, 239.9, "d'entreprendre des", "Times"],
  [88.4, 250.2, "activités...", "Times"],
];

const COL_FORM: Ligne[] = [
  [196.6, 193.3, "•Informatique", "Times"],
  [196.6, 205.3, "•couture", "Times"],
  [196.6, 217.6, "•coiffure", "Times"],
  [196.6, 229.6, "•agriculture", "Times"],
  [196.6, 241.6, "•élevage", "Times"],
  [196.6, 253.8, "•danse", "Times"],
  [196.6, 265.8, "•mécanique auto-", "Times"],
  [201.1, 276.2, "moto", "Times"],
  [196.6, 288.2, "•", "Times"],        // puce et mot séparés dans le modèle
  [203.5, 288.2, "des métiers", "Times"],
  [201.1, 298.7, "d'avenir...", "Times"],
];

const COL_ACT: Ligne[] = [
  [309.3, 193.3, "•Distributions des", "Times"],
  [313.9, 203.7, "kits scolaires, des", "Times"],
  [313.9, 214.0, "vêtements, des", "Times"],
  [313.9, 224.3, "vivres aux enfants", "Times"],
  [313.9, 234.9, "orphelins et", "Times"],
  [313.9, 245.2, "démunis...", "Times"],
  [309.3, 257.2, "•Noël Pour Tous", "Times"],
  [309.3, 269.2, "•Tournoi des enfants", "Times"],
  [309.3, 281.4, "•la danse mon sport", "Times"],
  [309.3, 293.4, "•soirée cinéma", "Times"],
  [309.3, 305.4, "•", "Times"],        // puce et mot séparés dans le modèle
  [316.3, 305.4, "distributions des", "Times"],
  [313.9, 315.8, "ustensiles de", "Times"],
  [313.9, 326.3, "cuisines aux femmes", "Times"],
  [313.9, 336.6, "(veuves et", "Times"],
  [313.9, 347.0, "pauvres)...", "Times"],
];

const COL_AUT: Ligne[] = [
  [422.1, 193.3, "•Toutes actions pour", "Times"],
  [426.6, 203.7, "l'améliorations des", "Times"],
  [426.6, 214.0, "cnditions de vie pour", "Times"],
  [426.6, 224.3, "tous...", "Times"],
  [422.1, 236.5, "•Campagne de", "Times"],
  [426.6, 248.3, "dépistage-", "CalibriBold"],
  [426.6, 259.3, "sensibilisation et", "CalibriBold"],
  [426.6, 270.4, "conseil sur la", "CalibriBold"],
  [426.6, 281.4, "santé... A", "CalibriBold"],
  [422.1, 292.7, "•Assurer le", "Times"],
  [426.6, 303.0, "déplacement du", "Times"],
  [426.6, 313.4, "personnel et des", "Times"],
  [426.6, 323.7, "bénéficiaires.", "Times"],
];

/* Cases à cocher — [x, y, w, h, couleur, épaisseur] (spec §4.5/§4.7) */
const CASES_NATURE: Record<NatureDon, [number, number, number, number, string, number]> = {
  ESPECES: [173, 520, 16, 7, C.marine, 1.44],
  MATERIEL: [243, 520, 16, 7, C.marine, 0.96],
  VIVRES: [315, 519, 16, 7, C.marine, 0.96],
  AUTRES: [385, 519, 17, 7, C.marine, 0.96],
};

const CASES_OBJECTIF: Record<ObjectifDon, [number, number, number, number, string, number]> = {
  EDUCATION: [141, 680, 13, 12, C.bleuCase, 0.96],
  AIDE_SOCIALE: [264, 681, 13, 11, C.marine, 0.96],
  FORMATION: [400, 680, 13, 12, C.bleuCase, 0.96],
  AUTRES: [475, 680, 13, 12, C.marine, 0.96],
};

/* ---------------------------------------------------------------------------
 * GÉNÉRATION
 * ------------------------------------------------------------------------- */

export function genererFicheReceptionDon(data: DonFicheData = {}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [PAGE.W, PAGE.H],
      margins: 0, // tout est positionné explicitement (spec §3)
      info: { Title: "FICHE DE RECEPTION DE DON", Author: "ONG-GAS — Projet PIPT" },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      dessiner(doc, data);
      doc.end();
    } catch (e) {
      reject(e as Error);
    }
  });
}

/* --- Helpers de dessin ----------------------------------------------------- */

type Doc = PDFKit.PDFDocument;

/** Texte positionné au point près (jamais de flux automatique). */
function texte(doc: Doc, t: string, x: number, y: number, f: keyof typeof F, size: number, color = C.noir) {
  const file = safeFont(f);
  doc.font(file).fontSize(size).fillColor(color)
     .text(t, x, y + (Y_ADJ[f] ?? 0), { lineBreak: false });
}

/**
 * Ligne « préfixe statique + valeur dynamique » : le préfixe utilise la police
 * sous-ensemble du modèle (fidélité glyphique), la valeur une police COMPLÈTE
 * métriquement compatible (spec §7 — les subsets n'ont pas tous les glyphes :
 * chiffres, lettres rares…). La valeur est tronquée à maxDynPt si besoin.
 * Retourne l'abscisse de fin pour enchaîner un segment suivant.
 */
function texteMixte(doc: Doc, prefixe: string, valeur: string, x: number, y: number,
                    fStat: keyof typeof F, fDyn: keyof typeof F, size: number,
                    color = C.noir, maxDynPt = Infinity): number {
  const statFont = safeFont(fStat);
  const dynFont = safeFont(fDyn);
  doc.font(statFont).fontSize(size).fillColor(color);
  doc.text(prefixe, x, y + (Y_ADJ[fStat] ?? 0), { lineBreak: false });
  let cx = x + doc.widthOfString(prefixe);
  let v = valeur.trim();
  if (v) {
    doc.font(dynFont);
    while (v.length > 1 && doc.widthOfString(v) > maxDynPt) v = v.slice(0, -1);
    doc.text(v, cx, y + (Y_ADJ[fDyn] ?? 0), { lineBreak: false });
    cx += doc.widthOfString(v);
  }
  return cx;
}

function rectPlein(doc: Doc, x: number, y: number, w: number, h: number, color: string) {
  doc.rect(x, y, w, h).fillColor(color).fill();
}

function rectContour(doc: Doc, x: number, y: number, w: number, h: number, color: string, lw: number) {
  doc.rect(x, y, w, h).lineWidth(lw).strokeColor(color).stroke();
}

function trait(doc: Doc, x1: number, y1: number, x2: number, y2: number, color: string, lw: number) {
  doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(lw).strokeColor(color).stroke();
}

function image(doc: Doc, file: string, x: number, y: number, w: number, h: number) {
  const resolved = resolveAsset(path.basename(file));
  try {
    if (fs.existsSync(resolved)) {
      doc.image(resolved, x, y, { width: w, height: h });
    }
  } catch (e) {
    console.warn(`[pdf] Image introuvable ou illisible: ${resolved}`);
  }
}

/** Croix de coche centrée dans une case. */
function cocher(doc: Doc, box: [number, number, number, number]) {
  const [x, y, w, h] = box;
  doc.font(safeFont("DynBold")).fontSize(11.04).fillColor(C.noir)
     .text("X", x - 4, y + (h - 11) / 2 - 1, { width: w + 8, align: "center", lineBreak: false });
}

/* --- Le document ----------------------------------------------------------- */

function dessiner(doc: Doc, d: DonFicheData): void {
  /* 1. Image de fond centrale (derrière tout) */
  image(doc, IMG.fondCentral, 56.7, 180.5, 481.8, 480.6);

  /* 2. Bandeau du titre */
  image(doc, IMG.bandeauTitre, 153.4, 110.6, 288.4, 38.0);

  /* 3. Fonds des quatre colonnes (crème / lilas alternés) */
  image(doc, IMG.colonneCreme, 78.5, 188.9, 101.0, 180.0);
  image(doc, IMG.colonneLilas, 191.3, 188.9, 101.0, 180.0);
  image(doc, IMG.colonneCreme, 303.8, 188.9, 101.1, 180.0);
  image(doc, IMG.colonneLilas, 416.6, 188.9, 101.1, 180.0);

  /* 4. Vectoriel — cadre en-tête, barre noire, en-têtes de colonnes */
  rectContour(doc, 120, 15, 354, 75, C.noir, 0.48);
  // Barre noire du modèle = filet supérieur + intervalle blanc + barre principale
  // (dessin d'origine mesuré : 2 rects pleins noirs dans (40.44,94.08)-(550.64,98.64))
  rectPlein(doc, 40.44, 94.08, 510.20, 0.91, C.noir);
  rectPlein(doc, 40.44, 95.90, 510.20, 2.74, C.noir);

  for (const [x, w] of [[80, 98], [192, 99], [305, 99], [418, 98]] as Array<[number, number]>) {
    doc.rect(x, 167, w, 23).lineWidth(0.96).fillColor(C.bleuColonnes).strokeColor(C.bleuColonnes).fillAndStroke();
  }
  texte(doc, "ACCOMPAGNEMENTS", 85.8, 173.9, "TimesBold", 7.9, C.blanc);
  texte(doc, "FORMATIONS", 214.4, 173.9, "TimesBold", 7.9, C.blanc);
  texte(doc, "ACTIVITÉS SOCILES", 314.4, 173.9, "TimesBold", 7.9, C.blanc);
  texte(doc, "AUTRES", 451.4, 173.9, "TimesBold", 7.9, C.blanc);

  /* 5. Tableau « LE DONATEUR / PARTENAIRE » */
  rectPlein(doc, 60, 393, 476, 12, C.bleuDonateur); // bandeau
  // grille
  rectContour(doc, 59, 392, 477, 120, C.noir, 1);
  trait(doc, 297.5, 392, 297.5, 512, C.noir, 1);
  for (const y of [406, 426.5, 448, 469, 490]) {
    trait(doc, 59, y, 536, y, C.noir, 1);
  }
  texte(doc, "LE DONATEUR / PARTENAIRE", 217.1, 393.0, "TimesBold", 11.04);

  // libellés (Georgia Bold 11) — les accents sont rendus en Times Bold dans le
  // modèle (substitution Word) : reproduit à l'identique pour ces 2 libellés.
  texte(doc, "Nom/Raison sociale", 64.8, 413.8, "GeorgiaBold", 11.04);
  texte(doc, "Repr", 64.8, 435.0, "GeorgiaBold", 11.04);
  texte(doc, "é", 92.9, 435.2, "TimesBold", 11.04);
  texte(doc, "sentant (si organisation)", 97.7, 435.0, "GeorgiaBold", 11.04);
  texte(doc, "Adresse", 64.8, 456.1, "GeorgiaBold", 11.04);
  texte(doc, "T", 64.8, 477.2, "GeorgiaBold", 11.04);
  texte(doc, "é", 72.3, 477.5, "TimesBold", 11.04);
  texte(doc, "l", 77.1, 477.2, "GeorgiaBold", 11.04);
  texte(doc, "é", 80.9, 477.5, "TimesBold", 11.04);
  texte(doc, "phone", 85.7, 477.2, "GeorgiaBold", 11.04);
  texte(doc, "Email", 64.8, 498.3, "GeorgiaBold", 11.04);

  // valeurs dynamiques (colonne de droite) — police complète
  const valeurs: Array<[string | undefined, number]> = [
    [d.donateur?.nomRaisonSociale, 411],
    [d.donateur?.representant, 431],
    [d.donateur?.adresse, 453],
    [d.donateur?.telephone, 474],
    [d.donateur?.email, 495],
  ];
  for (const [v, y] of valeurs) {
    if (v?.trim()) {
      let s = v.trim();
      doc.font(F.Dyn).fontSize(11.04);
      while (s.length > 1 && doc.widthOfString(s) > 240) s = s.slice(0, -1);
      texte(doc, s, 305, y, "Dyn", 11.04);
    }
  }

  /* 6. Ligne « NATURE DU DON : » */
  texte(doc, "NATURE DU DON :", 66.5, 517.5, "Berlin", 11, C.rouge);
  trait(doc, 66, 528.5, 150, 528.5, C.rouge, 1);
  for (const [nature, box] of Object.entries(CASES_NATURE) as Array<[NatureDon, [number, number, number, number, string, number]]>) {
    const [x, y, w, h, coul, lw] = box;
    rectContour(doc, x, y, w, h, coul, lw);
    if (d.nature === nature) cocher(doc, [x, y, w, h]);
  }
  texte(doc, "Espèces", 191.4, 516.7, "Berlin", 12);
  texte(doc, "Matériel", 262.2, 517.5, "Berlin", 11.04);
  texte(doc, "Vivres", 333.0, 517.5, "Berlin", 11.04);
  if (d.natureAutresDetail?.trim()) {
    texteMixte(doc, "Autres ", d.natureAutresDetail, 403.9, 517.5, "Berlin", "DynBerlin", 11.04, C.noir, 105);
  } else {
    texte(doc, "Autres……………………………………", 403.9, 517.5, "Berlin", 11.04);
  }

  /* 7. Cadre « DESCRIPTION DU DON : » */
  texte(doc, "DESCRIPTION DU DON :", 215.9, 535.9, "TimesBold", 13.92);
  trait(doc, 216, 550.5, 371, 550.5, C.noir, 1);
  rectContour(doc, 57, 556, 481, 121, C.marine, 2.16);

  if (d.description?.trim()) {
    // texte multi-lignes dans le cadre : max 7 lignes, réduction puis troncature
    const maxLignes = 7;
    let size = 11.04;
    let coupe = d.description.trim();
    const largeur = 462;
    // estimation simple de découpage par mots (PDFKit fait le rendu final)
    const lignes: string[] = [];
    let courant = "";
    for (const mot of coupe.split(/\s+/)) {
      const essai = courant ? `${courant} ${mot}` : mot;
      if (essai.length > Math.floor(largeur / (size * 0.45))) { // ~ caractère Times ≈ 0.45×taille
        lignes.push(courant); courant = mot;
      } else courant = essai;
    }
    if (courant) lignes.push(courant);
    if (lignes.length > maxLignes) { size = 10; }
    while (lignes.length > maxLignes && size > 8) { size -= 0.5; }
    const lignesFinales = lignes.slice(0, maxLignes);
    if (lignes.length > maxLignes) lignesFinales[maxLignes - 1] = lignesFinales[maxLignes - 1].slice(0, -1) + "…";
    doc.font(F.Dyn).fontSize(size).fillColor(C.noir);
    let yy = 566;
    for (const l of lignesFinales) {
      doc.text(l, 66, yy, { lineBreak: false });
      yy += 16;
    }
  }

  /* 8. Ligne « OBJECTIF DU DON : » */
  texte(doc, "OBJECTIF DU DON :", 46.1, 682.7, "Berlin", 11, C.vert);
  trait(doc, 46, 693.5, 134, 693.5, C.vertSouligne, 1);
  for (const [obj, box] of Object.entries(CASES_OBJECTIF) as Array<[ObjectifDon, [number, number, number, number, string, number]]>) {
    const [x, y, w, h, coul, lw] = box;
    rectContour(doc, x, y, w, h, coul, lw);
    if (d.objectif === obj) cocher(doc, [x, y, w, h]);
  }
  texte(doc, "Soutien à l\u2019éducation", 155.4, 681.8, "Berlin", 12);
  if (d.objectifAutresDetail?.trim()) {
    texteMixte(doc, "Aide sociale/Humanitaire       Formation          Autres ",
               d.objectifAutresDetail, 280.0, 682.7, "Berlin", "DynBerlin", 11.04, C.noir, 35);
  } else {
    texte(doc, "Aide sociale/Humanitaire       Formation          Autres……………", 280.0, 682.7, "Berlin", 11.04);
  }

  /* 9. Signature, responsable, pied de page */
  if (d.faitA?.trim()) {
    const cx = texteMixte(doc, "Fait à ", d.faitA, 304.9, 702.5, "TimesBold", "DynBold", 12, C.noir, 120);
    texteMixte(doc, " le ", d.dateReception ?? "…./…./…….", cx, 702.5, "TimesBold", "DynBold", 12, C.noir, 60);
  } else {
    texte(doc, "Fait à ……..………………….. le…./…./…….", 304.9, 702.5, "TimesBold", 12);
  }
  texte(doc, "ONG-GAS", 444.7, 722.7, "TimesBold", 12);
  if (d.responsable?.trim()) {
    texteMixte(doc, "Responsable d", d.responsable, 56.7, 726.3, "TimesBold", "DynBold", 12, C.noir, 280);
  } else {
    texte(doc, "Responsable d……………………………", 56.7, 726.3, "TimesBold", 12);
  }

  texte(doc, "N°: ", 152.2, 795.7, "CalibriBold", 9.12);
  texte(doc, "2025/372/MISP/DC/SGM/DAIC/SACC/SA", 165.9, 795.7, "Calibri", 9.12);
  texte(doc, " - ", 314.8, 795.7, "CalibriBold", 9.12);
  texte(doc, "OAPI : N°003/MIC/DDI/C-SPPI/S-DDI ", 321.7, 796.6, "CalibriBold", 7.92);

  /* 10. En-tête institutionnel (textes) */
  texte(doc, "ONG Global Actions Solidarité – Projet Informatique Pour Tous", 141.9, 21.7, "CalibriBoldItalic", 12, C.bleuTitre);
  texte(doc, "Mail : infos@ongglobalactionsolidarite.com", 206.5, 35.7, "CalibriBold", 10.08);
  texte(doc, "+229-01-46-46-66-56", 254.0, 47.9, "CalibriBold", 10.08);
  texte(doc, "N°OAPI : 003/MIC/DDI/C-SPPI/S-DDI", 129.2, 60.9, "CalibriBold", 9.12);
  texte(doc, "Siège : ", 276.4, 60.1, "CalibriBold", 10.08);
  texte(doc, "Abomey-Calavi République du Bénin", 305.6, 58.7, "TimesBold", 10.08);

  texte(doc, "FICHE DE RECEPTION DE DON", 163.5, 125.6, "Georgia", 18);

  /* 11. Listes des colonnes */
  for (const [x, y, t, f] of [...COL_ACC, ...COL_FORM, ...COL_ACT, ...COL_AUT]) {
    texte(doc, t, x, y, (f ?? "Times") as keyof typeof F, 10.08);
  }

  /* 12. Logos et icônes (au premier plan, comme le modèle) */
  image(doc, IMG.logo, 31.4, 11.0, 73.0, 78.3); // gauche
  image(doc, IMG.logo, 489.8, 14.9, 73.2, 78.2); // droite (même image)
  image(doc, IMG.iconeMail, 214.1, 45.1, 13.7, 13.92);
  image(doc, IMG.iconeTel, 229.7, 45.1, 13.2, 13.5);
}
