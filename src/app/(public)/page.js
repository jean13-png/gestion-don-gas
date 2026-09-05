import Link from "next/link";
import Icon from "@/components/ui/Icon";
import TrackReferenceForm from "@/components/public/TrackReferenceForm";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CommentCaMarcheSection />
      <TypesDeDonsSection />
      <ImpactSection />
      <AProposSection />
      <CtaFinalSection />
    </>
  );
}

function HeroSection() {
  return (
    <section className="bg-ong-fond border-b border-ong-bordure">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-ong-bordure text-[12px] text-ong-muted">
              <span className="h-2 w-2 rounded-full bg-ong-vert" />
              Bénin · Abomey-Calavi · Projet actif depuis 2025
            </div>

            <h1 className="mt-5 font-display font-semibold text-ong-bleu">
              Des ordinateurs dans les écoles du Bénin, grâce à votre don.
            </h1>

            <p className="mt-5 text-[16px] text-ong-texte/85 max-w-xl leading-relaxed">
              L&apos;ONG-GAS équipe les écoles primaires, maternelles et secondaires
              en matériel informatique. Soumettez votre contribution et suivez
              son traitement terrain en temps réel.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/don"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-md bg-ong-bleu text-white text-[15px] font-medium hover:bg-ong-bleu-clair transition-colors"
              >
                <Icon name="hand-holding-heart" />
                Soumettre un don
              </Link>
              <Link
                href="/suivi"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-md border border-ong-bleu text-ong-bleu text-[15px] font-medium hover:bg-white transition-colors"
              >
                <Icon name="magnifying-glass" />
                Suivre ma demande
              </Link>
            </div>

            <dl className="mt-10 pt-6 border-t border-ong-bordure grid grid-cols-3 gap-6">
              <div>
                <dt className="text-[12px] text-ong-muted uppercase tracking-wider">
                  Dons traités
                </dt>
                <dd className="mt-1 font-display font-semibold text-ong-bleu text-[22px]">
                  128
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-ong-muted uppercase tracking-wider">
                  Écoles bénéficiaires
                </dt>
                <dd className="mt-1 font-display font-semibold text-ong-bleu text-[22px]">
                  14
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-ong-muted uppercase tracking-wider">
                  Vérification terrain
                </dt>
                <dd className="mt-1 font-display font-semibold text-ong-bleu text-[22px]">
                  100%
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white border border-ong-bordure rounded-lg p-6 sm:p-7">
              <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-ong-muted font-medium">
                <Icon name="circle-check" className="text-ong-vert" />
                Suivi de dossier
              </div>
              <h2 className="mt-3 font-display font-semibold text-ong-bleu text-[22px]">
                Consultez le statut de votre don
              </h2>
              <p className="mt-2 text-[14px] text-ong-muted">
                Entrez la référence qui vous a été remise lors de la soumission.
              </p>

              <TrackReferenceForm />

              <div className="my-5 flex items-center gap-3 text-[12px] text-ong-muted">
                <span className="flex-1 h-px bg-ong-bordure" />
                <span>ou</span>
                <span className="flex-1 h-px bg-ong-bordure" />
              </div>

              <Link
                href="/don"
                className="inline-flex w-full items-center justify-center gap-2 h-11 px-4 rounded-md border border-ong-bleu text-ong-bleu text-[14px] font-medium hover:bg-ong-fond transition-colors"
              >
                <Icon name="plus" />
                Soumettre un nouveau don
              </Link>

              <p className="mt-5 flex items-center gap-2 text-[12px] text-ong-muted">
                <Icon name="shield-halved" className="text-ong-vert" />
                Vos données ne sont utilisées que pour le traitement de votre don.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommentCaMarcheSection() {
  const etapes = [
    {
      titre: "Soumission",
      description:
        "Vous remplissez le formulaire en ligne avec la nature du don et vos coordonnées.",
    },
    {
      titre: "Référence unique",
      description:
        "Une référence GAS-2026-XXXXX vous est immédiatement remise par e-mail.",
    },
    {
      titre: "Inspection terrain",
      description:
        "Notre équipe se déplace pour vérifier le don sur le lieu indiqué.",
    },
    {
      titre: "Attestation PDF",
      description:
        "Une fiche officielle signée et tamponnée est générée et transmise.",
    },
  ];

  const timeline = [
    { label: "Soumis", etat: "done" },
    { label: "En vérification", etat: "done" },
    { label: "Inspecté", etat: "current" },
    { label: "Validé", etat: "todo" },
    { label: "Fiche générée", etat: "todo" },
  ];

  return (
    <section
      id="comment-ca-marche"
      className="bg-ong-fond py-20 lg:py-24 border-b border-ong-bordure"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display font-semibold text-ong-bleu">
            Comment ça marche
          </h2>
          <p className="mt-3 text-[16px] text-ong-texte/80">
            Quatre étapes, une traçabilité complète. Chaque don est suivi,
            inspecté et attesté.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <ol className="relative">
            <span
              aria-hidden="true"
              className="absolute left-[19px] top-3 bottom-3 w-px bg-ong-bordure"
            />
            {etapes.map((etape, i) => (
              <li key={etape.titre} className="relative pl-14 pb-8 last:pb-0">
                <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-ong-bleu text-white font-display font-semibold text-[15px]">
                  {i + 1}
                </span>
                <h3 className="font-display font-semibold text-ong-bleu text-[18px]">
                  {etape.titre}
                </h3>
                <p className="mt-1 text-[14px] text-ong-texte/80 max-w-md">
                  {etape.description}
                </p>
              </li>
            ))}
          </ol>

          <div className="bg-white border border-ong-bordure rounded-lg p-6">
            <div className="flex items-center justify-between pb-4 border-b border-ong-bordure">
              <div>
                <p className="text-[12px] text-ong-muted uppercase tracking-wider">
                  Référence
                </p>
                <p className="mt-1 font-display font-semibold text-ong-bleu text-[18px]">
                  GAS-2026-A1F4B
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ong-vert-pale text-ong-vert text-[12px] font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-ong-vert" />
                En cours
              </span>
            </div>

            <ol className="mt-5 space-y-4">
              {timeline.map((step, i) => (
                <li key={step.label} className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                      step.etat === "done"
                        ? "bg-ong-vert border-ong-vert text-white"
                        : step.etat === "current"
                          ? "bg-white border-ong-vert text-ong-vert"
                          : "bg-white border-ong-bordure text-ong-muted"
                    }`}
                  >
                    {step.etat === "done" ? (
                      <Icon name="check" className="text-[12px]" />
                    ) : (
                      <span className="text-[12px] font-medium">{i + 1}</span>
                    )}
                  </span>
                  <span
                    className={`text-[14px] ${
                      step.etat === "todo"
                        ? "text-ong-muted"
                        : "text-ong-texte font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.etat === "current" && (
                    <span className="ml-auto text-[12px] text-ong-vert font-medium">
                      En cours
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function TypesDeDonsSection() {
  return (
    <section
      id="types-de-dons"
      className="bg-white py-20 lg:py-24 border-b border-ong-bordure"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display font-semibold text-ong-bleu">
            Les dons que nous acceptons
          </h2>
          <p className="mt-3 text-[16px] text-ong-texte/80">
            Trois grandes catégories couvrent l&apos;essentiel des besoins des
            écoles. Chaque don est inspecté puis intégré à un laboratoire.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="md:col-span-2 border border-ong-bordure rounded-lg p-7 bg-ong-fond flex flex-col">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-ong-bleu text-white">
              <Icon name="laptop" className="text-[20px]" />
            </div>
            <h3 className="mt-5 font-display font-semibold text-ong-bleu text-[22px]">
              Matériel informatique
            </h3>
            <p className="mt-3 text-[15px] text-ong-texte/85 leading-relaxed flex-1">
              Ordinateurs, claviers, souris, câbles, imprimantes, projecteurs.
              Tout équipement en état de fonctionnement est le bienvenu pour
              équiper les laboratoires scolaires.
            </p>
            <Link
              href="/don"
              className="mt-6 inline-flex items-center gap-2 text-ong-bleu text-[14px] font-medium hover:text-ong-bleu-clair"
            >
              Proposer du matériel
              <Icon name="arrow-right" className="text-[12px]" />
            </Link>
          </article>

          <article className="border border-ong-bordure rounded-lg p-7 bg-ong-fond flex flex-col">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-ong-vert text-white">
              <Icon name="chalkboard-user" className="text-[20px]" />
            </div>
            <h3 className="mt-5 font-display font-semibold text-ong-bleu text-[20px]">
              Équipements pédagogiques
            </h3>
            <p className="mt-3 text-[14px] text-ong-texte/80 leading-relaxed flex-1">
              Tableaux intelligents, onduleurs, câblage réseau, accessoires
              périphériques. Ces équipements renforcent les infrastructures des
              salles informatiques.
            </p>
            <Link
              href="/don"
              className="mt-6 inline-flex items-center gap-2 text-ong-bleu text-[14px] font-medium hover:text-ong-bleu-clair"
            >
              Proposer un équipement
              <Icon name="arrow-right" className="text-[12px]" />
            </Link>
          </article>

          <article className="md:col-span-3 border border-ong-bordure rounded-lg p-7 bg-ong-bleu text-white flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div className="flex items-center justify-center h-14 w-14 rounded-md bg-white/10 text-white shrink-0">
              <Icon name="money-bill-wave" className="text-[22px]" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-[22px]">
                Don financier
              </h3>
              <p className="mt-2 text-[14px] text-white/80 leading-relaxed max-w-2xl">
                Votre apport monétaire permet d&apos;acheter du matériel ciblé,
                de financer la maintenance et d&apos;assurer la continuité des
                formations dans les écoles partenaires.
              </p>
            </div>
            <Link
              href="/don"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-md bg-ong-vert text-white text-[14px] font-medium hover:brightness-95 self-start md:self-auto"
            >
              Contribuer
              <Icon name="arrow-right" className="text-[12px]" />
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  const metrics = [
    {
      chiffre: "100%",
      label: "Vérification terrain",
      description: "Chaque don est inspecté physiquement par notre équipe.",
    },
    {
      chiffre: "48h",
      label: "Délai de traitement",
      description: "De la soumission à la prise en charge par l'équipe terrain.",
    },
    {
      chiffre: "PDF",
      label: "Attestation officielle",
      description: "Fiche signée, numérotée et transmise par e-mail.",
    },
  ];

  return (
    <section className="bg-ong-bleu py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display font-semibold text-white">
            Impact et transparence
          </h2>
          <p className="mt-3 text-[16px] text-white/75">
            Nous publions les engagements concrets que nous tenons sur chaque
            dossier.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="border-t border-white/15 pt-6 md:border-t-0 md:pt-0 md:border-l md:pl-8 first:border-l-0 first:pl-0"
            >
              <p className="font-display font-semibold text-ong-vert text-[44px] leading-none">
                {m.chiffre}
              </p>
              <p className="mt-3 text-white text-[15px] font-medium">
                {m.label}
              </p>
              <p className="mt-2 text-[13px] text-white/70 leading-relaxed">
                {m.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AProposSection() {
  const infos = [
    {
      icon: "building",
      label: "Statut légal",
      value: "ONG reconnue — Récépissé n° 123/2024",
    },
    {
      icon: "location-dot",
      label: "Siège",
      value: "Abomey-Calavi, département de l'Atlantique",
    },
    {
      icon: "envelope",
      label: "Contact officiel",
      value: "contact@pipt-ong-gas.bj",
    },
    {
      icon: "file-invoice",
      label: "Enregistrement",
      value: "IFU 3201987654001",
    },
  ];

  return (
    <section className="bg-ong-fond py-20 lg:py-24 border-b border-ong-bordure">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
          <h2 className="font-display font-semibold text-ong-bleu">
            À propos de l&apos;ONG
          </h2>
            <p className="mt-4 text-[16px] text-ong-texte/85 leading-relaxed">
              <strong className="text-ong-bleu">ONG Global Actions Solidarité</strong>{" "}
              est une organisation à but non lucratif béninoise qui conduit le
              Projet Informatique Pour Tous (PIPT). Notre mission : réduire la
              fracture numérique en milieu scolaire en équipant les
              établissements publics de laboratoires informatiques fonctionnels.
            </p>
            <p className="mt-4 text-[16px] text-ong-texte/85 leading-relaxed">
              Chaque contribution — matériel, logiciel ou financement —
              transite par une vérification terrain rigoureuse et donne lieu à
              une attestation officielle.
            </p>
            <Link
              href="/a-propos"
              className="mt-6 inline-flex items-center gap-2 text-ong-bleu text-[15px] font-medium hover:text-ong-bleu-clair"
            >
              Découvrir l&apos;ONG en détail
              <Icon name="arrow-right" className="text-[12px]" />
            </Link>
          </div>

          <div className="bg-white border border-ong-bordure rounded-lg divide-y divide-ong-bordure">
            {infos.map((info) => (
              <div
                key={info.label}
                className="flex items-start gap-4 p-5 first:rounded-t-lg last:rounded-b-lg"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ong-fond text-ong-bleu shrink-0">
                  <Icon name={info.icon} />
                </span>
                <div>
                  <p className="text-[12px] text-ong-muted uppercase tracking-wider">
                    {info.label}
                  </p>
                  <p className="mt-1 text-[15px] text-ong-texte font-medium">
                    {info.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaFinalSection() {
  return (
    <section className="bg-ong-vert-pale py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display font-semibold text-ong-bleu">
          Prêt à équiper une école ?
        </h2>
        <p className="mt-3 text-[16px] text-ong-texte/85">
          Soumettez votre don en quelques minutes. Notre équipe prend le relais
          sur le terrain.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/don"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md bg-ong-bleu text-white text-[15px] font-medium hover:bg-ong-bleu-clair transition-colors"
          >
            <Icon name="hand-holding-heart" />
            Soumettre un don
          </Link>
          <Link
            href="/suivi"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border border-ong-bleu text-ong-bleu text-[15px] font-medium hover:bg-white transition-colors"
          >
            <Icon name="magnifying-glass" />
            Suivre un don existant
          </Link>
        </div>
      </div>
    </section>
  );
}
