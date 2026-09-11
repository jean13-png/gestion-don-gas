import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUTS = ["SOUMIS", "EN_VERIFICATION", "INSPECTE", "VALIDE", "FICHE_GENEREE", "REJETE"];
const STATUT_LABELS = {
  SOUMIS: "Soumis", EN_VERIFICATION: "En vérification", INSPECTE: "Inspecté",
  VALIDE: "Validé", FICHE_GENEREE: "Fiche générée", REJETE: "Rejeté",
};

export default async function SuiviPage({ searchParams }) {
  const params = await searchParams;
  const reference = params?.reference;
  const don = reference
    ? await prisma.don.findUnique({
        where: { reference },
        include: { donateur: true, photos: true },
      })
    : null;

  return (
    <section className="bg-ong-fond py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">
          Suivre ma demande
        </h1>
        <p className="mt-2 text-[15px] text-ong-texte">
          Entrez votre référence de don pour consulter le statut et les détails de votre dossier.
        </p>

        <form action="/suivi" method="get" className="mt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="reference"
              defaultValue={reference || ""}
              placeholder="Ex : GAS-2026-00A2F"
              className="flex-1 h-12 px-4 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
              required
            />
            <button
              type="submit"
              className="h-12 px-6 rounded-md bg-ong-bleu text-white text-[14px] font-semibold hover:bg-ong-bleu-fonce transition-colors"
            >
              Suivre ma demande
            </button>
          </div>
        </form>

        <div className="mt-5 rounded-lg border border-ong-bordure bg-ong-bleu-tres-clair p-4 text-[13px] text-ong-texte">
          <p className="font-medium text-ong-bleu">Protection des données</p>
          <p className="mt-1 text-ong-texte-secondaire">
            La référence suffit pour consulter le statut de votre dossier. Les coordonnées complètes restent visibles uniquement au service de gestion du projet.
          </p>
        </div>

        {reference && don && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-ong-bordure rounded-lg p-5">
                <p className="text-[12px] text-ong-muted uppercase tracking-wider mb-1">
                  Référence
                </p>
                <p className="font-mono text-[20px] font-semibold text-ong-bleu break-all">
                  {don.reference}
                </p>
                <p className="mt-2 text-[13px] text-ong-muted">
                  Statut actuel du dossier
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ong-vert-pale text-ong-vert text-[12px] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-ong-vert" />
                  {STATUT_LABELS[don.statut] || "Statut inconnu"}
                </span>
              </div>

              <div className="bg-white border border-ong-bordure rounded-lg p-5">
                <p className="text-[12px] text-ong-muted uppercase tracking-wider mb-1">
                  Donateur
                </p>
                <p className="text-[15px] text-ong-texte font-medium">
                  {don.donateur.prenom} {don.donateur.nom}
                </p>
                <p className="mt-2 text-[13px] text-ong-muted">
                  Les coordonnées complètes restent accessibles uniquement à l’équipe de gestion du projet.
                </p>
              </div>
            </div>

            <div className="bg-white border border-ong-bordure rounded-lg p-5">
              <h2 className="font-display font-semibold text-ong-bleu text-[15px] mb-4">
                Détails du don
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
                <div>
                  <span className="text-ong-muted">Nature</span>
                  <p className="text-ong-texte font-medium mt-0.5">
                    {don.nature === "AUTRE" && don.natureAutre ? don.natureAutre : don.nature}
                  </p>
                </div>
                <div>
                  <span className="text-ong-muted">Localisation</span>
                  <p className="text-ong-texte font-medium mt-0.5">{don.localisation}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-ong-muted">Description</span>
                  <p className="text-ong-texte mt-0.5">{don.description}</p>
                </div>
                <div>
                  <span className="text-ong-muted">Date de soumission</span>
                  <p className="text-ong-texte font-medium mt-0.5">
                    {new Date(don.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-ong-bordure rounded-lg p-5">
              <h2 className="font-display font-semibold text-ong-bleu text-[15px] mb-4">
                Suivi de la demande
              </h2>
              <ol className="space-y-3">
                {STATUTS.map((statut) => {
                  if (don.statut === "REJETE" && statut !== "REJETE") return null;
                  const isDone = STATUTS.indexOf(don.statut) >= STATUTS.indexOf(statut);
                  const isCurrent = don.statut === statut;
                  return (
                    <li key={statut} className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-medium ${
                          isDone
                            ? "bg-ong-vert border-ong-vert text-white"
                            : "bg-white border-ong-bordure text-ong-muted"
                        }`}
                      >
                        {isDone && !isCurrent ? "✓" : STATUTS.indexOf(statut) + 1}
                      </span>
                      <span
                        className={`text-[14px] ${
                          isCurrent ? "text-ong-texte font-medium" : isDone ? "text-ong-texte" : "text-ong-muted"
                        }`}
                      >
                        {STATUT_LABELS[statut]}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {don.ficheUrl && (
              <div className="bg-white border border-ong-bordure rounded-lg p-5">
                <h2 className="font-display font-semibold text-ong-bleu text-[15px] mb-4">
                  Attestation officielle
                </h2>
                <p className="text-[14px] text-ong-texte-secondaire mb-4">
                  Votre attestation de don est disponible. Vous pouvez la consulter ou la télécharger.
                </p>
                <a
                  href={don.ficheUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-ong-bleu text-white text-[14px] font-medium hover:bg-ong-bleu-fonce transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger la fiche PDF
                </a>
              </div>
            )}
          </div>
        )}

        {reference && !don && (
          <div className="mt-8 bg-white border border-ong-bordure rounded-lg p-6 text-center">
            <p className="text-[15px] text-ong-texte">
              Aucun dossier trouvé pour la référence <strong>{reference}</strong>.
            </p>
            <p className="mt-2 text-[13px] text-ong-muted">
              Vérifiez la référence et réessayez.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
