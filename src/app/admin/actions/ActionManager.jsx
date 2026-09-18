"use client";

import { useRef, useState } from "react";
import Swal from "sweetalert2";

const MAX_VISIBLE_ACTIONS = 6;

export default function ActionManager({ initialActions }) {
  const formRef = useRef(null);
  const [actions, setActions] = useState(initialActions);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function send(url, options) {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Opération impossible.");
    return result;
  }

  async function create(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const form = event.currentTarget;

    try {
      const result = await send("/api/admin/actions", { method: "POST", body: new FormData(form) });
      setActions((items) => [...items, result].sort((a, b) => a.ordre - b.ordre));
      form.reset();
      setMessage("Action enregistrée.");
      await Swal.fire({
        title: "Action ajoutée",
        text: "L'action est maintenant visible sur la page d'accueil selon son statut.",
        icon: "success",
        confirmButtonColor: "#4278E1",
      });
    } catch (createError) {
      console.error("[admin/actions] Création échouée:", createError);
      const text = createError.message || "Nous n'avons pas pu enregistrer cette action.";
      setError(text);
      await Swal.fire({
        title: "Ajout impossible",
        text,
        icon: "error",
        confirmButtonColor: "#4278E1",
      });
    } finally {
      setSaving(false);
    }
  }

  async function update(id, changes) {
    try {
      const result = await send("/api/admin/actions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...changes }),
      });
      setActions((items) => items.map((item) => item.id === id ? result : item).sort((a, b) => a.ordre - b.ordre));
      await Swal.fire({
        title: "Mise à jour enregistrée",
        text: "Le statut ou l'ordre de l'action a été modifié.",
        icon: "success",
        confirmButtonColor: "#4278E1",
      });
    } catch (updateError) {
      console.error("[admin/actions] Modification échouée:", updateError);
      const text = updateError.message || "Nous n'avons pas pu modifier cette action.";
      setError(text);
      await Swal.fire({
        title: "Modification impossible",
        text,
        icon: "error",
        confirmButtonColor: "#4278E1",
      });
    }
  }

  async function remove(id) {
    const confirmation = await Swal.fire({
      title: "Supprimer cette action ?",
      text: "Elle disparaîtra de la page d'accueil.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#4278E1",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await send("/api/admin/actions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setActions((items) => items.filter((item) => item.id !== id));
      await Swal.fire({
        title: "Action supprimée",
        text: "L'action a bien été retirée de la page d'accueil.",
        icon: "success",
        confirmButtonColor: "#4278E1",
      });
    } catch (deleteError) {
      console.error("[admin/actions] Suppression échouée:", deleteError);
      const text = deleteError.message || "Nous n'avons pas pu supprimer cette action.";
      setError(text);
      await Swal.fire({
        title: "Suppression impossible",
        text,
        icon: "error",
        confirmButtonColor: "#4278E1",
      });
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">Nos actions</h1>
        <p className="mt-1 text-[14px] text-ong-muted">Gérez les actions visibles sur la page d'accueil. Le maximum est de {MAX_VISIBLE_ACTIONS} actions actives.</p>
      </div>

      <form ref={formRef} onSubmit={create} className="rounded-lg border border-ong-bordure bg-white p-6 space-y-4">
        <h2 className="font-semibold text-ong-bleu text-[18px]">Ajouter une action</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="titre" required placeholder="Titre de l'action" className="h-11 px-3 rounded-md border border-ong-bordure bg-white text-[14px]" />
          <label className="flex items-center gap-3 h-11 rounded-md border border-ong-bordure px-3 text-[14px] text-ong-texte">
            <input name="visible" type="checkbox" value="true" defaultChecked className="h-4 w-4" />
            Publier immédiatement
          </label>
        </div>
        <textarea name="description" rows={4} placeholder="Description de l'action (optionnel)" className="w-full rounded-md border border-ong-bordure bg-white px-3 py-2.5 text-[14px]" />
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp" required className="h-11 w-full rounded-md border border-ong-bordure bg-white px-3 text-[14px]" />
        <button type="submit" disabled={saving} className="button disabled:opacity-60">{saving ? "Enregistrement..." : "Ajouter l'action"}</button>
        {message && <p role="status" className="text-ong-vert">{message}</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
      </form>

      <div className="rounded-lg border border-ong-bordure bg-white overflow-x-auto">
        <table className="min-w-[900px] w-full text-left text-[14px]">
          <thead>
            <tr className="border-b border-ong-bordure text-ong-muted">
              <th className="px-5 py-3">Image</th>
              <th className="px-5 py-3">Titre</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Ordre</th>
              <th className="px-5 py-3">Statut</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((item, index) => (
              <tr key={item.id} className="border-b border-ong-bordure align-top">
                <td className="px-5 py-3"><img src={item.imageUrl} alt={item.titre} className="h-20 w-28 object-cover rounded-md border border-ong-bordure" /></td>
                <td className="px-5 py-3 font-medium">{item.titre}</td>
                <td className="px-5 py-3 max-w-md">{item.description || "—"}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button type="button" disabled={index === 0} onClick={() => update(item.id, { ordre: item.ordre - 1 })} aria-label="Monter" className="disabled:opacity-40">↑</button>
                    <button type="button" disabled={index === actions.length - 1} onClick={() => update(item.id, { ordre: item.ordre + 1 })} aria-label="Descendre" className="disabled:opacity-40">↓</button>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <button type="button" onClick={() => update(item.id, { visible: !item.visible })} className="text-ong-bleu">
                    {item.visible ? "Masquer" : "Afficher"}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <button type="button" onClick={() => remove(item.id)} className="text-red-700">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!actions.length && <p className="p-6 text-ong-muted">Aucune action enregistrée.</p>}
      </div>
    </div>
  );
}
