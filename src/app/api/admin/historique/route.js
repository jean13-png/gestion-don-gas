import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé." }, { status: 401 }); }
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page") || 1));
  const filtre = params.get("filtre") || "tous";
  const where = buildWhere({
    filtre,
    statut: params.get("statut"),
    type: params.get("type"),
    dateDebut: params.get("dateDebut"),
    dateFin: params.get("dateFin"),
  });
  const [items, total] = await Promise.all([
    prisma.historique.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 20, take: 20 }),
    prisma.historique.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / 20)) });
}

function buildWhere({ filtre, statut, type, dateDebut, dateFin }) {
  const where = {};
  if (filtre === "mails") where.type = "MAIL";
  if (filtre === "actions") where.type = "ACTION";
  if (filtre === "echecs") {
    where.type = "MAIL";
    where.statut = "ECHEC";
  }
  if (type === "MAIL" || type === "ACTION") where.type = type;
  if (["ENVOYE", "ECHEC", "OK"].includes(statut)) where.statut = statut;
  if (dateDebut || dateFin) {
    where.createdAt = {};
    if (dateDebut) where.createdAt.gte = new Date(`${dateDebut}T00:00:00.000Z`);
    if (dateFin) {
      const end = new Date(`${dateFin}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      where.createdAt.lt = end;
    }
  }
  return where;
}

export async function DELETE(request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé." }, { status: 401 }); }
  const body = await request.json().catch(() => ({}));
  const where = buildWhere(body);
  const result = await prisma.historique.deleteMany({ where });
  return NextResponse.json({ deleted: result.count });
}
