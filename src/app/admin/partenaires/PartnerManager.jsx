"use client";

import { useRef, useState } from "react";
import Swal from "sweetalert2";

export default function PartnerManager({ initialPartenaires }) {
  const formRef = useRef(null);
  const [partenaires, setPartenaires] = useState(initialPartenaires);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function send(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Opération impossible.");
    return result;
  }

  async function create(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await send("/api/admin/partenaires", { method: "POST", body: new FormData(form) });
      setPartenaires((items) => [...items, result].sort((a, b) => a.ordre - b.ordre));
      form.reset();
      setMessage("Partenaire enregistré.");
      await Swal.fire({
        title: "Partenaire ajouté",
        text: "Le logo sera affiché selon sa visibilité.",
        icon: "success",
        confirmButtonColor: "#4278E1",
      });
    } catch (createError) {
      console.error("[admin/partenaires] Création échouée:", createError);
      const message = "Nous n'avons pas pu enregistrer ce partenaire. Vérifiez les informations puis réessayez.";
      setError(message);
      await Swal.fire({
        title: "Ajout impossible",
        text: message,
        icon: "error",
        confirmButtonColor: "#4278E1",
      });
    } finally {
      setSaving(false);
    }
  }

  async function update(id, data) {
    try {
      const result = await send("/api/admin/partenaires", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      setPartenaires((items) => items.map((item) => item.id === id ? result : item).sort((a, b) => a.ordre - b.ordre));
      await Swal.fire({
        title: "Modification enregistrée",
        text: "Les paramètres du partenaire ont été mis à jour.",
        icon: "success",
        confirmButtonColor: "#4278E1",
      });
    } catch (updateError) {
      console.error("[admin/partenaires] Modification échouée:", updateError);
      const message = "Nous n'avons pas pu modifier ce partenaire. Veuillez réessayer.";
      setError(message);
      await Swal.fire({
        title: "Modification impossible",
        text: message,
        icon: "error",
        confirmButtonColor: "#4278E1",
      });
    }
  }

  async function remove(id) {
    const confirmation = await Swal.fire({
      title: "Supprimer ce partenaire ?",
      text: "Son logo sera également retiré du stockage.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#4278E1",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });
    if (!confirmation.isConfirmed) return;
    try {
      await send("/api/admin/partenaires", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setPartenaires((items) => items.filter((item) => item.id !== id));
      await Swal.fire({
        title: "Partenaire supprimé",
        text: "Le partenaire et son logo ont été retirés.",
        icon: "success",
        confirmButtonColor: "#4278E1",
      });
    } catch (deleteError) {
      console.error("[admin/partenaires] Suppression échouée:", deleteError);
      const message = "Nous n'avons pas pu supprimer ce partenaire. Veuillez réessayer.";
      setError(message);
      await Swal.fire({
        title: "Suppression impossible",
        text: message,
        icon: "error",
        confirmButtonColor: "#4278E1",
      });
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">Partenaires</h1>
        <p className="mt-1 text-[14px] text-ong-muted">Gérez les logos affichés dans la section de remerciements.</p>
      </div>
      <form ref={formRef} onSubmit={create} className="bg-white border border-ong-bordure rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-ong-bleu text-[18px]">Ajouter un partenaire</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="nom" required placeholder="Nom du partenaire" className="h-11 px-3 rounded-md border border-ong-bordure" />
          <input name="siteWeb" type="url" placeholder="https://exemple.com (optionnel)" className="h-11 px-3 rounded-md border border-ong-bordure" />
          <input name="logo" type="file" accept="image/jpeg,image/png" required className="h-11 px-3 rounded-md border border-ong-bordure text-[14px]" />
        </div>
        <label className="flex items-start gap-3 text-[14px]">
          <input name="consentementLogo" value="true" type="checkbox" required className="mt-1 h-4 w-4" />
          <span>Le partenaire autorise l&apos;affichage de son logo.</span>
        </label>
        <button disabled={saving} className="button disabled:opacity-60">{saving ? "Enregistrement..." : "Ajouter le partenaire"}</button>
        {message && <p role="status" className="text-ong-vert">{message}</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
      </form>
      <div className="bg-white border border-ong-bordure rounded-lg overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-[14px]">
          <thead><tr className="border-b border-ong-bordure text-ong-muted"><th className="px-5 py-3">Logo</th><th className="px-5 py-3">Nom</th><th className="px-5 py-3">Site web</th><th className="px-5 py-3">Ordre</th><th className="px-5 py-3">Visible</th><th className="px-5 py-3">Actions</th></tr></thead>
          <tbody>
            {partenaires.map((item, index) => (
              <tr key={item.id} className="border-b border-ong-bordure">
                <td className="px-5 py-3"><img src={item.logoUrl} alt="" className="h-12 w-24 object-contain" /></td>
                <td className="px-5 py-3 font-medium">{item.nom}</td>
                <td className="px-5 py-3">{item.siteWeb || "—"}</td>
                <td className="px-5 py-3"><div className="flex gap-2"><button type="button" disabled={index === 0} onClick={() => update(item.id, { ordre: item.ordre - 1 })} aria-label="Monter">↑</button><button type="button" disabled={index === partenaires.length - 1} onClick={() => update(item.id, { ordre: item.ordre + 1 })} aria-label="Descendre">↓</button></div></td>
                <td className="px-5 py-3"><button type="button" onClick={() => update(item.id, { visible: !item.visible })} className="text-ong-bleu">{item.visible ? "Masquer" : "Afficher"}</button></td>
                <td className="px-5 py-3"><button type="button" onClick={() => remove(item.id)} className="text-red-700">Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!partenaires.length && <p className="p-6 text-ong-muted">Aucun partenaire enregistré.</p>}
      </div>
    </div>
  );
}
