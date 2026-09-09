import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

async function getClientIp(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

export async function GET(request, { params }) {
  try {
    const { reference } = await params;
    const allowed = await checkRateLimit(`tracking:${await getClientIp(request)}`, 15 * 60 * 1000, 30);

    if (!allowed) {
      return NextResponse.json({ error: "Trop de demandes. Réessayez plus tard." }, { status: 429 });
    }

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
      },
      createdAt: don.createdAt,
    });
  } catch (error) {
    console.error("[API /api/dons/[reference]] Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
