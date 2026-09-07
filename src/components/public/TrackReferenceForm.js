"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

export default function TrackReferenceForm() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const value = reference.trim().toUpperCase();
    if (!/^GAS-\d{4}-[A-Z0-9]{5}$/.test(value)) {
      setError("Format attendu : GAS-2026-XXXXX");
      return;
    }
    setError("");
    router.push(`/suivi?reference=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
      <div>
        <label
          htmlFor="reference"
          className="block text-[12px] font-medium text-[var(--color-ong-texte-secondaire)] uppercase tracking-wider mb-1.5"
        >
          Référence de suivi
        </label>
        <input
          id="reference"
          name="reference"
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder="GAS-2026-XXXXX"
          value={reference}
          onChange={(e) => {
            setReference(e.target.value);
            if (error) setError("");
          }}
          className={`w-full h-11 px-3 rounded-md border bg-white text-[15px] tracking-wider placeholder:text-[var(--color-ong-texte-secondaire)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--color-ong-bleu)]/30 ${
            error ? "border-red-400" : "border-[var(--color-ong-ligne)] focus:border-[var(--color-ong-bleu)]"
          }`}
        />
        {error ? (
          <p className="mt-1.5 text-[12px] text-red-600 flex items-center gap-1.5">
            <Icon name="circle-exclamation" className="text-[12px]" />
            {error}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-[var(--color-ong-bleu)] text-white text-[14px] font-medium hover:brightness-95 transition"
      >
        <Icon name="magnifying-glass" />
        Consulter le statut
      </button>
    </form>
  );
}
