import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function Footer() {
  return (
    <footer className="bg-ong-bleu text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center h-10 w-10 rounded-md bg-white/10 text-white font-display font-semibold">
                G
              </span>
              <span className="font-display font-semibold text-[17px]">
                ONG Global Actions Solidarité
              </span>
            </div>
            <p className="text-[14px] text-white/75 leading-relaxed">
              Projet Informatique Pour Tous (PIPT). Équiper les écoles du Bénin
              en matériel informatique grâce à la solidarité de partenaires
              engagés.
            </p>
            <ul className="mt-6 space-y-2 text-[14px] text-white/80">
              <li className="flex items-start gap-2">
                <Icon name="location-dot" className="mt-1 text-ong-vert" />
                <span>Abomey-Calavi, République du Bénin</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="envelope" className="mt-1 text-ong-vert" />
                <a href="mailto:contact@pipt-ong-gas.bj" className="hover:underline">
                  contact@pipt-ong-gas.bj
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="phone" className="mt-1 text-ong-vert" />
                <span>+229 00 00 00 00</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-[15px] mb-4">
              Plateforme
            </h3>
            <ul className="space-y-2 text-[14px] text-white/80">
              <li>
                <Link href="/don" className="hover:text-white">
                  Soumettre un don
                </Link>
              </li>
              <li>
                <Link href="/suivi" className="hover:text-white">
                  Suivre ma demande
                </Link>
              </li>
              <li>
                <Link href="/#types-de-dons" className="hover:text-white">
                  Types de dons acceptés
                </Link>
              </li>
              <li>
                <Link href="/#comment-ca-marche" className="hover:text-white">
                  Processus de vérification
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-[15px] mb-4">
              L&apos;ONG
            </h3>
            <ul className="space-y-2 text-[14px] text-white/80">
              <li>
                <Link href="/a-propos" className="hover:text-white">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-white">
                  Statut légal
                </Link>
              </li>
              <li>
                <Link href="/a-propos" className="hover:text-white">
                  Transparence financière
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-[12px] text-white/65">
            © {new Date().getFullYear()} ONG Global Actions Solidarité. Tous droits réservés.
          </p>
          <p className="text-[12px] text-white/65">
            Récépissé n° 123/2024 — IFU 3201987654001 — Conforme aux dispositions de la loi 2020-37
          </p>
        </div>
      </div>
    </footer>
  );
}
