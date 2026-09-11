import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import TrackReferenceForm from "@/components/public/TrackReferenceForm";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let partenaires = [];
  try {
    partenaires = await prisma.partenaire.findMany({
      where: { visible: true, consentementLogo: true },
      orderBy: [{ ordre: "asc" }, { createdAt: "asc" }],
    });
  } catch (error) {
    console.error("[accueil] Partenaires indisponibles:", error);
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-ong-bleu-clair)] overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.78fr] gap-10 lg:gap-[65px] items-center py-14 lg:py-[55px]">
            <div>
              <p className="m-0 mb-3 text-[15px] font-semibold text-[var(--color-ong-bleu)]">
                ONG Global Actions Solidarité — Abomey-Calavi, Bénin
              </p>
            <h1 className="max-w-[640px] text-[clamp(34px,4vw,52px)] font-extrabold leading-[1.12] tracking-tight text-[var(--color-ong-texte)] uppercase">
              Pour la santé, l&apos;éducation et l&apos;amélioration des conditions de vie pour tous.
            </h1>
              <p className="mt-4 text-[16px] text-[var(--color-ong-texte)] max-w-[620px]">
                À travers ses projets, dont le Projet Informatique Pour Tous, l&apos;ONG-GAS agit
                auprès des enfants, des écoles et des familles du Bénin : dons de matériel
                scolaire et informatique, équipements, et appui aux communautés.
              </p>
              <div className="mt-7 flex flex-wrap gap-3.5">
                <Link href="/don" className="button button-outline">
                  Faire un don
                </Link>
                <Link href="/a-propos" className="button">
                  Découvrir le projet
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <Image
                src="/images/image-hero.avif"
                alt="Apprenants dans une salle de formation informatique"
                width={640}
                height={345}
                className="w-full h-[345px] object-cover rounded-[13px]"
                style={{ width: "100%", height: "345px" }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Actions de terrain */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Nos actions de terrain</h2>
            <p>Chaque don change concrètement le quotidien des enfants, des écoles et des familles que nous accompagnons.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              ["don-enfant.jpg", "La joie des enfants bénéficiaires"],
              ["don-sacs-scolaires.jpg", "Des sacs scolaires pour bien démarrer l'année"],
              ["don-tables-bancs.jpg", "Des salles de classe équipées"],
              ["don-habits.jpg", "Des vêtements pour les enfants"],
              ["don-informatique.jpg", "Du matériel informatique pour les écoles"],
            ].map(([image, title]) => (
              <figure key={image} className="overflow-hidden rounded-lg border border-ong-bordure bg-white">
                <img src={`/images/images-dons/${image}`} alt={title} loading="lazy" className="w-full h-56 object-cover" />
                <figcaption className="px-4 py-3 text-[15px] font-semibold text-ong-texte">{title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Présentation */}
      <section className="section">
        <div className="container presentation">
          <div className="presentation-image">
            <Image
              src="/images/enfant_en_pleine_etude.jpg"
              alt="Jeunes apprenants réunis autour d'un ordinateur"
              width={640}
              height={330}
              className="w-full h-[330px] object-cover rounded-lg"
              style={{ width: "100%", height: "330px" }}
            />
          </div>
          <div className="presentation-text">
            <h2 className="text-[31px] font-bold tracking-tight text-[var(--color-ong-texte)]">
              Un projet pour les écoles maternelles, primaires et secondaires
            </h2>
            <p className="text-[15px] text-[var(--color-ong-texte-secondaire)]">
              Le Projet Informatique Pour Tous vise à susciter l&apos;éveil scientifique
              et technologique des apprenants tout au long de leur parcours scolaire.
            </p>
            <p className="text-[15px] text-[var(--color-ong-texte-secondaire)]">
              Les équipements reçus sont contrôlés par l&apos;ONG-GAS avant leur intégration
              dans le programme. Les écoles bénéficient également d&apos;un accompagnement
              technique et de la maintenance du matériel mis à disposition.
            </p>
            <Link href="/a-propos" className="text-link">
              En savoir plus sur le projet
            </Link>
          </div>
        </div>
      </section>

      {/* Accès principaux */}
      <section className="section section-soft">
        <div className="container">
          <div className="section-heading">
            <h2>Une plateforme simple pour les donateurs et les partenaires</h2>
            <p>
              Soumettez un don, consultez l&apos;avancement d&apos;un dossier ou prenez contact
              avec l&apos;équipe du Projet Informatique Pour Tous.
            </p>
          </div>

          <div className="actions-grid">
            <article className="action-item">
              <div className="action-number">01</div>
              <div>
                <h3>Proposer un don</h3>
                <p>
                  Matériel informatique, mobilier, appui financier, maintenance
                  ou accompagnement logistique.
                </p>
                <Link href="/don">Ouvrir le formulaire</Link>
              </div>
            </article>

            <article className="action-item">
              <div className="action-number">02</div>
              <div>
                <h3>Suivre une demande</h3>
                <p>
                  Consultez le statut de votre don grâce à la référence reçue
                  au moment de la soumission.
                </p>
                <Link href="/suivi">Accéder au suivi</Link>
              </div>
            </article>

            <article className="action-item">
              <div className="action-number">03</div>
              <div>
                <h3>Devenir école partenaire</h3>
                <p>
                  Découvrez les conditions requises pour intégrer le programme
                  Informatique Pour Tous.
                </p>
                <Link href="/ecoles">Voir les conditions</Link>
              </div>
            </article>

            <article className="action-item">
              <div className="action-number">04</div>
              <div>
                <h3>Contacter l&apos;ONG-GAS</h3>
                <p>
                  Notre équipe est disponible pour répondre aux demandes
                  des donateurs, écoles et organisations partenaires.
                </p>
                <Link href="/contact">Nous contacter</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Dons acceptés */}
      <section className="section" id="dons">
        <div className="container">
          <div className="section-head">
            <h2>Ce que vous pouvez proposer</h2>
            <p>
              Particuliers, entreprises et organisations peuvent contribuer au projet.
            </p>
          </div>

          <div className="two-cols">
            <article className="card">
              <h3>Dons matériels</h3>
              <ul>
                <li>Ordinateurs, écrans, claviers, souris</li>
                <li>Imprimantes et vidéoprojecteurs</li>
                <li>Mobilier de salle informatique</li>
                <li>Onduleurs et accessoires</li>
              </ul>
            </article>

            <article className="card">
              <h3>Autres formes d&apos;appui</h3>
              <ul>
                <li>Don financier</li>
                <li>Appui technique</li>
                <li>Appui logistique</li>
                <li>Accompagnement de formation</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Suivi */}
      <section className="section alt" id="suivi">
        <div className="container">
          <div className="suivi-box">
            <h2>Suivre ma demande</h2>
            <p>
              Saisissez la référence reçue après votre soumission, par exemple GAS-2026-X89K2.
            </p>
            <TrackReferenceForm />
          </div>
        </div>
      </section>

      {partenaires.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.72fr] gap-10 items-center">
              <div>
                <div className="section-head text-left mx-0">
                  <h2>Nos sincères remerciements</h2>
                  <p>
                    Nos sincères remerciements aux entreprises et organisations qui soutiennent nos
                    actions sur le terrain. Leur confiance nous permet d&apos;aller plus loin, chaque
                    jour, pour les enfants et les familles du Bénin.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 items-center">
                  {partenaires.map((partenaire) => {
                    const logo = (
                      <img
                        src={partenaire.logoUrl}
                        alt={`Logo ${partenaire.nom}`}
                        loading="lazy"
                        className="h-20 w-full object-contain"
                      />
                    );
                    return partenaire.siteWeb ? (
                      <a key={partenaire.id} href={partenaire.siteWeb} target="_blank" rel="noopener noreferrer" aria-label={`Visiter le site de ${partenaire.nom}`}>
                        {logo}
                      </a>
                    ) : <div key={partenaire.id}>{logo}</div>;
                  })}
                </div>
              </div>
              <img
                src="/images/remerciementsp.jpg"
                alt="Partenaire remercié pour son soutien aux actions de l'ONG-GAS"
                loading="lazy"
                className="w-full h-72 object-cover rounded-lg border border-ong-bordure"
              />
            </div>
            <div className="mt-10">
              <div className="flex flex-wrap justify-center items-end gap-3 max-w-[960px] mx-auto">
                {[
                  ["amerique-nord.png", "Amérique du Nord"],
                  ["amerique-sud.png", "Amérique du Sud"],
                  ["europe.png", "Europe"],
                  ["afrique.png", "Afrique"],
                  ["asie.png", "Asie"],
                  ["oceanie.png", "Océanie"],
                ].map(([image, label]) => (
                  <img key={image} src={`/images/continents/${image}`} alt={label} loading="lazy" className="h-[110px] w-[145px] object-contain" />
                ))}
              </div>
              <p className="mt-3 text-center text-[16px] font-semibold text-ong-bleu">Une solidarité sans frontières.</p>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="cta" id="don">
        <div className="container cta-inner">
          <div>
            <h2>Vous souhaitez soutenir une école ?</h2>
            <p>La proposition de don se fait sans création de compte.</p>
          </div>
          <Link href="/don" className="button button-outline">
            Commencer la proposition
          </Link>
        </div>
      </section>
    </>
  );
}
