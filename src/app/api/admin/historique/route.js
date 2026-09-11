import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Non autorisé." }, { status: 401 }); }
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page") || 1));
  const filtre = params.get("filtre") || "tous";
  const where = filtre === "mails" ? { type: "MAIL" } : filtre === "actions" ? { type: "ACTION" } : filtre === "echecs" ? { type: "MAIL", statut: "ECHEC" } : {};
  const [items, total] = await Promise.all([
    prisma.historique.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 20, take: 20 }),
    prisma.historique.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / 20)) });
}
