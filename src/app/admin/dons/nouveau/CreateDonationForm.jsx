"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { creerDonAdmin } from "@/app/actions/admin";

const initialState = { error: "", success: false };

export default function CreateDonationForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(creerDonAdmin, initialState);

  useEffect(() => {
    if (!state?.success) return;
    Swal.fire({
      title: "Don enregistré",
      text: `La référence ${state.reference} a été créée. Les mails ont été traités et le PDF joint à l'accusé.`,
      icon: "success",
      confirmButtonColor: "#4278E1",
    }).then(() => router.push(`/admin/dons/${state.donId}`));
  }, [router, state]);

  const inputClass = "mt-1 w-full h-11 rounded-md border border-ong-bordure bg-white px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-ong-bleu";

  return (
    <form action={formAction} className="mt-6 space-y-6 rounded-lg border border-ong-bordure bg-white p-6">
      {state?.error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">{state.error}</p>}
      <div>
        <h2 className="text-[16px] font-semibold text-ong-bleu">Informations du donateur</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-[13px]">Prénom<input name="prenom" required maxLength={120} className={inputClass} /></label>
          <label className="text-[13px]">Nom<input name="nom" required maxLength={120} className={inputClass} /></label>
          <label className="text-[13px]">E-mail<input name="email" type="email" required maxLength={254} className={inputClass} /></label>
          <label className="text-[13px]">Téléphone<input name="telephone" required minLength={8} maxLength={30} className={inputClass} /></label>
          <label className="text-[13px] sm:col-span-2">Organisme (facultatif)<input name="organisme" maxLength={180} className={inputClass} /></label>
        </div>
      </div>
      <div>
        <h2 className="text-[16px] font-semibold text-ong-bleu">Détails du don</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-[13px]">Nature
            <select name="nature" required className={inputClass}>
              <option value="">Sélectionner</option>
              <option value="MATERIEL_INFORMATIQUE">Matériel informatique</option>
              <option value="EQUIPEMENT_PEDAGOGIQUE">Équipement pédagogique</option>
              <option value="DON_FINANCIER">Don financier</option>
              <option value="DES_HABITS">Des habits</option>
              <option value="DES_VIVRES">Des vivres</option>
              <option value="MACHINES_A_COUDRE">Des machines à coudre</option>
              <option value="VEHICULES">Des véhicules</option>
              <option value="BUS_TRANSPORT">Un bus de transport en commun</option>
              <option value="ORDINATEURS">Des ordinateurs</option>
              <option value="MOBILIER">Du mobilier (tables, chaises, tableaux, bancs…)</option>
              <option value="JOUETS">Des jouets</option>
              <option value="LIVRES">Des livres</option>
              <option value="FAUTEUILS_MEDICAUX">Des fauteuils médicaux</option>
              <option value="BEQUILLES">Des béquilles</option>
              <option value="APPARTEMENT">Un appartement</option>
              <option value="MAISON">Une maison</option>
              <option value="MATELAS">Des matelas</option>
              <option value="IMPRIMANTES">Des imprimantes</option>
              <option value="AUTRE">Autre</option>
            </select>
          </label>
          <label className="text-[13px]">Objectif
            <select name="objectif" required className={inputClass}>
              <option value="">Sélectionner</option><option value="EDUCATION">Éducation</option><option value="AIDE_SOCIALE">Aide sociale</option><option value="FORMATION">Formation</option><option value="AUTRES">Autres</option>
            </select>
          </label>
          <label className="text-[13px]">Précision nature (si autre)<input name="natureAutre" maxLength={180} className={inputClass} /></label>
          <label className="text-[13px]">Précision objectif (si autres)<input name="objectifAutre" maxLength={180} className={inputClass} /></label>
          <label className="text-[13px]">Pays<input name="pays" required maxLength={120} className={inputClass} /></label>
          <label className="text-[13px]">Ville<input name="ville" required maxLength={120} className={inputClass} /></label>
          <label className="text-[13px] sm:col-span-2">Quartier / village<input name="quartierVillage" required maxLength={180} className={inputClass} /></label>
          <label className="text-[13px] sm:col-span-2">Détail / lieu de dépôt ou d'enlèvement<input name="localisation" maxLength={240} className={inputClass} /></label>
          <label className="text-[13px] sm:col-span-2">Description<textarea name="description" required minLength={10} maxLength={5000} rows={5} className="mt-1 w-full rounded-md border border-ong-bordure px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-ong-bleu" /></label>
        </div>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => router.push("/admin/dons")} className="h-11 rounded-md border border-ong-bordure px-5 text-[14px] text-ong-texte">Annuler</button>
        <button type="submit" disabled={pending} className="h-11 rounded-md bg-ong-bleu px-5 text-[14px] font-medium text-white hover:bg-ong-bleu-fonce disabled:opacity-60">{pending ? "Enregistrement..." : "Enregistrer le don"}</button>
      </div>
    </form>
  );
}
