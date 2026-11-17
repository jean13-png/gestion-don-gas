"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Icon from "@/components/ui/Icon";
import {
  basculerCompteAdmin,
  creerCompteAdmin,
  modifierCompteAdmin,
  reinitialiserMotDePasseCompte,
} from "@/app/actions/comptes";

const initialState = { error: "", success: false, message: "" };

function afficherSucces(message) {
  Swal.fire({
    title: "Terminé",
    text: message,
    icon: "success",
    confirmButtonColor: "#4278E1",
  });
}

function afficherErreur(error) {
  Swal.fire({
    title: "Action impossible",
    text: error,
    icon: "error",
    confirmButtonColor: "#4278E1",
  });
}

/** Grille de cases à cocher des autorisations. */
function GrillePermissions({ catalogue, name = "permissions", values = [] }) {
  const [cochees, setCochees] = useState(values);

  function basculer(cle) {
    setCochees((actuel) =>
      actuel.includes(cle) ? actuel.filter((c) => c !== cle) : [...actuel, cle],
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {catalogue.map((permission) => (
        <label
          key={permission.cle}
          className={`flex cursor-pointer items-start gap-2.5 rounded-md border p-3 transition-colors ${
            cochees.includes(permission.cle)
              ? "border-ong-bleu bg-ong-bleu-pale"
              : "border-ong-bordure bg-white hover:bg-ong-fond"
          }`}
        >
          <input
            type="checkbox"
            name={name}
            value={permission.cle}
            checked={cochees.includes(permission.cle)}
            onChange={() => basculer(permission.cle)}
            className="mt-0.5 h-4 w-4 accent-[#4278E1]"
          />
          <span>
            <span className="block text-[13px] font-medium text-ong-texte">
              {permission.label}
            </span>
            <span className="block text-[11px] text-ong-muted">{permission.cle}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

export default function ComptesManager({ comptes, monId, catalogue }) {
  const router = useRouter();
  const [stateCreation, actionCreation, enCreation] = useActionState(
    creerCompteAdmin,
    initialState,
  );

  useEffect(() => {
    if (stateCreation?.error) afficherErreur(stateCreation.error);
    if (stateCreation?.success) {
      afficherSucces(stateCreation.message);
      router.refresh();
    }
  }, [stateCreation, router]);

  async function soumettreModification(formAction, formulaire) {
    const formData = new FormData(formulaire);
    const resultat = await formAction(formData);
    if (resultat?.error) afficherErreur(resultat.error);
    else if (resultat?.success) {
      afficherSucces(resultat.message);
      router.refresh();
    }
    return resultat;
  }

  async function handleModifier(formulaire) {
    await soumettreModification(modifierCompteAdmin, formulaire);
  }

  async function handleMotDePasse(formulaire) {
    await soumettreModification(reinitialiserMotDePasseCompte, formulaire);
  }

  async function handleBasculer(formulaire) {
    const confirmation = await Swal.fire({
      title: "Changer l'état de ce compte ?",
      text: "Un compte désactivé ne peut plus se connecter à l'administration.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, continuer",
      cancelButtonText: "Annuler",
    });
    if (!confirmation.isConfirmed) return;
    await soumettreModification(basculerCompteAdmin, formulaire);
  }

  return (
    <div className="max-w-5xl">
      <h1 className="font-display font-semibold text-ong-bleu text-[28px]">Comptes</h1>
      <p className="mt-1 text-[13px] text-ong-muted">
        Créez des comptes pour d&apos;autres personnes de l&apos;équipe et
        choisissez précisément ce qu&apos;elles ont le droit de faire.
      </p>

      {/* ---- Création d'un compte ---- */}
      <section className="mt-6 bg-white border border-ong-bordure rounded-lg p-6">
        <h2 className="font-display font-semibold text-ong-bleu text-[16px] mb-4 flex items-center gap-2">
          <Icon name="user-plus" />
          Créer un compte
        </h2>
        <form action={actionCreation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nom"
                className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5"
              >
                Nom de la personne
              </label>
              <input
                id="nom"
                name="nom"
                type="text"
                required
                minLength={2}
                maxLength={80}
                placeholder="Ex : HEDJE ZINSOU RAOUL"
                className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5"
              >
                Adresse e-mail (identifiant de connexion)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={150}
                placeholder="personne@exemple.com"
                className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="motDePasse"
              className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5"
            >
              Mot de passe initial (au moins 8 caractères)
            </label>
            <input
              id="motDePasse"
              name="motDePasse"
              type="text"
              required
              minLength={8}
              maxLength={64}
              placeholder="À communiquer à la personne"
              className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
            />
            <p className="mt-1 text-[12px] text-ong-muted">
              La personne pourra le changer en demandant une réinitialisation à
              un administrateur.
            </p>
          </div>
          <div>
            <span className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-2">
              Autorisations de ce compte
            </span>
            <GrillePermissions catalogue={catalogue} />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={enCreation}
              className="h-11 px-6 rounded-md bg-ong-bleu text-white text-[14px] font-medium cursor-pointer hover:bg-ong-bleu-fonce transition-colors disabled:opacity-60"
            >
              {enCreation ? "Création..." : "Créer le compte"}
            </button>
          </div>
        </form>
      </section>

      {/* ---- Liste des comptes ---- */}
      <section className="mt-6 space-y-4">
        <h2 className="font-display font-semibold text-ong-bleu text-[16px]">
          Comptes de l&apos;équipe ({comptes.length})
        </h2>

        {comptes.map((compte) => {
          const estMoi = compte.id === monId;
          return (
            <article
              key={compte.id}
              className={`bg-white border rounded-lg p-5 ${
                compte.actif ? "border-ong-bordure" : "border-red-200 bg-red-50/40"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[16px] font-semibold text-ong-texte">
                      {compte.nom}
                    </h3>
                    {estMoi && (
                      <span className="rounded-full bg-ong-bleu-pale px-2 py-0.5 text-[11px] font-medium text-ong-bleu">
                        Votre compte
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        compte.actif
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {compte.actif ? "Actif" : "Désactivé"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[13px] text-ong-muted">{compte.email}</p>
                  <p className="mt-0.5 text-[12px] text-ong-muted">
                    Créé le{" "}
                    {new Date(compte.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {compte.permissions.length === 0 ? (
                      <span className="text-[12px] text-ong-muted">
                        Aucune autorisation (consultation seule)
                      </span>
                    ) : (
                      compte.permissions.map((cle) => {
                        const permission = catalogue.find((p) => p.cle === cle);
                        return (
                          <span
                            key={cle}
                            className="rounded-full bg-ong-fond border border-ong-bordure px-2 py-0.5 text-[11px] text-ong-texte"
                          >
                            {permission ? permission.label : cle}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleBasculer(event.currentTarget);
                  }}
                >
                  <input type="hidden" name="id" value={compte.id} />
                  <button
                    type="submit"
                    disabled={estMoi}
                    title={
                      estMoi
                        ? "Vous ne pouvez pas désactiver votre propre compte."
                        : compte.actif
                          ? "Désactiver ce compte"
                          : "Réactiver ce compte"
                    }
                    className={`h-9 px-4 rounded-md border text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      compte.actif
                        ? "border-red-200 text-red-700 hover:bg-red-50"
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {compte.actif ? "Désactiver" : "Réactiver"}
                  </button>
                </form>
              </div>

              <details className="mt-4 group">
                <summary className="cursor-pointer text-[13px] font-medium text-ong-bleu hover:underline">
                  Modifier le nom et les autorisations
                </summary>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleModifier(event.currentTarget);
                  }}
                  className="mt-4 space-y-4"
                >
                  <input type="hidden" name="id" value={compte.id} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                        Nom de la personne
                      </label>
                      <input
                        name="nom"
                        type="text"
                        required
                        minLength={2}
                        maxLength={80}
                        defaultValue={compte.nom}
                        className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
                      />
                    </div>
                  </div>
                  <GrillePermissions catalogue={catalogue} values={compte.permissions} />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="h-10 px-5 rounded-md border border-ong-bleu text-ong-bleu text-[14px] font-medium cursor-pointer hover:bg-ong-fond"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </form>
              </details>

              <details className="mt-2">
                <summary className="cursor-pointer text-[13px] font-medium text-ong-bleu hover:underline">
                  Réinitialiser le mot de passe
                </summary>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleMotDePasse(event.currentTarget);
                  }}
                  className="mt-4 flex flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="id" value={compte.id} />
                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                      Nouveau mot de passe (au moins 8 caractères)
                    </label>
                    <input
                      name="motDePasse"
                      type="text"
                      required
                      minLength={8}
                      maxLength={64}
                      placeholder="Choisissez un mot de passe simple à retenir"
                      className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-11 px-5 rounded-md border border-ong-bordure text-ong-texte text-[14px] font-medium cursor-pointer hover:bg-ong-fond"
                  >
                    Réinitialiser
                  </button>
                </form>
              </details>
            </article>
          );
        })}
      </section>
    </div>
  );
}
