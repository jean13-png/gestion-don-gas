import { getAdminActuel, aPermission } from "@/lib/auth";
import AccesRefuse from "@/components/admin/AccesRefuse";
import { getExpediteur } from "@/lib/mail";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const admin = await getAdminActuel();

  if (!admin || !aPermission(admin, "contenu.gerer")) {
    return <AccesRefuse quoi="aux paramètres" />;
  }
  return <SettingsForm initial={await getExpediteur()} />;
}
