import prisma from "@/lib/prisma";
import { getAdminActuel, aPermission } from "@/lib/auth";
import AccesRefuse from "@/components/admin/AccesRefuse";
import ActionManager from "./ActionManager";

export const dynamic = "force-dynamic";

export default async function AdminActionsPage() {
  const admin = await getAdminActuel();

  if (!admin || !aPermission(admin, "contenu.gerer")) {
    return <AccesRefuse quoi="la gestion des actions" />;
  }
  const actions = await prisma.actionAccueil.findMany({
    orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
  });

  return <ActionManager initialActions={actions} />;
}
