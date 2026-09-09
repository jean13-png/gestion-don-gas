import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import TrackReferenceForm from "@/components/public/TrackReferenceForm";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[var(--color-ong-bleu-clair)] overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.78fr] gap-10 lg:gap-[65px] items-center py-14 lg:py-[55px]">
            <div>
              <p className="m-0 mb-3 text-[15px] font-semibold text-[var(--color-ong-bleu)]">
                Avec le Projet Informatique Pour Tous,
              </p>
            <h1 className="max-w-[640px] text-[clamp(34px,4vw,52px)] font-extrabold leading-[1.12] tracking-tight text-[var(--color-ong-texte)] uppercase">
              L&apos;informatique à l&apos;école devient plus accessible.
            </h1>
              <p className="mt-4 text-[16px] text-[var(--color-ong-texte)] max-w-[620px]">
                ONG-GAS met en relation les donateurs, les établissements scolaires
                et les équipes de terrain afin d&apos;équiper les apprenants du Bénin
                en matériel informatique adapté.
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
