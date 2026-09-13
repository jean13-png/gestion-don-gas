'use client'
import { ProgrammerDonnateur } from "@/app/actions/donations";
import { useActionState } from "react";
import Swal from "sweetalert2";

export default function ProgrammerDonateurPage({ donId, initialDate = "", mode = "new" }) {
  const [state, formAction, isPending] = useActionState(ProgrammerDonnateur, null);

  const validateDate = (dateValue) => {
    if (!dateValue) {
      return "Veuillez sélectionner une date.";
    }

    const selected = new Date(`${dateValue}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(selected.getTime())) {
      return "Date invalide.";
    }

    if (selected <= today) {
      return "La date programmée doit être strictement ultérieure à aujourd'hui.";
    }

    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const dateValue = formData.get("dateProgrammee")?.toString() || "";
    const validationError = validateDate(dateValue);

    if (validationError) {
      Swal.fire({
        title: "Date invalide",
        text: validationError,
        icon: "error",
        confirmButtonColor: "#4278E1",
      });
      return;
    }

    const confirmTitle = mode === "edit" ? "Modifier la programmation" : "Programmer ce donateur";
    const confirmText = mode === "edit"
      ? "Voulez-vous enregistrer cette nouvelle date de rendez-vous et envoyer le mail de confirmation au donateur ?"
      : "Voulez-vous programmer ce donateur pour cette date et envoyer le mail de confirmation ?";

    const result = await Swal.fire({
      title: confirmTitle,
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: mode === "edit" ? "Oui, modifier" : "Oui, programmer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#4278E1",
    });

    if (result.isConfirmed) {
      formAction(formData);
    }
  };

  return (
    <div className="mt-6 bg-white border border-ong-bordure rounded-lg p-6">
      <h2 className="font-display font-semibold text-blue-700 text-[16px] mb-4">
        {mode === "edit" ? "Modifier la programmation" : "Programmer le donateur"}
      </h2>
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="dateReception"
          className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5"
        >
          Date
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input type="hidden" value={donId} name="donId" />
          <input
            required
            id="dateProgrammee"
            name="dateProgrammee"
            type="date"
            defaultValue={initialDate}
            min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
            className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex disabled:bg-slate-500 items-center cursor-pointer gap-2 px-4 py-2.5 rounded-md bg-ong-bleu text-white text-[13px] font-medium hover:bg-ong-bleu-fonce transition-colors"
          >
            {isPending ? (mode === "edit" ? "Modification..." : "Programmation...") : (mode === "edit" ? "Modifier" : "Programmer")}
          </button>
        </div>
        {state?.error && <p className="mt-3 text-red-600">{state.error}</p>}
        {state?.success && <p className="mt-3 text-green-600">{state.success}</p>}
      </form>
    </div>
  );
}
