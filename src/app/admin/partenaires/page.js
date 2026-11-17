import prisma from "@/lib/prisma";
import { getAdminActuel, aPermission } from "@/lib/auth";
import AccesRefuse from "@/components/admin/AccesRefuse";
import PartnerManager from "./PartnerManager";

export const dynamic = "force-dynamic";

export default async function AdminPartenairesPage() {
  const admin = await getAdminActuel();

  if (!admin || !aPermission(admin, "contenu.gerer")) {
    return <AccesRefuse quoi="la gestion des partenaires" />;
  }
  const partenaires = await prisma.partenaire.findMany({ orderBy: [{ ordre: "asc" }, { createdAt: "asc" }] });
  return <PartnerManager initialPartenaires={partenaires} />;
}
