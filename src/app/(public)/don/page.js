"use client";

import { useState } from "react";
import { useActionState } from "react";
import { soumettreDon } from "@/app/actions/donations";
import Icon from "@/components/ui/Icon";

export default function DonPage() {
  const [nature, setNature] = useState("");
  const [state, formaAction, isPending] = useActionState(soumettreDon, null)

  return (
    <section className="bg-ong-fond py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">
          Soumettre un don
        </h1>
        <p className="mt-3 text-[16px] text-ong-texte">
          Remplissez le formulaire ci-dessous. Une référence unique vous sera
          transmise par e-mail.
        </p>

        <form action={formaAction} className="mt-10 space-y-8">
          <fieldset className="border border-ong-bordure rounded-lg bg-white p-6">
            <legend className="px-2 font-display font-semibold text-ong-bleu text-[15px]">
              Vos coordonnées
            </legend>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prenom" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                  Prénom
                </label>
                <input id="prenom" name="prenom" type="text" required className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
              </div>
              <div>
                <label htmlFor="nom" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                  Nom
                </label>
                <input id="nom" name="nom" type="text" required className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="organisme" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                  Organisme / Entreprise <span className="text-ong-muted">(optionnel)</span>
                </label>
                <input id="organisme" name="organisme" type="text" className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
              </div>
              <div>
                <label htmlFor="email" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input id="email" name="email" type="email" required className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
              </div>
              <div>
                <label htmlFor="telephone" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                  Téléphone
                </label>
                <input id="telephone" name="telephone" type="tel" required className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
              </div>
            </div>
          </fieldset>

          <fieldset className="border border-ong-bordure rounded-lg bg-white p-6">
            <legend className="px-2 font-display font-semibold text-ong-bleu text-[15px]">
              Votre don
            </legend>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="nature" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                  Nature du don
                </label>
                <select
                  id="nature"
                  name="nature"
                  required
                  value={nature}
                  onChange={(e) => setNature(e.target.value)}
                  className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert"
                >
                  <option value="">Sélectionner...</option>
                  <option value="MATERIEL_INFORMATIQUE">Matériel informatique</option>
                  <option value="EQUIPEMENT_PEDAGOGIQUE">Équipement pédagogique</option>
                  <option value="DON_FINANCIER">Don financier</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>

              {nature === "AUTRE" && (
                <div>
                  <label htmlFor="natureAutre" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                    Préciser la nature du don
                  </label>
                  <input
                    id="natureAutre"
                    name="natureAutre"
                    type="text"
                    required
                    className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert"
                    placeholder="Ex : mobilier, accompagnement logistique..."
                  />
                </div>
              )}

              <div>
                <label htmlFor="description" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea id="description" name="description" rows={4} required className="w-full px-3 py-2.5 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
              </div>
              <div>
                <label htmlFor="localisation" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                  Localisation d&apos;enlèvement / dépôt
                </label>
                <input id="localisation" name="localisation" type="text" required className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
              </div>
            </div>
          </fieldset>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-md">
              {state.error}
            </div>
          )}

          <button
          disabled={isPending}
            type="submit"
            className="cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed w-full inline-flex items-center justify-center gap-2 h-12 px-5 rounded-md bg-ong-bleu text-white text-[15px] font-medium hover:bg-ong-bleu-fonce transition-colors"
          >
            <Icon name="paper-plane" />
            {isPending ? "En cours d'envoie..." : "Soumettre ma demande"}
          </button>
        </form>
      </div>
    </section>
  );
}
