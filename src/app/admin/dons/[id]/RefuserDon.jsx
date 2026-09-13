"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function RefuserDon({ formAction }) {
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const reason = form.elements.namedItem("observations")?.value.trim();

    if (!reason || reason.length < 10) {
      await Swal.fire({
        title: "Motif obligatoire",
        text: "Indiquez un motif de refus d'au moins 10 caractères.",
        icon: "warning",
        confirmButtonColor: "#4278E1",
      });
      return;
    }

    const confirmation = await Swal.fire({
      title: "Refuser ce don ?",
      text: "Cette action changera le statut du don et notifiera l'équipe administrative.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, refuser le don",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!confirmation.isConfirmed) return;

    setPending(true);
    try {
      await formAction(new FormData(form));
      await Swal.fire({
        title: "Don refusé",
        text: "Le refus a été enregistré et journalisé.",
        icon: "success",
        confirmButtonColor: "#4278E1",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-md border border-red-100 bg-red-50/50 p-4">
      <input type="hidden" name="nextStatus" value="REJETE" />
      <label
        htmlFor="motif-refus"
        className="block text-[12px] font-medium uppercase tracking-wider text-red-800"
      >
        Motif du refus
      </label>
      <textarea
        id="motif-refus"
        name="observations"
        minLength={10}
        maxLength={1000}
        required
        rows={3}
        placeholder="Expliquez brièvement pourquoi ce don est refusé..."
        className="mt-2 w-full rounded-md border border-red-200 bg-white px-3 py-2.5 text-[14px] text-ong-texte focus:outline-none focus:ring-2 focus:ring-red-300"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-3 h-10 rounded-md bg-red-600 px-4 text-[13px] font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Refus en cours..." : "Refuser le don"}
      </button>
    </form>
  );
}
