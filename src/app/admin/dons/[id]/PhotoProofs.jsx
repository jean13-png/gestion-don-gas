"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export default function PhotoProofs({ photos, deleteAction }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(photoId) {
    const confirmed = await Swal.fire({
      title: "Supprimer cette photo ?",
      text: "La photo sera retirée des preuves et du stockage.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!confirmed.isConfirmed) return;

    setDeletingId(photoId);
    const formData = new FormData();
    formData.set("photoId", photoId);

    try {
      const result = await deleteAction(formData);
      if (!result?.success) throw new Error(result?.error || "Suppression impossible.");
      await Swal.fire({
        title: "Photo supprimée",
        text: "La photo a été retirée des preuves.",
        icon: "success",
        confirmButtonColor: "#4278E1",
      });
      router.refresh();
    } catch (error) {
      await Swal.fire({
        title: "Suppression impossible",
        text: error.message || "Veuillez réessayer.",
        icon: "error",
        confirmButtonColor: "#4278E1",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((photo) => (
        <div key={photo.id} className="relative aspect-video bg-ong-fond rounded-md border border-ong-bordure overflow-hidden">
          <img src={photo.url} alt={`Photo ${photo.id}`} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => handleDelete(photo.id)}
            disabled={deletingId === photo.id}
            aria-label="Supprimer cette photo"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/95 text-red-700 border border-red-200 shadow-sm text-xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
