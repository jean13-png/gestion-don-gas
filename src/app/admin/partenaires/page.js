import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import PartnerManager from "./PartnerManager";

export const dynamic = "force-dynamic";

export default async function AdminPartenairesPage() {
  await requireAdmin();
  const partenaires = await prisma.partenaire.findMany({ orderBy: [{ ordre: "asc" }, { createdAt: "asc" }] });
  return <PartnerManager initialPartenaires={partenaires} />;
}
