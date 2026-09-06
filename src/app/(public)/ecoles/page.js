import Icon from "@/components/ui/Icon";

const ECOLES = [
  {
    nom: "École Primaire d&apos;Abomey-Calavi",
    niveau: "Primaire",
    effectif: "320 élèves",
    besoins: "Ordinateurs, vidéoprojecteurs, mobilier informatique",
    localisation: "Abomey-Calavi, Bénin",
    description:
      "Équipement en matériel informatique et pédagogique pour les classes de CE2 et CM1. Un accompagnement technique est prévu sur place pendant 6 mois.",
  },
  {
    nom: "Collège de Cotonou",
    niveau: "Secondaire",
    effectif: "580 élèves",
    besoins: "Laboratoire informatique, onduleurs, imprimantes",
    localisation: "Cotonou, Bénin",
    description:
      "Mise en place d&apos;un laboratoire informatique pour les élèves de 6e à 3e. Le collège dispose déjà d&apos;une salle dédiée en cours de réaménagement.",
  },
  {
    nom: "École de Porto-Novo",
    niveau: "Maternelle + Primaire",
    effectif: "210 élèves",
    besoins: "Manuels scolaires numériques, tables-bancs, matériel audio",
    localisation: "Porto-Novo, Bénin",
    description:
      "Fourniture de manuels scolaires et de tables-bancs pour la maternelle, ainsi que du matériel audio pour l&apos;éveil scientifique.",
  },
  {
    nom: "École de Parakou",
    niveau: "Primaire + Secondaire",
    effectif: "410 élèves",
    besoins: "Panneaux solaires, éclairage LED, ordinateurs",
    localisation: "Parakou, Bénin",
    description:
      "Installation de panneaux solaires pour l&apos;éclairage des salles de classe et équipement en ordinateurs pour le collège.",
  },
];

export default function EcolesPage() {
  return (
    <section className="bg-ong-fond py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">
          Écoles partenaires
        </h1>
        <p className="mt-3 text-[15px] text-ong-texte/85 max-w-3xl">
          Les dons collectés via la plateforme PIPT sont destinés aux écoles partenaires
          de l&apos;ONG-GAS à travers le Bénin. Chaque établissement est sélectionné
          selon des critères d&apos;éligibilité et de besoins urgents.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {ECOLES.map((ecole) => (
            <article key={ecole.nom} className="bg-white border border-ong-bordure rounded-lg overflow-hidden">
              <div className="bg-ong-bleu-tres-clair px-6 py-4 border-b border-ong-bordure">
                <h3 className="font-display font-semibold text-ong-bleu text-[18px]">
                  {ecole.nom}
                </h3>
                <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-ong-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="graduation-cap" fixedWidth />
                    {ecole.niveau}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="users" fixedWidth />
                    {ecole.effectif}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="map-pin" fixedWidth />
                    {ecole.localisation}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <p className="text-[14px] text-ong-texte/85 leading-relaxed">
                  {ecole.description}
                </p>
                <div>
                  <p className="text-[12px] text-ong-muted uppercase tracking-wider mb-1">
                    Besoins prioritaires
                  </p>
                  <p className="text-[14px] text-ong-texte font-medium">{ecole.besoins}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 bg-white border border-ong-bordure rounded-lg p-8 text-center">
          <h2 className="font-display font-semibold text-ong-bleu text-[20px]">
            Votre établissement peut rejoindre le programme
          </h2>
          <p className="mt-3 text-[14px] text-ong-texte/85 max-w-2xl mx-auto">
            Les écoles sont sélectionnées en fonction des besoins urgents, de la faisabilité
            technique et de l&apos;engagement des équipes éducatives. Pour toute candidature
            ou demande d&apos;information, contactez-nous.
          </p>
          <div className="mt-6">
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-md bg-ong-bleu text-white text-[14px] font-medium hover:bg-ong-bleu-fonce transition-colors"
            >
              <Icon name="envelope" fixedWidth />
              Contacter l&apos;ONG-GAS
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
