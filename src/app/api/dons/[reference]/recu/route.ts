import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { genererRecuDonPdf } from "@/lib/recap-don-pdf";

export async function GET(request: Request, { params }: { params: Promise<{ reference: string }> }) {
  try {
    const { reference } = await params;
    const don = await prisma.don.findUnique({
      where: { reference },
      include: { donateur: true },
    });

    if (!don) {
      return NextResponse.json({ error: "Don non trouvé" }, { status: 404 });
    }

    const pdf = await genererRecuDonPdf({
      reference: don.reference,
      statut: don.statut,
      donateur: { prenom: don.donateur?.prenom, nom: don.donateur?.nom },
      nature: don.nature === "AUTRE" && don.natureAutre ? don.natureAutre : don.nature,
      description: don.description,
      localisation: don.localisation,
      createdAt: don.createdAt,
    });

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recu-don-${reference}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[API /api/dons/[reference]/recu] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
