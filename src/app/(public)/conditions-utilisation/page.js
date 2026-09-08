import Link from "next/link";

export default function ConditionsUtilisationPage() {
  return (
    <section className="bg-ong-fond py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">
          Conditions d&apos;utilisation
        </h1>

        <div className="mt-8 space-y-8 text-[15px] text-ong-texte leading-relaxed">
          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              1. Objet
            </h2>
            <p>
              Les présentes conditions d&apos;utilisation régissent l&apos;accès et l&apos;utilisation
              de la plateforme PIPT de l&apos;ONG-GAS, dédiée à la gestion, au suivi et à la traçabilité
              des dons destinés aux écoles du Bénin.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              2. Acceptation des conditions
            </h2>
            <p>
              En accédant à ce site et en utilisant ses services, vous acceptez sans réserve les
              présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions,
              veuillez ne pas utiliser ce site.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              3. Services proposés
            </h2>
            <p>
              La plateforme permet aux donateurs de :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Soumettre une proposition de don</li>
              <li>Suivre l&apos;état de traitement de leur don via une référence unique</li>
              <li>Consulter les informations relatives au projet PIPT</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              4. Obligations de l&apos;utilisateur
            </h2>
            <p>
              L&apos;utilisateur s&apos;engage à fournir des informations exactes et complètes
              lors de la soumission d&apos;un don. Toute fausse déclaration pourra entraîner
              le rejet de la demande.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              5. Responsabilité
            </h2>
            <p>
              L&apos;ONG-GAS met tout en œuvre pour garantir la disponibilité et la fiabilité
              de la plateforme. Cependant, elle ne peut être tenue responsable des interruptions
              de service ou des pertes de données indépendantes de sa volonté.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              6. Modification des conditions
            </h2>
            <p>
              L&apos;ONG-GAS se réserve le droit de modifier les présentes conditions à tout moment.
              Les utilisateurs seront informés des changements significatifs.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              7. Contact
            </h2>
            <p>
              Pour toute question concernant ces conditions, contactez-nous via notre page{" "}
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
