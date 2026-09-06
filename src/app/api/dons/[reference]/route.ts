import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { reference } = params;

    const don = await prisma.don.findUnique({
      where: { reference },
      include: { donateur: true },
    });

    if (!don) {
      return NextResponse.json({ error: "Don non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      reference: don.reference,
      nature: don.nature,
      natureAutre: don.natureAutre,
      description: don.description,
      localisation: don.localisation,
      statut: don.statut,
      donateur: {
        nom: don.donateur.nom,
        prenom: don.donateur.prenom,
        email: don.donateur.email,
        telephone: don.donateur.telephone,
        organisme: don.donateur.organisme,
      },
      createdAt: don.createdAt,
    });
  } catch (error) {
    console.error("[API /api/dons/[reference]] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
