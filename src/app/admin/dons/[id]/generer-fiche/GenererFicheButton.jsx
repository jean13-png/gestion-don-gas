'use client';
import { useState } from "react";
import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { startTransition } from "react";

export default function GenererFicheButton({ don, formAction }) {
  const [pending, setPending] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasPhotos = don.photos && don.photos.length > 0;
  const isGeneratedOrValidated = don.statut === "FICHE_GENEREE" || don.statut === "VALIDE";

  useEffect(() => {
    if (searchParams.get("generated") !== "1") return;

    Swal.fire({
      title: "Fiche générée",
      text: "La fiche de don a été générée avec succès.",
      icon: "success",
      confirmButtonColor: "#4278E1",
      confirmButtonText: "OK",
    });
    router.replace(pathname);
  }, [pathname, router, searchParams]);

  const handleClick = async () => {
    if (isGeneratedOrValidated || pending) return;

    if (!hasPhotos) {
      const confirmed = await Swal.fire({
        title: "Aucune preuve photo",
        text: "Les photos/preuves n'ont pas été importées. Souhaitez-vous vraiment générer la fiche de don sans photos ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4278E1",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, générer sans photos",
        cancelButtonText: "Annuler",
      });

      if (!confirmed.isConfirmed) {
        return;
      }
    }

    setPending(true);
    const formData = new FormData();
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || isGeneratedOrValidated}
      className="h-11 px-5 disabled:cursor-not-allowed disabled:bg-gray-600 rounded-md uppercase bg-ong-bleu text-white text-[14px] font-medium cursor-pointer hover:bg-ong-bleu-fonce"
    >
      {pending ? "Génération en cours..." : isGeneratedOrValidated ? "FICHE GÉNÉRÉE" : "Générer la fiche de don"}
    </button>
  );
}
