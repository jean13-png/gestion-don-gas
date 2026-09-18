import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import ActionManager from "./ActionManager";

export const dynamic = "force-dynamic";

export default async function AdminActionsPage() {
  await requireAdmin();
  const actions = await prisma.actionAccueil.findMany({
    orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
  });

  return <ActionManager initialActions={actions} />;
}
