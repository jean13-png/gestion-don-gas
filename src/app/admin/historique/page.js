import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import HistoryTable from "./HistoryTable";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  await requireAdmin();
  const items = await prisma.historique.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  const total = await prisma.historique.count();
  return <HistoryTable initial={{ items, total, page: 1, totalPages: Math.max(1, Math.ceil(total / 20)) }} />;
}
