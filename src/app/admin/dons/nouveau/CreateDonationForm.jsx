"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { creerDonAdmin } from "@/app/actions/admin";

const initialState = { error: "", success: false };

const PHOTOS_MAX = 10;
const PHOTO_TAILLE_MAX = 5 * 1024 * 1024;
const PHOTOS_TYPES_VALIDES = ["image/jpeg", "image/png", "image/webp"];

export default function CreateDonationForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(creerDonAdmin, initialState);
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState("");
  const [aujourdhui, setAujourdhui] = useState("");
  const photoInputRef = useRef(null);
  const photosRef = useRef([]);

  useEffect(() => {
    setAujourdhui(new Date().toISOString().split("T")[0]);
  }, []);

  // Libere les apercus quand le composant disparait.
  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (!state?.success) return;

    if (state.attestationError) {
      Swal.fire({
        title: "Don créé, attestation à générer",
        text: state.attestationError,
        icon: "warning",
        confirmButtonColor: "#4278E1",
        confirmButtonText: "Ouvrir le dossier",
      }).then(() => router.push(`/admin/dons/${state.donId}`));
      return;
    }

    Swal.fire({
      title: "Don créé",
      html: `La référence <strong>${state.reference}</strong> a été enregistrée et son attestation a été générée.<br/>Vous allez ouvrir le dossier du don : téléchargez-la ou envoyez-la par mail au donateur.`,
      icon: "success",
      confirmButtonColor: "#4278E1",
      confirmButtonText: "OK",
    }).then(() => router.push(`/admin/dons/${state.donId}`));
  }, [router, state]);

  function synchroniserInput(nouvelleListe) {
    setPhotos(nouvelleListe);
    photosRef.current = nouvelleListe;
    if (photoInputRef.current) {
      const transfert = new DataTransfer();
      nouvelleListe.forEach((photo) => transfert.items.add(photo.file));
      photoInputRef.current.files = transfert.files;
    }
  }

  function ajouterPhotos(event) {
    const fichiers = Array.from(event.target.files || []);
    // Reinitialiser la valeur AVANT de reconstituer la liste : sinon
    // l'assignation value="" effacerait les fichiers que l'on vient de poser.
    event.target.value = "";
    if (!fichiers.length) return;
    setPhotoError("");

    const nouvelles = [];
    for (const fichier of fichiers) {
      if (photos.length + nouvelles.length >= PHOTOS_MAX) {
        setPhotoError(`Limite de ${PHOTOS_MAX} photos atteinte.`);
        break;
      }
      if (!PHOTOS_TYPES_VALIDES.includes(fichier.type)) {
        setPhotoError(`« ${fichier.name} » n'est pas au format JPG, PNG ou WEBP.`);
        continue;
      }
      if (fichier.size > PHOTO_TAILLE_MAX) {
        setPhotoError(`« ${fichier.name} » dépasse 5 Mo.`);
        continue;
      }
      nouvelles.push({
        id: `${fichier.name}-${fichier.size}-${Date.now()}-${Math.random()}`,
        file: fichier,
        previewUrl: URL.createObjectURL(fichier),
      });
    }

    if (nouvelles.length) {
      synchroniserInput([...photos, ...nouvelles]);
    }
  }

  function retirerPhoto(id) {
    const photo = photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.previewUrl);
    synchroniserInput(photos.filter((p) => p.id !== id));
    setPhotoError("");
  }

  const inputClass = "mt-1 w-full h-11 rounded-md border border-ong-bordure bg-white px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-ong-bleu";

  return (
    <form action={formAction} className="mt-6 space-y-6" encType="multipart/form-data">
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
              <optgroup label="Matériel informatique & pédagogique">
                <option value="MATERIEL_INFORMATIQUE">Matériel informatique</option>
                <option value="EQUIPEMENT_PEDAGOGIQUE">Équipement pédagogique</option>
                <option value="ORDINATEURS">Des ordinateurs</option>
                <option value="IMPRIMANTES">Des imprimantes</option>
              </optgroup>

              <optgroup label="Vêtements & vivres">
                <option value="DES_HABITS">Des habits</option>
                <option value="DES_VIVRES">Des vivres</option>
              </optgroup>

              <optgroup label="Mobilier & équipements">
                <option value="MOBILIER">Du mobilier (tables, chaises, tableaux, bancs…)</option>
                <option value="MATELAS">Des matelas</option>
                <option value="FAUTEUILS_MEDICAUX">Des fauteuils médicaux</option>
                <option value="BEQUILLES">Des béquilles</option>
                <option value="JOUETS">Des jouets</option>
                <option value="LIVRES">Des livres</option>
                <option value="MACHINES_A_COUDRE">Des machines à coudre</option>
              </optgroup>

              <optgroup label="Véhicules & transport">
                <option value="VEHICULES">Des véhicules</option>
                <option value="BUS_TRANSPORT">Un bus de transport en commun</option>
              </optgroup>

              <optgroup label="Biens immobiliers">
                <option value="APPARTEMENT">Un appartement</option>
                <option value="MAISON">Une maison</option>
              </optgroup>

              <optgroup label="Autres">
                <option value="DON_FINANCIER">Don financier</option>
                <option value="AUTRE">Autre</option>
              </optgroup>
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

      <div>
        <h2 className="text-[16px] font-semibold text-ong-bleu">Attestation de don</h2>
        <p className="mt-1 text-[12px] text-ong-muted">
          Ces informations servent à générer l&apos;attestation dès la création du don.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-[13px]">Date de réception du don
            <input name="dateReception" type="date" required defaultValue={aujourdhui} max={aujourdhui || undefined} className={inputClass} />
          </label>
          <label className="text-[13px]">Fait à (lieu)<input name="faitA" defaultValue="Abomey-Calavi" maxLength={180} className={inputClass} /></label>
          <label className="text-[13px] sm:col-span-2">Responsable<input name="responsable" defaultValue="HEDJE ZINSOU RAOUL" maxLength={180} className={inputClass} /></label>
          <label className="text-[13px] sm:col-span-2">Ce à quoi le don a servi
            <textarea name="aQuoiServi" rows={3} maxLength={2000} placeholder="Ex : les habits ont été distribués aux enfants orphelins de l'école d'Akpakpa..." className="mt-1 w-full rounded-md border border-ong-bordure px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-ong-bleu" />
          </label>
        </div>
      </div>

      <div>
        <h2 className="text-[16px] font-semibold text-ong-bleu">Photos et preuves</h2>
        <p className="mt-1 text-[12px] text-ong-muted">
            JPG, PNG ou WEBP — 5 Mo maximum par photo, {PHOTOS_MAX} photos maximum. Elles seront jointes à l&apos;attestation.
        </p>
        <div className="mt-4">
          <input
            ref={photoInputRef}
            name="photos"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={ajouterPhotos}
            disabled={pending}
            className="block w-full text-[13px] border p-2 rounded-lg border-slate-400 cursor-pointer text-ong-texte disabled:opacity-50"
          />
          {photoError && <p className="mt-2 text-[13px] text-red-700">{photoError}</p>}
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-video bg-ong-fond rounded-md border border-ong-bordure overflow-hidden">
                  <img src={photo.previewUrl} alt={photo.file.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => retirerPhoto(photo.id)}
                    disabled={pending}
                    aria-label={`Retirer ${photo.file.name}`}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/95 text-red-700 border border-red-200 shadow-sm text-xl leading-none disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => router.push("/admin/dons")} className="h-11 rounded-md border border-ong-bordure px-5 text-[14px] text-ong-texte">Annuler</button>
        <button type="submit" disabled={pending} className="h-11 rounded-md bg-ong-bleu px-5 text-[14px] font-medium text-white hover:bg-ong-bleu-fonce disabled:opacity-60">{pending ? "Création du don..." : "Créer le don et générer l'attestation"}</button>
      </div>
    </form>
  );
}
