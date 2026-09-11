"use client";

import { useState } from "react";
import Swal from "sweetalert2";

export default function SettingsForm({ initial }) {
  const [nom, setNom] = useState(initial.nom);
  const [email, setEmail] = useState(initial.email);
  const [saving, setSaving] = useState(false);
  async function request(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Opération impossible.");
    return result;
  }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    try {
      await request("/api/admin/parametres", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom, email }) });
      await Swal.fire({ title: "Paramètres enregistrés", icon: "success", confirmButtonColor: "#4278E1" });
    } catch (error) {
      console.error("[parametres]", error);
      await Swal.fire({ title: "Enregistrement impossible", text: "Vérifiez les informations puis réessayez.", icon: "error", confirmButtonColor: "#4278E1" });
    } finally { setSaving(false); }
  }
  async function test() {
    try {
      await request("/api/admin/parametres", { method: "POST" });
      await Swal.fire({ title: "E-mail de test traité", text: "Consultez l'historique pour voir le résultat.", icon: "success", confirmButtonColor: "#4278E1" });
    } catch (error) {
      console.error("[parametres] test", error);
      await Swal.fire({ title: "Test impossible", text: "Le test n'a pas pu être traité.", icon: "error", confirmButtonColor: "#4278E1" });
    }
  }
  return <div className="max-w-2xl space-y-6"><div><h1 className="font-display font-semibold text-ong-bleu text-[28px]">Paramètres</h1><p className="text-[14px] text-ong-muted">Expéditeur utilisé pour les prochains e-mails.</p></div><form onSubmit={save} className="space-y-4 bg-white border border-ong-bordure rounded-lg p-6"><label className="block text-[14px]">Nom de l'expéditeur<input value={nom} onChange={(e) => setNom(e.target.value)} required className="mt-1 w-full h-11 px-3 rounded-md border border-ong-bordure" /></label><label className="block text-[14px]">E-mail expéditeur<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full h-11 px-3 rounded-md border border-ong-bordure" /></label><div className="flex flex-wrap gap-3"><button disabled={saving} className="button disabled:opacity-60">Enregistrer</button><button type="button" onClick={test} className="button button-outline">Envoyer un e-mail de test</button></div></form></div>;
}
