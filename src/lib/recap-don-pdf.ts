import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

export type DonRecapPdfData = {
  reference: string;
  statut?: string;
  donateur?: { prenom?: string; nom?: string };
  nature?: string;
  description?: string;
  localisation?: string;
  pays?: string;
  ville?: string;
  quartierVillage?: string;
  createdAt?: Date | string;
};

export function genererRecuDonPdf(data: DonRecapPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      const logoPath = path.join(process.cwd(), "public", "images", "logo-ong-gas.png");
      const legacyLogoPath = path.join(process.cwd(), "public", "fiche-don", "logo-ong-gas.jpg");
      const resolvedLogoPath = fs.existsSync(logoPath) ? logoPath : legacyLogoPath;
      if (fs.existsSync(resolvedLogoPath)) {
        doc.image(resolvedLogoPath, 48, 32, { width: 70 });
      }

      doc
        .fillColor("#1F4E79")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("ONG Global Actions Solidarité", 130, 42, { align: "left" });

      doc
        .fillColor("#2B3A55")
        .fontSize(12)
        .font("Helvetica")
        .text("Projet Informatique Pour Tous", 130, 68);

      doc
        .fillColor("#1C1C1C")
        .fontSize(17)
        .font("Helvetica-Bold")
        .text("Récapitulatif de votre proposition de don", 40, 120, { align: "center" });

      doc.moveTo(40, 145).lineTo(555, 145).strokeColor("#0A7FA5").lineWidth(1).stroke();

      const locationText = [data.pays, data.ville, data.quartierVillage, data.localisation]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value && value.length > 0))
        .join(", ");

      const rows = [
        ["Référence", data.reference || "—"],
        ["Statut", data.statut || "—"],
        ["Donateur", [data.donateur?.prenom, data.donateur?.nom].filter(Boolean).join(" ") || "—"],
        ["Nature du don", data.nature || "—"],
        ["Localisation", locationText || "—"],
        ["Date de soumission", data.createdAt ? new Date(data.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"],
      ];

      let y = 170;
      for (const [label, value] of rows) {
        doc
          .fillColor("#2B3A55")
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(`${label} :`, 50, y);

        doc
          .fillColor("#1F2937")
          .font("Helvetica")
          .fontSize(11)
          .text(String(value || "—"), 170, y, { width: 330, align: "left" });

        y += 22;
      }

      doc
        .fillColor("#2B3A55")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Description :", 50, y);

      doc
        .fillColor("#1F2937")
        .font("Helvetica")
        .fontSize(10)
        .text(String(data.description || "—"), 170, y, { width: 330, align: "left" });

      y += 52;
      doc.moveTo(40, y).lineTo(555, y).strokeColor("#D1D5DB").lineWidth(1).stroke();

      doc
        .fillColor("#4B5563")
        .font("Helvetica")
        .fontSize(10)
        .text("Conservez précieusement cette référence pour suivre l'avancement de votre dossier.", 40, y + 14, { width: 515, align: "center" });

      doc
        .fillColor("#1F4E79")
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(`Référence de suivi : ${data.reference || "—"}`, 40, y + 36, { align: "center" });

      doc
        .fillColor("#6B7280")
        .font("Helvetica")
        .fontSize(9)
        .text("Email : infos@ongglobalactionsolidarite.com    •    Téléphone : +229 01 46 46 66 56", 40, 760, { align: "center" });

      doc.end();
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
