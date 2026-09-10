"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function PhotoUploadForm({ action, existingCount }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [selected, setSelected] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => selected.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [selected]);

  function handleChange(event) {
    const files = Array.from(event.target.files || []);
    const available = Math.max(0, 4 - existingCount);
    const nextFiles = files.slice(0, available);

    if (files.length > available) {
      setError(`Vous pouvez encore ajouter ${available} photo(s).`);
    } else {
      setError("");
    }

    setSelected(nextFiles.map((file) => ({ file, url: URL.createObjectURL(file) })));
  }

  function removeSelected(index) {
    setSelected((files) => {
      const removed = files[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return files.filter((_, fileIndex) => fileIndex !== index);
    });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selected.length) {
      setError("Sélectionnez au moins une photo.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      for (const { file } of selected) {
        const formData = new FormData();
        formData.set("photo", file);
        const result = await action(formData);
        if (!result?.success) {
          throw new Error(result?.error || "Impossible d’ajouter la photo.");
        }
      }

      setSelected([]);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      router.refresh();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="photo-upload" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
          Téléverser une photo (JPG/PNG/WEBP, max 5 MB)
        </label>
        <input
          ref={inputRef}
          id="photo-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleChange}
          className="block w-full text-[13px] border p-2 rounded-lg border-slate-400 cursor-pointer text-ong-texte"
        />
      </div>

      {selected.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {selected.map(({ file, url }, index) => (
            <div key={`${file.name}-${file.lastModified}`} className="relative aspect-video rounded-md border border-ong-bordure overflow-hidden bg-ong-fond">
              <img src={url} alt={`Aperçu ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeSelected(index)}
                aria-label={`Supprimer la photo sélectionnée ${index + 1}`}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white text-red-700 border border-red-200 shadow-sm text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-[13px] text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || selected.length === 0}
        className="h-10 px-4 rounded-md border border-ong-bleu text-ong-bleu text-[14px] cursor-pointer font-medium hover:bg-ong-fond disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Ajout en cours..." : "Ajouter les photos"}
      </button>
    </form>
  );
}
