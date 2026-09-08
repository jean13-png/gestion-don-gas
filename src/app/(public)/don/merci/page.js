"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Icon from "@/components/ui/Icon";

const STATUTS = ["SOUMIS", "EN_VERIFICATION", "INSPECTE", "VALIDE", "FICHE_GENEREE"];

function DonMerciContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [don, setDon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const captureRef = useRef(null);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }

    fetch(`/api/dons/${encodeURIComponent(reference)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Non trouvé");
        return res.json();
      })
      .then((data) => {
        setDon(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [reference]);

  useEffect(() => {
    if (!loading && reference && don) {
      Swal.fire({
        title: "Merci pour votre générosité !",
        html: `
          <p style="font-size:15px; color:#4A5568;">
            Votre don a bien été enregistré.<br/>
            Votre référence de suivi est :
          </p>
          <p style="font-size:22px; font-weight:700; color:#4278E1; margin-top:8px;">
            ${reference}
          </p>
        `,
        icon: "success",
        confirmButtonText: "Voir mon récapitulatif",
        confirmButtonColor: "#4278E1",
        background: "#ffffff",
        customClass: {
          popup: "rounded-lg shadow-lg",
        },
      });
    }
  }, [loading, reference, don]);

  async function handleCopy() {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      Swal.fire({
        title: "Référence copiée",
        text: "La référence a été copiée dans le presse-papiers.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDownloadPDF() {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`recu-don-${reference}.pdf`);
      Swal.fire({
        title: "PDF téléchargé",
        text: "Votre récapitulatif a été enregistré.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Erreur",
        text: "Impossible de générer le PDF.",
        icon: "error",
      });
    }
  }

  async function handleDownloadImage() {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `recu-don-${reference}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      Swal.fire({
        title: "Image téléchargée",
        text: "Votre récapitulatif a été enregistré.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Erreur",
        text: "Impossible de générer l'image.",
        icon: "error",
      });
    }
  }

  return (
    <section className="bg-ong-fond py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div ref={captureRef} className="bg-white border border-ong-bordure rounded-lg p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ong-vert text-white text-[22px]">
              <Icon name="circle-check" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-ong-bleu text-[24px]">
                Don enregistré avec succès
              </h1>
              <p className="mt-1 text-[15px] text-ong-texte/85">
                Merci pour votre générosité. Voici le récapitulatif de votre demande.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-[15px] text-ong-texte/85">Chargement...</p>
          ) : don ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-ong-bleu-tres-clair border border-ong-bordure rounded-md p-4">
                  <p className="text-[12px] text-ong-muted uppercase tracking-wider mb-1">
                    Référence de suivi
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[22px] font-semibold text-ong-bleu break-all">
                      {don.reference}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="cursor-pointer shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md border border-ong-bordure bg-white text-ong-bleu hover:bg-ong-bleu-tres-clair"
                      title="Copier la référence"
                    >
                      <Icon name={copied ? "circle-check" : "copy"} fixedWidth />
                    </button>
                  </div>
                  <p className="mt-2 text-[13px] text-ong-muted">
                    Vous pouvez saisir cette référence à tout moment sur la page{" "}
                    <a href={reference ? `/suivi?reference=${encodeURIComponent(reference)}` : "/suivi"} className="text-ong-bleu underline">
                      Suivre ma demande
                    </a>
                    .
                  </p>
                </div>

                <div className="bg-ong-bleu-tres-clair border border-ong-bordure rounded-md p-4">
                  <p className="text-[12px] text-ong-muted uppercase tracking-wider mb-1">
                    Statut actuel
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ong-vert-pale text-ong-vert text-[12px] font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-ong-vert" />
                    {don.statut}
                  </span>
                  <p className="mt-2 text-[13px] text-ong-muted">
                    Votre dossier est en cours de traitement par nos équipes.
                  </p>
                </div>
              </div>

              <div className="border border-ong-bordure rounded-lg overflow-hidden">
                <div className="bg-ong-bleu-tres-clair px-4 py-3 border-b border-ong-bordure">
                  <h2 className="font-display font-semibold text-ong-bleu text-[15px]">
                    Détails de la demande
                  </h2>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-[14px]">
                    <span className="text-ong-muted">Donateur</span>
                    <span className="text-ong-texte font-medium text-right">
                      {don.donateur.prenom} {don.donateur.nom}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-ong-muted">Email</span>
                    <span className="text-ong-texte font-medium">{don.donateur.email}</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-ong-muted">Téléphone</span>
                    <span className="text-ong-texte font-medium">{don.donateur.telephone}</span>
                  </div>
                  {don.donateur.organisme && (
                    <div className="flex justify-between text-[14px]">
                      <span className="text-ong-muted">Organisme</span>
                      <span className="text-ong-texte font-medium">{don.donateur.organisme}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[14px]">
                    <span className="text-ong-muted">Nature du don</span>
                    <span className="text-ong-texte font-medium">
                      {don.nature === "AUTRE" && don.natureAutre
                        ? don.natureAutre
                        : don.nature}
                    </span>
                  </div>
                  <div className="text-[14px]">
                    <span className="text-ong-muted">Description</span>
                    <p className="mt-1 text-ong-texte">{don.description}</p>
                  </div>
                  <div className="text-[14px]">
                    <span className="text-ong-muted">Localisation</span>
                    <p className="mt-1 text-ong-texte">{don.localisation}</p>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span className="text-ong-muted">Date de soumission</span>
                    <span className="text-ong-texte font-medium">
                      {new Date(don.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-ong-bordure rounded-lg overflow-hidden">
                <div className="bg-ong-bleu-tres-clair px-4 py-3 border-b border-ong-bordure">
                  <h2 className="font-display font-semibold text-ong-bleu text-[15px]">
                    Suivi de votre demande
                  </h2>
                </div>
                <div className="p-4">
                  <ol className="space-y-3">
                    {STATUTS.map((statut) => {
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
                            {statut}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-[13px] text-yellow-800">
                <Icon name="circle-info" className="text-yellow-600 mt-0.5" />
                <span>
                  Besoin de modifier les informations de votre don ? Contactez-nous à{" "}
                  <a href="mailto:infos@ongglobalactionsolidarite.com" className="underline">
                    infos@ongglobalactionsolidarite.com
                  </a>{" "}
                  en précisant votre référence <strong>{don.reference}</strong>.
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="bcursor-pointer inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md bg-ong-bleu text-white text-[14px] font-medium hover:bg-ong-bleu-fonce transition-colors"
                >
                  <Icon name="file-pdf" fixedWidth />
                  Télécharger le PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="cursor-pointer inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md border border-ong-bordure text-ong-bleu text-[14px] font-medium hover:bg-ong-bleu-tres-clair transition-colors"
                >
                  <Icon name="image" fixedWidth />
                  Capturer l&apos;image
                </button>
                <a
                  href={reference ? `/suivi?reference=${encodeURIComponent(reference)}` : "/suivi"}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-md border border-ong-bordure text-ong-bleu text-[14px] font-medium hover:bg-ong-bleu-tres-clair transition-colors"
                >
                  <Icon name="magnifying-glass" fixedWidth />
                  Suivre ma demande
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[15px] text-ong-texte mb-4">
                Aucun dossier trouvé pour cette référence.
              </p>
              <a
                href="/suivi"
                className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-ong-bleu text-white text-[14px] font-medium hover:bg-ong-bleu-fonce transition-colors"
              >
                Retour au suivi
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function DonMerciPage() {
  return (
    <Suspense fallback={<div className="bg-ong-fond py-16"><div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"><p className="text-[15px] text-ong-texte/85">Chargement...</p></div></div>}>
      <DonMerciContent />
    </Suspense>
  );
}
