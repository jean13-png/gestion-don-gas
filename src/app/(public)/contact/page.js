"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section className="bg-ong-fond py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">
          Contact
        </h1>
        <p className="mt-3 text-[15px] text-ong-texte/85">
          Une question sur un don, une demande de partenariat ou une demande d&apos;information ?
          L&apos;équipe ONG-GAS vous répond dans les meilleurs délais.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-8">
          <div className="space-y-6">
            <div className="bg-white border border-ong-bordure rounded-lg p-6">
              <h2 className="font-display font-semibold text-ong-bleu text-[16px] mb-4">
                Coordonnées officielles
              </h2>
              <dl className="space-y-3 text-[14px]">
                <div className="flex items-start gap-3">
                  <Icon name="building" className="text-ong-bleu mt-0.5" />
                  <div>
                    <dt className="text-ong-muted">Organisation</dt>
                    <dd className="text-ong-texte font-medium">ONG Global Actions Solidarité</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="map-pin" className="text-ong-bleu mt-0.5" />
                  <div>
                    <dt className="text-ong-muted">Adresse</dt>
                    <dd className="text-ong-texte font-medium">Abomey-Calavi, Bénin</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="phone" className="text-ong-bleu mt-0.5" />
                  <div>
                    <dt className="text-ong-muted">Téléphone</dt>
                    <dd className="text-ong-texte font-medium">+229 01 46 46 66 56</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="envelope" className="text-ong-bleu mt-0.5" />
                  <div>
                    <dt className="text-ong-muted">Email</dt>
                    <dd className="text-ong-texte font-medium">infos@ongglobalactionsolidarite.com</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="clock" className="text-ong-bleu mt-0.5" />
                  <div>
                    <dt className="text-ong-muted">Horaires</dt>
                    <dd className="text-ong-texte font-medium">Lun - Ven : 8h - 17h</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="bg-ong-bleu-tres-clair border border-ong-bordure rounded-lg p-6">
              <h2 className="font-display font-semibold text-ong-bleu text-[16px] mb-2">
                Urgence don ?
              </h2>
              <p className="text-[14px] text-ong-texte/85">
                Pour une demande liée à un don en cours, pensez à préciser votre référence
                <span className="font-mono text-ong-bleu font-semibold"> GAS-2026-XXXXX</span>.
              </p>
            </div>
          </div>

          <div className="bg-white border border-ong-bordure rounded-lg p-8">
            <h2 className="font-display font-semibold text-ong-bleu text-[18px] mb-6">
              Envoyez-nous un message
            </h2>

            {sent ? (
              <div className="bg-ong-vert-pale border border-ong-vert text-ong-vert text-[14px] px-4 py-3 rounded-md">
                Merci, votre message a bien été pris en compte. L&apos;équipe ONG-GAS vous répondra
                dans les meilleurs délais.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prenom" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                      Prénom
                    </label>
                    <input id="prenom" name="prenom" type="text" required className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert/30 focus:border-ong-vert" />
                  </div>
                  <div>
                    <label htmlFor="nom" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                      Nom
                    </label>
                    <input id="nom" name="nom" type="text" required className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert/30 focus:border-ong-vert" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input id="email" name="email" type="email" required className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert/30 focus:border-ong-vert" />
                </div>

                <div>
                  <label htmlFor="sujet" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                    Sujet
                  </label>
                  <select id="sujet" name="sujet" required className="w-full h-11 px-3 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert/30 focus:border-ong-vert">
                    <option value="">Sélectionner...</option>
                    <option value="DON">Question sur un don</option>
                    <option value="PARTENARIAT">Demande de partenariat</option>
                    <option value="ECOLE">École partenaire</option>
                    <option value="PRESSE">Presse / média</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-[12px] font-medium text-ong-muted uppercase tracking-wider mb-1.5">
                    Message
                  </label>
                  <textarea id="message" name="message" rows={5} required className="w-full px-3 py-2.5 rounded-md border border-ong-bordure bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-vert/30 focus:border-ong-vert" />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 px-6 rounded-md bg-ong-bleu text-white text-[14px] font-semibold hover:bg-ong-bleu-fonce transition-colors"
                >
                  Envoyer le message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
