import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { validateDon, mettreAJourDonDetails } from "@/app/actions/admin";
import { genererFicheReceptionDon } from "@/lib/pdf";
import { sendEmail } from "@/lib/mail";
import { uploadPhoto } from "@/app/actions/upload";
import Icon from "@/components/ui/Icon";
import fs from "fs/promises";
import os from "os";
import path from "path";
import Supprimer from "./supprimer/Supprimer";
import GenererFicheButton from "./generer-fiche/GenererFicheButton";
import PhotoUploadForm from "./PhotoUploadForm";

const NATURE_MAP = {
  MATERIEL_INFORMATIQUE: "MATERIEL",
  EQUIPEMENT_PEDAGOGIQUE: "MATERIEL",
  DON_FINANCIER: "ESPECES",
  AUTRE: "AUTRES",
};

export const dynamic = "force-dynamic";

export default async function AdminDonDetailPage({ params }) {
  const { id } = await params;
  const don = await prisma.don.findUnique({
    where: { id },
    include: { donateur: true, photos: true },
  });

  if (!don) {
    redirect("/admin/dons");
  }

  async function handleValidate(formData) {
    "use server";
    const observations = formData.get("observations");
    await validateDon(don.id, observations);
  }

  async function handleUploadPhoto(formData) {
    "use server";
    formData.set("donId", don.id);
    return uploadPhoto(formData);
  }

  async function handleGeneratePDF(formData) {
    "use server";
    const naturePdf = NATURE_MAP[don.nature] || "AUTRES";
    const temporaryPhotos = await Promise.all(
      don.photos.slice(0, 4).map(async (photo, index) => {
        const response = await fetch(photo.url);
        if (!response.ok) {
          throw new Error(`Photo de preuve introuvable: ${photo.url}`);
        }
        const temporaryPath = path.join(
          os.tmpdir(),
          `don-${don.id}-photo-${index}`,
        );
        await fs.writeFile(temporaryPath, Buffer.from(await response.arrayBuffer()));
        return temporaryPath;
      }),
    );
    const buffer = await genererFicheReceptionDon({
      donateur: {
        nomRaisonSociale: [don.donateur.prenom, don.donateur.nom].filter(Boolean).join(" ") || undefined,
        representant: don.donateur.organisme || undefined,
        adresse: don.localisation || undefined,
        telephone: don.donateur.telephone,
        email: don.donateur.email,
      },
      nature: naturePdf,
      natureAutresDetail: don.nature === "AUTRE" ? don.natureAutre : undefined,
      description: don.description,
      objectif: don.objectif,
      objectifAutresDetail: don.objectif === "AUTRES" && don.objectifAutre ? don.objectifAutre : undefined,
      faitA: don.faitA || undefined,
      dateReception: don.dateReception ? don.dateReception.toLocaleDateString("fr-FR") : undefined,
      responsable: don.responsable || undefined,
      photosPreuves: temporaryPhotos,
    });

    const fiche = await put(
      `dons/${don.reference}/fiche-${don.reference}.pdf`,
      buffer,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: "application/pdf",
      },
    );

    await prisma.don.update({
      where: { id: don.id },
      data: { ficheUrl: fiche.url, statut: "FICHE_GENEREE" },
    });

    try {
      await sendEmail({
        to: don.donateur.email,
        subject: `Attestation PDF — Don ${don.reference}`,
        html: `
          <p>Bonjour ${don.donateur.prenom},</p>
          <p>Votre attestation officielle est disponible.</p>
          <p>Référence : ${don.reference}</p>
          <p>Cordialement,<br/>ONG Global Actions Solidarité</p>
        `,
      });
    } catch (emailError) {
      console.error("[admin] Email notification failed:", emailError);
    }

    redirect(`/admin/dons/${don.id}`);
  }

  async function handleUpdateDetails(formData) {
    "use server";
    await mettreAJourDonDetails(don.id, formData);
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-ong-bleu text-[28px]">
            Don {don.reference}
          </h1>
          <p className="mt-1 text-[13px] text-ong-muted">
            {don.donateur.prenom} {don.donateur.nom} — {don.nature}
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-ong-vert-pale text-ong-vert text-[12px] font-medium">
          {don.statut}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-ong-bordure rounded-lg p-6">
          <h2 className="font-display font-semibold text-ong-bleu text-[16px] mb-4">
            Informations du donateur
          </h2>
          <dl className="space-y-2 text-[13px]">
            <div>
              <dt className="text-ong-muted">Nom complet</dt>
              <dd className="text-ong-texte font-medium">
                {don.donateur.prenom} {don.donateur.nom}
              </dd>
            </div>
            {don.donateur.organisme && (
              <div>
                <dt className="text-ong-muted">Organisme</dt>
                <dd className="text-ong-texte font-medium">{don.donateur.organisme}</dd>
              </div>
            )}
            <div>
              <dt className="text-ong-muted">Email</dt>
              <dd className="text-ong-texte font-medium">{don.donateur.email}</dd>
            </div>
            <div>
              <dt className="text-ong-muted">Téléphone</dt>
              <dd className="text-ong-texte font-medium">{don.donateur.telephone}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white border border-ong-bordure rounded-lg p-6">
          <h2 className="font-display font-semibold text-ong-bleu text-[16px] mb-4">
            Détails du don
          </h2>
          <dl className="space-y-2 text-[13px]">
            <div>
              <dt className="text-ong-muted">Nature</dt>
              <dd className="text-ong-texte font-medium">{don.nature}</dd>
            </div>
            <div>
              <dt className="text-ong-muted">Description</dt>
              <dd className="text-ong-texte font-medium">{don.description}</dd>
            </div>
            <div>
              <dt className="text-ong-muted">Localisation</dt>
              <dd className="text-ong-texte font-medium">{don.localisation}</dd>
            </div>
            <div>
              <dt className="text-ong-muted">Date de soumission</dt>
              <dd className="text-ong-texte font-medium">
                {don.createdAt.toLocaleDateString("fr-FR")}
              </dd>
            </div>
            {don.ficheUrl && (
              <div>
                <dt className="text-ong-muted">Attestation PDF</dt>
                <dd>
                  <a
                    href={don.ficheUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-ong-bleu text-white text-[13px] font-medium hover:bg-ong-bleu-fonce transition-colors"
                  >
                    <Icon className="text-white" name="file-pdf" fixedWidth />
                    Voir / Télécharger la fiche
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-6 bg-white border border-ong-bordure rounded-lg p-6">
        <h2 className="font-display font-semibold text-blue-700 text-[16px] mb-4">
          Soumission des preuves
        </h2>

        {don.photos.length >= 4 ? (
          <p className="text-[13px] text-ong-muted">Limite de 4 photos atteinte.</p>
        ) : (
          <PhotoUploadForm action={handleUploadPhoto} existingCount={don.photos.length} />
        )}

        {don.photos.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {don.photos.map((photo) => (
              <div key={photo.id} className="aspect-video bg-ong-fond rounded-md border border-ong-bordure overflow-hidden">
                <img src={photo.url} alt={`Photo ${photo.id}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-white border border-ong-bordure rounded-lg p-6">
        <h2 className="font-display font-semibold text-ong-bleu text-[16px] mb-4">
          Détails de la fiche PDF
        </h2>
        <form action={handleUpdateDetails} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="objectif" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                Objectif du don
              </label>
              <select id="objectif" name="objectif" defaultValue={don.objectif} className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert">
                <option value="EDUCATION">Soutien à l&apos;éducation</option>
                <option value="AIDE_SOCIALE">Aide sociale / Humanitaire</option>
                <option value="FORMATION">Formation</option>
                <option value="AUTRES">Autres</option>
              </select>
            </div>
            {don.objectif === "AUTRES" && (
              <div>
                <label htmlFor="objectifAutre" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                  Préciser l&apos;objectif
                </label>
                <input id="objectifAutre" name="objectifAutre" type="text" defaultValue={don.objectifAutre || ""} className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
              </div>
            )}
            <div>
              <label htmlFor="responsable" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                Responsable
              </label>
              <input id="responsable" name="responsable" type="text" defaultValue={don.responsable || "HEDJE ZINSOU RAOUL"} className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
            </div>
            <div>
              <label htmlFor="faitA" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                Fait à (lieu)
              </label>
              <input id="faitA" name="faitA" type="text" defaultValue={don.faitA || "Abomey-Calavi"} placeholder="Ex : Abomey-Calavi" className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
            </div>
            <div>
              <label htmlFor="dateReception" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                Date de réception
              </label>
              <input id="dateReception" name="dateReception" type="date" defaultValue={don.dateReception ? don.dateReception.toISOString().split("T")[0] : new Date().toISOString().split("T")[0]} className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert focus:border-ong-vert" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="h-10 px-5 rounded-md border border-ong-bleu text-ong-bleu text-[14px] font-medium cursor-pointer hover:bg-ong-fond">
              Enregistrer les détails
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-white border border-ong-bordure rounded-lg p-6">
        <h2 className="font-display font-semibold text-ong-bleu text-[16px] mb-4">
          Validation & Actions
        </h2>
        <form action={handleValidate} className="space-y-4">
          <div>
            <label htmlFor="observations" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
              Observations
            </label>
            <textarea id="observations" name="observations" rows={3} className="w-full px-3 py-2.5 rounded-md border border-ong-bordure bg-white text-[15px]" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button disabled={don.statut === "VALIDE"} type="submit" 
              className="disabled:cursor-not-allowed h-11 uppercase px-5 rounded-md bg-ong-vert text-white cursor-pointer text-[14px] font-medium hover:brightness-95">
              {don.statut === "VALIDE" ? "Don validé" : "Valider le don"}
            </button>
            <GenererFicheButton don={don} formAction={handleGeneratePDF} />
          </div>
        </form>
        <div className="mt-4">
          <Supprimer id={don.id} />
        </div>
        
      </div>
    </div>
  );
}
