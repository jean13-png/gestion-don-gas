"use client";

import { useState } from "react";
import Swal from "sweetalert2";

const FILTERS = [["tous", "Tous"], ["mails", "Mails"], ["actions", "Actions"], ["echecs", "Échecs uniquement"]];
export default function HistoryTable({ initial }) {
  const [data, setData] = useState(initial);
  const [filter, setFilter] = useState("tous");
  async function load(nextFilter = filter, page = 1) {
    const response = await fetch(`/api/admin/historique?filtre=${nextFilter}&page=${page}`);
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
  return <div className="max-w-6xl space-y-6"><div><h1 className="font-display font-semibold text-ong-bleu text-[28px]">Historique</h1><p className="text-[14px] text-ong-muted">Actions et e-mails de la plateforme.</p></div><div className="flex flex-wrap gap-2">{FILTERS.map(([value, label]) => <button key={value} type="button" onClick={() => { setFilter(value); load(value); }} className={`rounded-md px-3 py-2 text-[13px] ${filter === value ? "bg-ong-bleu text-white" : "border border-ong-bordure text-ong-texte"}`}>{label}</button>)}</div><div className="overflow-x-auto rounded-lg border border-ong-bordure bg-white"><table className="min-w-[900px] w-full text-left text-[13px]"><thead><tr className="border-b border-ong-bordure text-ong-muted"><th className="px-4 py-3">Date</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Destinataire</th><th className="px-4 py-3">Sujet / message</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Erreur</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id} className="border-b border-ong-bordure"><td className="px-4 py-3 whitespace-nowrap">{new Date(item.createdAt).toLocaleString("fr-FR")}</td><td className="px-4 py-3">{item.type}</td><td className="px-4 py-3">{item.destinataire || "—"}</td><td className="max-w-xs px-4 py-3">{item.sujet || item.message || "—"}</td><td className="px-4 py-3"><span className={`rounded-full border px-2 py-1 ${item.statut === "ENVOYE" ? "border-green-200 bg-green-50 text-green-700" : item.statut === "ECHEC" ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>{item.statut}</span></td><td className="max-w-xs px-4 py-3 text-red-700">{item.erreur || "—"}</td><td className="px-4 py-3">{item.type === "MAIL" && item.statut === "ECHEC" && <button type="button" onClick={() => resend(item.id)} className="text-ong-bleu hover:underline">Renvoyer</button>}</td></tr>)}</tbody></table>{!data.items.length && <p className="p-6 text-ong-muted">Aucun élément.</p>}</div><div className="flex items-center justify-between text-[13px]"><button disabled={data.page <= 1} onClick={() => load(filter, data.page - 1)} className="rounded-md border px-3 py-2 disabled:opacity-50">Précédent</button><span>Page {data.page} / {data.totalPages}</span><button disabled={data.page >= data.totalPages} onClick={() => load(filter, data.page + 1)} className="rounded-md border px-3 py-2 disabled:opacity-50">Suivant</button></div></div>;
}
