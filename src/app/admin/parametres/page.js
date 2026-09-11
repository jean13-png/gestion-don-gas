import { requireAdmin } from "@/lib/auth";
import { getExpediteur } from "@/lib/mail";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  return <SettingsForm initial={await getExpediteur()} />;
}
