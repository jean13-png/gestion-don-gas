import prisma from "@/lib/prisma";
import { getAdminActuel, aPermission, PERMISSIONS } from "@/lib/auth";
import AccesRefuse from "@/components/admin/AccesRefuse";
import ComptesManager from "./ComptesManager";

export const dynamic = "force-dynamic";

export const metadata = { title: "Comptes — Administration ONG-GAS" };

export default async function AdminComptesPage() {
  const admin = await getAdminActuel();

  if (!admin || !aPermission(admin, "comptes.gerer")) {
    return <AccesRefuse quoi="la gestion des comptes" />;
  }

  const comptes = await prisma.admin.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      nom: true,
      email: true,
      actif: true,
      permissions: true,
      createdAt: true,
    },
  });

  return (
    <ComptesManager
      comptes={comptes.map((compte) => ({
        ...compte,
        createdAt: compte.createdAt.toISOString(),
      }))}
      monId={admin.id}
      catalogue={PERMISSIONS.map((p) => ({ ...p }))}
    />
  );
}
