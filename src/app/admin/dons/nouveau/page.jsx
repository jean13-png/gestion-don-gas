import Link from "next/link";
import { getAdminActuel, aPermission } from "@/lib/auth";
import AccesRefuse from "@/components/admin/AccesRefuse";
import CreateDonationForm from "./CreateDonationForm";

export const dynamic = "force-dynamic";

export default async function NewAdminDonationPage() {
  const admin = await getAdminActuel();

  if (!admin || !aPermission(admin, "dons.creer")) {
    return <AccesRefuse quoi="l'enregistrement de nouveaux dons" />;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-ong-bleu">Créer un don</h1>
          <p className="mt-1 text-[13px] text-ong-muted">
            Enregistrer directement un don reçu : photos, preuves et attestation générée dès la création, sans étapes de vérification.
          </p>
        </div>
        <Link href="/admin/dons" className="text-[13px] font-medium text-ong-bleu hover:underline">
          Retour aux dons
        </Link>
      </div>
      <CreateDonationForm />
    </div>
  );
}
