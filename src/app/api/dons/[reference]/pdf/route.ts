import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { genererFicheReceptionDon } from "@/lib/pdf";
import { checkRateLimit } from "@/lib/rate-limit";

const NATURE_MAP = {
  MATERIEL_INFORMATIQUE: "MATERIEL",
  EQUIPEMENT_PEDAGOGIQUE: "MATERIEL",
  DON_FINANCIER: "ESPECES",
  AUTRE: "AUTRES",
};

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  if (!(await checkRateLimit(`don-pdf:${ip}`, 15 * 60 * 1000, 10))) {
    return NextResponse.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429 });
  }

  const { reference } = await params;
  const don = await prisma.don.findUnique({
    where: { reference },
    include: { donateur: true },
  });
  if (!don) return NextResponse.json({ error: "Don non trouvé" }, { status: 404 });

  const pdf = await genererFicheReceptionDon({
    donateur: {
      nomRaisonSociale: [don.donateur.prenom, don.donateur.nom].filter(Boolean).join(" ") || undefined,
      representant: don.donateur.organisme || undefined,
      adresse: don.localisation || undefined,
      telephone: don.donateur.telephone,
      email: don.donateur.email,
    },
    nature: NATURE_MAP[don.nature] || "AUTRES",
    natureAutresDetail: don.nature === "AUTRE" ? don.natureAutre || undefined : undefined,
    description: don.description,
    objectif: don.objectif,
    objectifAutresDetail: don.objectif === "AUTRES" ? don.objectifAutre || undefined : undefined,
    responsable: don.responsable || undefined,
    dateReception: don.createdAt.toLocaleDateString("fr-FR"),
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="fiche-${don.reference}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
