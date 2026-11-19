"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Swal from "sweetalert2";
import { marquerLu, marquerNonLu, supprimerMessage } from "./actions";

const SUJETS = {
  DON: { label: "Question sur un don", classe: "bg-ong-bleu-pale text-ong-bleu" },
  PARTENARIAT: { label: "Partenariat", classe: "bg-emerald-50 text-emerald-700" },
  PRESSE: { label: "Presse / média", classe: "bg-purple-50 text-purple-700" },
  AUTRE: { label: "Autre", classe: "bg-slate-100 text-slate-600" },
};

function dateFr(d) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactManager({ messages = [] }) {
  const router = useRouter();
  const [filtre, setFiltre] = useState("TOUS");
  const [ouvert, setOuvert] = useState(null);
  const [pending, startTransition] = useTransition();

  const nonLus = useMemo(() => messages.filter((m) => !m.lu).length, [messages]);
  const affiches = useMemo(
    () => (filtre === "NON_LUS" ? messages.filter((m) => !m.lu) : messages),
    [filtre, messages]
  );

  function ouvrir(id) {
    setOuvert((o) => (o === id ? null : id));
    const m = messages.find((x) => x.id === id);
    if (m && !m.lu) {
      startTransition(async () => {
        await marquerLu(id);
        router.refresh();
      });
    }
  }

  async function basculerLu(m) {
    if (m.lu) await marquerNonLu(m.id);
    else await marquerLu(m.id);
    router.refresh();
  }

  async function supprimer(m) {
    const confirm = await Swal.fire({
      title: "Supprimer ce message ?",
      html: `Le message de <strong>${m.prenom} ${m.nom}</strong> sera définitivement supprimé.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
    });
    if (!confirm.isConfirmed) return;
    await supprimerMessage(m.id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-semibold text-ong-bleu text-[24px]">
            Messages de contact
          </h1>
          <p className="mt-1 text-[14px] text-ong-muted">
            Les messages envoyés depuis le formulaire de contact du site des dons.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltre("TOUS")}
            className={`h-10 px-4 rounded-md border text-[13px] font-medium transition-colors cursor-pointer ${
              filtre === "TOUS"
                ? "border-ong-bleu bg-ong-bleu text-white"
                : "border-ong-bordure bg-white text-ong-texte hover:border-ong-bleu"
            }`}
          >
            Tous ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltre("NON_LUS")}
            className={`h-10 px-4 rounded-md border text-[13px] font-medium transition-colors cursor-pointer ${
              filtre === "NON_LUS"
                ? "border-ong-bleu bg-ong-bleu text-white"
                : "border-ong-bordure bg-white text-ong-texte hover:border-ong-bleu"
            }`}
          >
            Non lus ({nonLus})
          </button>
        </div>
      </div>

      {affiches.length === 0 ? (
        <div className="rounded-lg border border-ong-bordure bg-white p-10 text-center">
          <Icon name="envelope-open" className="text-ong-bleu text-3xl" />
          <p className="mt-3 text-[15px] font-medium text-ong-texte">Aucun message</p>
          <p className="mt-1 text-[13px] text-ong-muted">
            Les messages du formulaire de contact apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {affiches.map((m) => {
            const sujet = SUJETS[m.sujet] ?? SUJETS.AUTRE;
            const estOuvert = ouvert === m.id;
            return (
              <li
                key={m.id}
                className={`rounded-lg border bg-white transition-colors ${
                  m.lu ? "border-ong-bordure" : "border-ong-bleu shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={() => ouvrir(m.id)}
                  className="w-full cursor-pointer flex flex-wrap items-center gap-3 px-5 py-4 text-left"
                >
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${sujet.classe}`}
                  >
                    <Icon name="tag" fixedWidth />
                    {sujet.label}
                  </span>
                  <span className="text-[15px] font-semibold text-ong-texte">
                    {m.prenom} {m.nom}
                  </span>
                  {!m.lu && (
                    <span className="inline-flex items-center rounded-full bg-ong-vert-pale border border-ong-vert px-2 py-0.5 text-[11px] font-semibold text-ong-vert">
                      Nouveau
                    </span>
                  )}
                  <span className="ml-auto text-[12px] text-ong-muted">
                    {dateFr(m.createdAt)}
                  </span>
                  <Icon
                    name={estOuvert ? "chevron-up" : "chevron-down"}
                    className="text-ong-muted"
                  />
                </button>

                {estOuvert && (
                  <div className="border-t border-ong-bordure px-5 py-4">
                    <p className="text-[13px] text-ong-muted">
                      <Icon name="envelope" fixedWidth className="text-ong-bleu" />{" "}
                      <a
                        href={`mailto:${m.email}`}
                        className="font-medium text-ong-bleu hover:underline"
                      >
                        {m.email}
                      </a>
                    </p>
                    <p className="mt-3 whitespace-pre-line rounded-md bg-ong-fond px-4 py-3 text-[14px] leading-relaxed text-ong-texte">
                      {m.message}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(
                          `ONG-GAS — Réponse à votre message (${sujet.label})`
                        )}`}
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-ong-bleu px-4 text-[13px] font-semibold text-white hover:bg-ong-bleu-fonce transition-colors"
                      >
                        <Icon name="reply" fixedWidth />
                        Répondre par e-mail
                      </a>
                      <button
                        type="button"
                        onClick={() => basculerLu(m)}
                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-ong-bordure px-4 text-[13px] font-medium text-ong-texte hover:border-ong-bleu transition-colors"
                      >
                        <Icon name={m.lu ? "envelope" : "envelope-open"} fixedWidth />
                        {m.lu ? "Marquer non lu" : "Marquer comme lu"}
                      </button>
                      <button
                        type="button"
                        onClick={() => supprimer(m)}
                        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-red-200 px-4 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Icon name="trash-can" fixedWidth />
                        Supprimer
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {pending && <p className="text-[12px] text-ong-muted">Mise à jour…</p>}
    </div>
  );
}
