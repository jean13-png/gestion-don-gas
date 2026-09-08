import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { validateDon } from "@/app/actions/admin";
import { genererFicheReceptionDon } from "@/lib/pdf";
import { sendEmail } from "@/lib/mail";
import { uploadPhoto } from "@/app/actions/upload";
import Icon from "@/components/ui/Icon";
import path from "path";
import Supprimer from "./supprimer/Supprimer";

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
    await uploadPhoto(formData);
  }

  async function handleGeneratePDF(formData) {
    "use server";
    const naturePdf = NATURE_MAP[don.nature] || "AUTRES";
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
      faitA: don.localisation || "Abomey-Calavi",
      dateReception: don.validatedAt ? don.validatedAt.toLocaleDateString("fr-FR") : undefined,
      responsable: "e la plateforme",
    });

    const fichesDir = path.join(process.cwd(), "public", "uploads", "fiches");
    const fs = await import("fs");
    if (!fs.existsSync(fichesDir)) fs.mkdirSync(fichesDir, { recursive: true });
    const filename = `fiche-${don.reference}.pdf`;
    const filepath = path.join(fichesDir, filename);
    fs.writeFileSync(filepath, buffer);

    await prisma.don.update({
      where: { id: don.id },
      data: { ficheUrl: `/uploads/fiches/${filename}`, statut: "FICHE_GENEREE" },
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
                  <a href={don.ficheUrl} target="_blank" rel="noreferrer" className="text-ong-bleu underline">
                    Télécharger la fiche
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

        <form action={handleUploadPhoto} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
              Téléverser une photo (JPG/PNG/WEBP, max 5 MB)
            </label>
            <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="block w-full text-[13px] border p-2 rounded-lg border-slate-400 cursor-pointer text-ong-texte" />
          </div>
          <button type="submit" className="h-10 px-4 rounded-md border border-ong-bleu text-ong-bleu text-[14px] cursor-pointer font-medium hover:bg-ong-fond">
            Ajouter la photo
          </button>
        </form>

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
          Validation & Actions
        </h2>
        <form action={handleValidate} className="space-y-4">
          <div>
            <label htmlFor="observations" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
              Observations &
            </label>
            <textarea id="observations" name="observations" rows={3} className="w-full px-3 py-2.5 rounded-md border border-ong-bordure bg-white text-[15px]" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button disabled={don.statut === "VALIDE"} type="submit" 
              className="disabled:cursor-not-allowed h-11 uppercase px-5 rounded-md bg-ong-vert text-white cursor-pointer text-[14px] font-medium hover:brightness-95">
              {don.statut === "VALIDE" ? "Don validé" : "Valider le don"}
            </button>
            <button disabled={don.statut === "FICHE_GENEREE" || don.statut === "VALIDE"} type="submit" formAction={handleGeneratePDF} 
              className="h-11 px-5 disabled:cursor-not-allowed disabled:bg-gray-600 rounded-md uppercase bg-ong-bleu text-white text-[14px] font-medium cursor-pointer hover:bg-ong-bleu-fonce">
              {don.statut === "FICHE_GENEREE" || don.statut === "VALIDE" ? "FICHE GÉNÉRÉE" : "Générer la fiche de"}
            </button>
            {/* Pour la suppression d'un don */}
          </div>
        </form>
        <div className="mt-4">
          <Supprimer id={don.id} />
        </div>
        
      </div>
    </div>
  );
}
