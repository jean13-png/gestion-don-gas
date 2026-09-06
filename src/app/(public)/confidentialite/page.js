import Link from "next/link";

export default function ConfidentialitePage() {
  return (
    <section className="bg-ong-fond py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">
          Politique de confidentialité
        </h1>

        <div className="mt-8 space-y-8 text-[15px] text-ong-texte/85 leading-relaxed">
          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              1. Collecte des données
            </h2>
            <p>
              Nous collectons les données que vous nous fournissez directement via le formulaire
              de don : nom, prénom, email, téléphone, nature du don, description et localisation.
              Ces informations sont nécessaires au traitement de votre demande.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              2. Utilisation des données
            </h2>
            <p>
              Vos données sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Traiter votre don et générer une référence de suivi</li>
              <li>Vous contacter concernant l&apos;état de votre don</li>
              <li>Améliorer nos services et notre plateforme</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              3. Conservation des données
            </h2>
            <p>
              Vos données sont conservées pendant la durée nécessaire au traitement de votre don,
              puis archivées conformément aux obligations légales. Vous pouvez demander leur
              suppression à tout moment en nous contactant.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              4. Partage des données
            </h2>
            <p>
              Nous ne vendons ni ne partageons vos données personnelles avec des tiers, sauf
              obligation légale ou avec votre consentement explicite.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              5. Cookies
            </h2>
            <p>
              Ce site utilise des cookies techniques nécessaires à son fonctionnement.
              Aucun cookie de tracking ou publicitaire n&apos;est déposé sans votre consentement.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              6. Vos droits
            </h2>
            <p>
              Conformément à la réglementation sur la protection des données, vous disposez
              d&apos;un droit d&apos;accès, de rectification, d&apos;opposition et de suppression
              de vos données. Pour exercer ces droits, contactez-nous à{" "}
              <a href="mailto:infos@ongglobalactionsolidarite.com" className="text-ong-bleu underline">
                infos@ongglobalactionsolidarite.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              7. Contact
            </h2>
            <p>
              Pour toute question relative à cette politique, vous pouvez nous contacter via notre
              page{" "}
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
