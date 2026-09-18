import Icon from "@/components/ui/Icon";
import Link from "next/link";

export default function AProposPage() {
  return (
    <section className="bg-ong-fond py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">
          À propos de l&apos;ONG-GAS
        </h1>

        <div className="mt-10 space-y-12">
          <div className="overflow-hidden rounded-lg border border-ong-bordure bg-white shadow-sm">
            <div className="grid md:grid-cols-[1.15fr_0.85fr]">
              <div className="p-8">
                <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-4">
                  Notre mission
                </h2>
                <p className="text-[15px] text-ong-texte leading-relaxed">
                  L'ONG Global Actions Solidarité (ONG-GAS) est une organisation à but non lucratif, créée en 2019. Notre mission est de donner à chaque enfant les compétences numériques de base dès la maternelle. Susciter l’éveil scientifique et technologique chez les apprenants des écoles maternelles, primaires et secondaires tout en les amenant à se familiariser et à maîtriser l’outil informatique durant leur cursus scolaire. À travers le
                  Projet Informatique Pour Tous (PIPT), nous collectons, vérifons et acheminons du
                  matériel informatique et pédagogique vers les établissements scolaires de maternelle,
                  primaire et secondaire.
                </p>
                <p className="mt-4 text-[15px] text-ong-texte leading-relaxed">
                  Notre approche repose sur trois principes : transparence totale du donateur au
                  bénéficiaire, vérification systématique sur site, et accompagnement technique des
                  équipes éducatives pour garantir une utilisation durable des équipements.
                </p>
              </div>

              <div className="relative min-h-[260px] bg-ong-bleu-tres-clair">
                <img
                  src="/images/eleves-mignons-cours-informatique_13339-284350.avif"
                  alt="Des élèves en cours d'informatique"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[rgba(66,120,225,0.22)] to-transparent" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-ong-bordure rounded-lg p-6">
              <h2 className="font-display font-semibold text-ong-bleu text-[18px] mb-4">
                Informations officielles
              </h2>
              <dl className="space-y-3 text-[14px]">
                <div className="flex items-start gap-3">
                  <Icon name="building" className="text-ong-bleu mt-0.5" />
                  <div>
                    <dt className="text-ong-muted">Statut</dt>
                    <dd className="text-ong-texte font-medium">Organisation à but non lucratif</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="map-pin" className="text-ong-bleu mt-0.5" />
                  <div>
                    <dt className="text-ong-muted">Siège</dt>
                    <dd className="text-ong-texte font-medium">Abomey-Calavi</dd>
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
                  <Icon name="calendar" className="text-ong-bleu mt-0.5" />
                  <div>
                    <dt className="text-ong-muted">Année de création</dt>
                    <dd className="text-ong-texte font-medium">2019</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="bg-white border border-ong-bordure rounded-lg p-6">
              <h2 className="font-display font-semibold text-ong-bleu text-[18px] mb-4">
                Nos engagements
              </h2>
              <ul className="space-y-3 text-[14px] text-ong-texte">
                <li className="flex items-start gap-2">
                  <Icon name="circle-check" className="text-ong-vert mt-0.5" />
                  <span>Vérification systématique des dons sur site avant intégration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="circle-check" className="text-ong-vert mt-0.5" />
                  <span>Traçabilité complète via référence unique et attestation PDF.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="circle-check" className="text-ong-vert mt-0.5" />
                  <span>Accompagnement technique et maintenance du matériel installé.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="circle-check" className="text-ong-vert mt-0.5" />
                  <span>Transparence financière et publication régulière des résultats.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white border border-ong-bordure rounded-lg p-8">
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-4">
              Le projet PIPT en chiffres
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="font-display font-semibold text-ong-bleu text-[32px]">2019</p>
                <p className="mt-1 text-[14px] text-ong-muted">Année de lancement</p>
              </div>
              <div>
                <p className="font-display font-semibold text-ong-bleu text-[32px]">100%</p>
                <p className="mt-1 text-[14px] text-ong-muted">Vérification terrain</p>
              </div>
              <div>
                <p className="font-display font-semibold text-ong-bleu text-[32px]">48h</p>
                <p className="mt-1 text-[14px] text-ong-muted">Délai moyen de traitement</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-ong-bordure rounded-lg p-8">
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-4">
              Partenaires et reconnaissance
            </h2>
            <p className="text-[15px] text-ong-texte leading-relaxed">
              L'ONG-GAS collabore avec des écoles, établissements scolaires, entreprises et particuliers donateurs. La plateforme PIPT est le point de convergence de ces acteurs, garantissant un suivi fiable et officiel de chaque don.
            </p>
            <p className="mt-4 text-[15px] text-ong-texte leading-relaxed">
              Pour toute demande de partenariat ou d&apos;information institutionnelle, contactez-nous
              via la page{" "}
              <Link href="/contact" className="text-ong-bleu underline">
                Contact
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
