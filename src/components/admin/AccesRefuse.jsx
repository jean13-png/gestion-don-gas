import Link from "next/link";
import Icon from "@/components/ui/Icon";

/**
 * Message affiché quand le compte connecté ne détient pas l'autorisation
 * nécessaire pour consulter une page de l'administration.
 */
export default function AccesRefuse({ quoi = "cette page" }) {
  return (
    <div className="max-w-2xl">
      <div className="bg-white border border-ong-bordure rounded-lg p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Icon name="lock" />
        </div>
        <h1 className="font-display font-semibold text-ong-bleu text-[22px]">
          Accès non autorisé
        </h1>
        <p className="mt-2 text-[14px] text-ong-texte-secondaire">
          Votre compte ne permet pas d&apos;accéder à {quoi}. Demandez à un
          administrateur de vous accorder l&apos;autorisation nécessaire depuis
          la page Comptes.
        </p>
        <Link
          href="/admin/dashboard"
          className="mt-5 inline-flex h-10 items-center rounded-md bg-ong-bleu px-5 text-[14px] font-medium text-white transition-colors hover:bg-ong-bleu-fonce"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
