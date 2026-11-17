"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function EnvoyerAttestationButton({ formAction, email }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;

    const confirmed = await Swal.fire({
      title: "Envoyer l'attestation par mail ?",
      html: `L'attestation PDF sera envoyée en pièce jointe à <strong>${email}</strong>.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4278E1",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, envoyer",
      cancelButtonText: "Annuler",
    });

    if (!confirmed.isConfirmed) return;

    setPending(true);
    const formData = new FormData();
    try {
      const result = await formAction(formData);
      if (result?.success) {
        await Swal.fire({
          title: "Attestation envoyée",
          text: `L'attestation a été envoyée par mail à ${email}.`,
          icon: "success",
          confirmButtonColor: "#4278E1",
          confirmButtonText: "OK",
        });
      } else {
        throw new Error(result?.error || "L'envoi a échoué pour une raison inconnue.");
      }
    } catch (envoiError) {
      console.error("[attestation] Envoi échoué:", envoiError);
      await Swal.fire({
        title: "Envoi impossible",
        text: envoiError?.message || "Nous n'avons pas pu envoyer le mail. Veuillez réessayer.",
        icon: "error",
        confirmButtonColor: "#4278E1",
        confirmButtonText: "Fermer",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-2 h-11 px-5 rounded-md uppercase border border-ong-bleu bg-white text-ong-bleu text-[14px] font-medium cursor-pointer hover:bg-ong-bleu-tres-clair transition-colors disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Envoi en cours..." : "📧 Envoyer au donateur par mail"}
    </button>
  );
}
