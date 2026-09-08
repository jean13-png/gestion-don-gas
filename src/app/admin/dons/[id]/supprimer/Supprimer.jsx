'use client';
import { supprimerDon } from "@/app/actions/donations";
import { useActionState } from "react";
import Swal from "sweetalert2";
import { startTransition } from "react";

export default function Supprimer({ id }) {
  const [state, formAction, isPending] = useActionState(supprimerDon, null);

  const handleClick = async (e) => {
    const confirmed = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (confirmed.isConfirmed) {
      const formData = new FormData(e.target.closest("form"));
      startTransition(() => {
        formAction(formData);
      });
    }
  };

  return (
    <div>
      <form>
        <input type="hidden" name="donId" value={id} />
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          className="h-11 px-5 rounded-md bg-red-500 text-white text-[14px] font-medium cursor-pointer hover:bg-red-700"
        >
            {isPending ? "Suppression en cours..." : "Supprimer le don"}
        </button>
      </form>
    </div>
  );
}
