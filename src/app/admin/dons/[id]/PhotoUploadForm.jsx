"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function PhotoUploadForm({ action, existingCount }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (existingCount >= 4) {
      setError("Limite de 4 photos atteinte.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.set("photo", file);
      const result = await action(formData);
      if (!result?.success) {
        throw new Error(result?.error || "Impossible d’ajouter la photo.");
      }

      router.refresh();
    } catch (uploadError) {
      setError(uploadError.message || "Impossible d’ajouter la photo.");
    } finally {
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="photo-upload" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
          Sélectionner une photo (JPG/PNG/WEBP, max 5 MB)
        </label>
        <input
          ref={inputRef}
          id="photo-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          disabled={isUploading}
          className="block w-full text-[13px] border p-2 rounded-lg border-slate-400 cursor-pointer text-ong-texte disabled:opacity-50"
        />
      </div>

      {preview && (
        <div className="relative aspect-video max-w-sm rounded-md border border-ong-bordure overflow-hidden bg-ong-fond">
          <img src={preview} alt="Aperçu de la photo sélectionnée" className="w-full h-full object-cover" />
          {isUploading && (
            <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-[12px] text-white">
              Ajout de la photo en cours...
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[13px] text-red-700">{error}</p>}
      <p className="text-[12px] text-ong-muted">
        La photo est ajoutée automatiquement après sa sélection. Vous pourrez ensuite en sélectionner une autre.
      </p>
    </div>
  );
}
