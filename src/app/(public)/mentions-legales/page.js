import Link from "next/link";

export default function MentionsLegalesPage() {
  return (
    <section className="bg-ong-fond py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">
          Mentions légales
        </h1>

        <div className="mt-8 space-y-8 text-[15px] text-ong-texte/85 leading-relaxed">
          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              1. Éditeur du site
            </h2>
            <p>
              Le site <strong>pipt-ong-gas.bj</strong> est édité par l&apos;ONG Global Actions Solidarité (ONG-GAS),
              association à but non lucratif immatriculée au Bénin.
            </p>
            <p className="mt-2">
              <strong>Adresse :</strong> Abomey-Calavi, Bénin<br />
              <strong>Téléphone :</strong> +229 01 46 46 66 56<br />
              <strong>Email :</strong> infos@ongglobalactionsolidarite.com
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              2. Hébergement
            </h2>
            <p>
              Le site est hébergé par un prestataire d&apos;hébergement dont les serveurs sont situés
              dans le respect des réglementations en vigueur.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              3. Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble des contenus présents sur ce site (textes, images, logos, vidéos, etc.)
              est la propriété exclusive de l&apos;ONG-GAS ou de ses partenaires. Toute reproduction,
              distribution ou utilisation sans autorisation écrite préalable est interdite.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              4. Données personnelles
            </h2>
            <p>
              Les données personnelles collectées sur ce site sont traitées conformément à notre{" "}
              <Link href="/confidentialite" className="text-ong-bleu underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              5. Responsabilité
            </h2>
            <p>
              L&apos;ONG-GAS s&apos;efforce de fournir des informations exactes et à jour sur ce site.
              Toutefois, elle ne peut garantir l&apos;exhaustivité ou l&apos;absence d&apos;erreurs.
              L&apos;utilisateur est invité à vérifier les informations publiées.
            </p>
          </div>

          <div>
            <h2 className="font-display font-semibold text-ong-bleu text-[20px] mb-3">
              6. Droit applicable
            </h2>
            <p>
              Les présentes mentions légales sont soumises au droit béninois. En cas de litige,
              les tribunaux compétents du Bénin seront seuls habilités à en connaître.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
