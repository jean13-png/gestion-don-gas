"use client";

import { useState } from "react";
import Swal from "sweetalert2";

const FILTERS = [["tous", "Tous"], ["mails", "Mails"], ["actions", "Actions"], ["echecs", "Échecs uniquement"]];

export default function HistoryTable({ initial }) {
  const [data, setData] = useState(initial);
  const [filter, setFilter] = useState("tous");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [statut, setStatut] = useState("");
  const [type, setType] = useState("");
  const [deleting, setDeleting] = useState(false);

  function query(nextFilter = filter, page = 1) {
    const params = new URLSearchParams({ filtre: nextFilter, page: String(page) });
    if (dateDebut) params.set("dateDebut", dateDebut);
    if (dateFin) params.set("dateFin", dateFin);
    if (statut) params.set("statut", statut);
    if (type) params.set("type", type);
    return params.toString();
  }

  async function load(nextFilter = filter, page = 1) {
    const response = await fetch(`/api/admin/historique?${query(nextFilter, page)}`);
    if (!response.ok) throw new Error("Historique indisponible");
    setData(await response.json());
  }

  async function resend(id) {
    try {
      const response = await fetch(`/api/admin/historique/${id}/renvoyer`, { method: "POST" });
      if (!response.ok) throw new Error("renvoi");
      await Swal.fire({ title: "E-mail renvoyé", text: "Une nouvelle entrée sera ajoutée à l'historique.", icon: "success", confirmButtonColor: "#4278E1" });
      await load();
    } catch (error) {
      console.error("[historique] renvoi", error);
      await Swal.fire({ title: "Renvoi impossible", text: "Veuillez réessayer.", icon: "error", confirmButtonColor: "#4278E1" });
    }
  }

  async function deleteFiltered() {
    const hasFilter = filter !== "tous" || dateDebut || dateFin || statut || type;
    const confirmation = await Swal.fire({
      title: hasFilter ? "Supprimer les historiques filtrés ?" : "Supprimer tout l'historique ?",
      text: hasFilter
        ? "Les entrées correspondant aux filtres seront définitivement supprimées."
        : "Cette action supprimera toutes les actions et tous les e-mails enregistrés.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Supprimer définitivement",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#dc2626",
    });
    if (!confirmation.isConfirmed) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/historique", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filtre: filter, dateDebut, dateFin, statut, type }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "suppression");
      await Swal.fire({ title: "Historique supprimé", text: `${result.deleted} entrée(s) supprimée(s).`, icon: "success", confirmButtonColor: "#4278E1" });
      await load(filter, 1);
    } catch (error) {
      console.error("[historique] suppression", error);
      await Swal.fire({ title: "Suppression impossible", text: "Veuillez réessayer.", icon: "error", confirmButtonColor: "#4278E1" });
    } finally {
      setDeleting(false);
    }
  }

  return <div className="max-w-6xl space-y-6">
    <div><h1 className="font-display font-semibold text-ong-bleu text-[28px]">Historique</h1><p className="text-[14px] text-ong-muted">Actions et e-mails de la plateforme.</p></div>
    <div className="rounded-lg border border-ong-bordure bg-white p-4 space-y-4">
      <div className="flex flex-wrap gap-2">{FILTERS.map(([value, label]) => <button key={value} type="button" onClick={() => { setFilter(value); load(value); }} className={`rounded-md px-3 py-2 text-[13px] ${filter === value ? "bg-ong-bleu text-white" : "border border-ong-bordure text-ong-texte"}`}>{label}</button>)}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-[13px] text-ong-muted">Du<input type="date" value={dateDebut} onChange={(event) => setDateDebut(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-ong-bordure px-2 text-ong-texte" /></label>
        <label className="text-[13px] text-ong-muted">Au<input type="date" value={dateFin} onChange={(event) => setDateFin(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-ong-bordure px-2 text-ong-texte" /></label>
        <label className="text-[13px] text-ong-muted">Type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-ong-bordure px-2 text-ong-texte"><option value="">Tous</option><option value="MAIL">Mails</option><option value="ACTION">Actions</option></select></label>
        <label className="text-[13px] text-ong-muted">Statut<select value={statut} onChange={(event) => setStatut(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-ong-bordure px-2 text-ong-texte"><option value="">Tous</option><option value="ECHEC">Erreurs</option><option value="ENVOYE">Envoyés</option><option value="OK">Actions OK</option></select></label>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => load(filter, 1)} className="rounded-md bg-ong-bleu px-4 py-2 text-[13px] text-white">Appliquer les filtres</button>
        <button type="button" disabled={deleting} onClick={deleteFiltered} className="rounded-md border border-red-200 px-4 py-2 text-[13px] text-red-700 hover:bg-red-50 disabled:opacity-50">{deleting ? "Suppression..." : "Supprimer les résultats"}</button>
      </div>
    </div>
    <div className="overflow-x-auto rounded-lg border border-ong-bordure bg-white"><table className="min-w-[900px] w-full text-left text-[13px]"><thead><tr className="border-b border-ong-bordure text-ong-muted"><th className="px-4 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Destinataire</th><th className="px-4 py-3">Sujet / message</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Erreur</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id} className="border-b border-ong-bordure"><td className="px-4 py-3 whitespace-nowrap">{new Date(item.createdAt).toLocaleString("fr-FR")}</td><td className="px-4 py-3">{item.type}</td><td className="px-4 py-3">{item.destinataire || "—"}</td><td className="max-w-xs px-4 py-3">{item.sujet || item.message || "—"}</td><td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 ${item.statut === "ENVOYE" ? "border-green-200 bg-green-50 text-green-700" : item.statut === "ECHEC" ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>{item.statut}</span></td><td className="max-w-xs px-4 py-3 text-red-700">{item.erreur || "—"}</td><td className="px-4 py-3">{item.type === "MAIL" && item.statut === "ECHEC" && <button type="button" onClick={() => resend(item.id)} className="text-ong-bleu hover:underline">Renvoyer</button>}</td></tr>)}</tbody></table>{!data.items.length && <p className="p-6 text-ong-muted">Aucun élément.</p>}</div>
    <div className="flex items-center justify-between text-[13px]"><button disabled={data.page <= 1} onClick={() => load(filter, data.page - 1)} className="rounded-md border px-3 py-2 disabled:opacity-50">Précédent</button><span>Page {data.page} / {data.totalPages}</span><button disabled={data.page >= data.totalPages} onClick={() => load(filter, data.page + 1)} className="rounded-md border px-3 py-2 disabled:opacity-50">Suivant</button></div>
  </div>;
}
