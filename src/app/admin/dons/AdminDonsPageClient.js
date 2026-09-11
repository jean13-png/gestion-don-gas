"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getAdminDons, exportAdminDonsCsv } from "@/app/actions/admin";

const State = {
  data: null,
};

const STATUTS = ["ALL", "SOUMIS", "EN_VERIFICATION", "INSPECTE", "VALIDE", "FICHE_GENEREE"];
const NATURES = ["ALL", "MATERIEL_INFORMATIQUE", "EQUIPEMENT_PEDAGOGIQUE", "DON_FINANCIER", "AUTRE"];
const PERIODES = [
  { value: "all", label: "Toutes" },
  { value: "7j", label: "7 jours" },
  { value: "90j", label: "3 mois" },
  { value: "12m", label: "12 mois" },
];

export default function AdminDonsPageClient({ initialData }) {
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(async (_prev, formData) => {
    try {
      const filter = {
        search: formData.get("search") || "",
        statut: formData.get("statut") || "ALL",
        nature: formData.get("nature") || "ALL",
        periode: formData.get("periode") || "all",
        page: Number(formData.get("page") || 1),
        limit: 20,
      };
      const data = await getAdminDons(filter);
      return { data, error: "" };
    } catch (actionError) {
      console.error("[admin/dons] Chargement échoué:", actionError);
      return { data: initialData, error: "Nous n'avons pas pu charger les dons. Veuillez réessayer." };
    }
  }, { data: initialData });

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statut, setStatut] = useState(searchParams.get("statut") || "ALL");
  const [nature, setNature] = useState(searchParams.get("nature") || "ALL");
  const [periode, setPeriode] = useState(searchParams.get("periode") || "all");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const displayedError = state.error || error;

  const current = state.data || initialData;
  const totalPages = current?.totalPages || 1;
  const currentPage = current?.page || 1;

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("page", "1");
    try {
      await formAction(formData);
    } catch (actionError) {
      console.error("[admin/dons] Recherche échouée:", actionError);
      setError("Nous n'avons pas pu charger les dons. Veuillez réessayer.");
    }
  }

  async function handlePage(next) {
    setError("");
    const formData = new FormData();
    formData.set("search", search);
    formData.set("statut", statut);
    formData.set("nature", nature);
    formData.set("periode", periode);
    formData.set("page", String(next));
    formData.set("limit", "20");
    try {
      await formAction(formData);
    } catch (actionError) {
      console.error("[admin/dons] Changement de page échoué:", actionError);
      setError("Nous n'avons pas pu charger cette page. Veuillez réessayer.");
    }
  }

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      const result = await exportAdminDonsCsv({ search, statut, nature, periode });
      const blob = new Blob([result.content], { type: result.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error("[admin/dons] Export échoué:", exportError);
      setError("Nous n'avons pas pu exporter les dons. Veuillez réessayer.");
    } finally {
      setExporting(false);
    }
  }

  const statutLabel = (s) => {
    switch (s) {
      case "SOUMIS":
        return "Soumis";
      case "EN_VERIFICATION":
        return "En vérification";
      case "INSPECTE":
        return "Inspecté";
      case "VALIDE":
        return "Validé";
      case "FICHE_GENEREE":
        return "Fiche générée";
      default:
        return s;
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">Dons</h1>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-ong-bordure text-ong-bleu text-[13px] font-medium hover:bg-ong-fond transition-colors disabled:opacity-60"
        >
          {exporting ? "Export..." : "Exporter CSV"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 bg-white border border-ong-bordure rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1">Recherche</label>
            <input
              name="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Référence, nom, email"
              className="w-full h-10 px-3 rounded-md border border-ong-bordure bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1">Statut</label>
            <select
              name="statut"
              value={statut}
              onChange={(e) => setStatut(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-ong-bordure bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
            >
              {STATUTS.map((s) => (
                <option key={s} value={s}>{s === "ALL" ? "Tous" : statutLabel(s)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1">Nature</label>
            <select
              name="nature"
              value={nature}
              onChange={(e) => setNature(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-ong-bordure bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
            >
              {NATURES.map((n) => (
                <option key={n} value={n}>{n === "ALL" ? "Toutes" : n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1">Période</label>
            <select
              name="periode"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-ong-bordure bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
            >
              {PERIODES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button type="submit" className="h-10 px-5 rounded-md bg-ong-bleu text-white text-[13px] font-medium hover:bg-ong-bleu-fonce transition-colors">
            Filtrer
          </button>
        </div>
      </form>
      {displayedError && (
        <p role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {displayedError}
        </p>
      )}

      <div className="mt-4 bg-white border border-ong-bordure rounded-lg">
        <div className="px-6 py-3 border-b border-ong-bordure flex items-center justify-between">
          <p className="text-[13px] text-ong-muted">
            {current?.total || 0} résultat{(current?.total || 0) > 1 ? "s" : ""}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-ong-bordure text-ong-muted">
                <th className="px-6 py-3 font-medium">Référence</th>
                <th className="px-6 py-3 font-medium">Donateur</th>
                <th className="px-6 py-3 font-medium">Nature</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            {!current?.dons.length ? (
              <tbody>
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-ong-muted">
                    Aucun don trouvé.
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {current.dons.map((don) => (
                  <tr key={don.id} className="border-b border-ong-bordure hover:bg-ong-fond">
                    <td className="px-6 py-4 font-medium">{don.reference}</td>
                    <td className="px-6 py-4">{don.donateur.prenom} {don.donateur.nom}</td>
                    <td className="px-6 py-4">{don.nature}</td>
                    <td className="px-6 py-4 text-ong-muted">{new Date(don.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium bg-ong-vert-pale text-ong-vert">
                        {statutLabel(don.statut)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/admin/dons/${don.id}`} className="text-ong-bleu hover:underline">
                        Voir
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-ong-bordure px-4 py-4 sm:justify-between sm:px-6">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePage(currentPage - 1)}
              className="h-9 px-4 rounded-md border border-ong-bordure text-[13px] font-medium disabled:opacity-50 hover:bg-ong-fond transition-colors"
            >
              Précédent
            </button>
            <div className="flex items-center gap-1">
              {pageNumbers.map((p, idx) =>
                typeof p === "number" ? (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePage(p)}
                    className={`h-9 min-w-[36px] px-2 rounded-md text-[13px] font-medium transition-colors ${
                      p === currentPage
                        ? "bg-ong-bleu text-white"
                        : "hover:bg-ong-fond"
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span key={idx} className="px-2 text-[13px] text-ong-muted">{p}</span>
                )
              )}
            </div>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePage(currentPage + 1)}
              className="h-9 px-4 rounded-md border border-ong-bordure text-[13px] font-medium disabled:opacity-50 hover:bg-ong-fond transition-colors"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
