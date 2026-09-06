import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-ong-bleu-clair)] pt-[52px]">
      <div className="container">
        <div className="flex flex-wrap items-center gap-6 mb-8">
          <img
            src="/images/logo-ong-gas.png"
            alt="Logo ONG-GAS"
            className="h-[70px] w-auto object-contain"
          />
          <img
            src="/images/logo-projet-ipt.png"
            alt="Logo Projet PIPT"
            className="h-[70px] w-auto object-contain"
          />
        </div>
      </div>

      <div className="container grid grid-cols-1 md:grid-cols-[1.2fr_0.85fr_1fr] gap-10 md:gap-[70px] pb-9">
        <div>
          <h3 className="m-0 mb-4 text-[18px] font-semibold !text-[var(--color-ong-bleu)]">
            ONG-GAS
          </h3>
          <p className="m-0 mb-2 text-[14px] text-[var(--color-ong-texte-vert)]">
            Global Actions Solidarité.
          </p>
          <p className="m-0 mb-2 text-[14px] text-[var(--color-ong-texte-vert)]">
            Projet Informatique Pour Tous : plateforme de gestion,
            de suivi et de traçabilité des dons.
          </p>
        </div>

        <div>
          <h3 className="m-0 mb-4 text-[18px] font-semibold !text-[var(--color-ong-bleu)]">
            Liens utiles
          </h3>
          <ul className="list-none m-0 p-0 space-y-2.5">
            <li>
              <Link href="/a-propos" className="text-[14px] text-[var(--color-ong-texte-vert)] hover:text-[var(--color-ong-bleu)] hover:underline">
                Le projet PIPT
              </Link>
            </li>
            <li>
              <Link href="/don" className="text-[14px] text-[var(--color-ong-texte-vert)] hover:text-[var(--color-ong-bleu)] hover:underline">
                Faire un don
              </Link>
            </li>
            <li>
              <Link href="/suivi" className="text-[14px] text-[var(--color-ong-texte-vert)] hover:text-[var(--color-ong-bleu)] hover:underline">
                Suivre une demande
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-[14px] text-[var(--color-ong-texte-vert)] hover:text-[var(--color-ong-bleu)] hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <a href="https://ongglobalactionsolidarite.com/" target="_blank" rel="noopener noreferrer" className="text-[14px] text-[var(--color-ong-texte-vert)] hover:text-[var(--color-ong-bleu)] hover:underline">
                Notre plateforme
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="m-0 mb-4 text-[18px] font-semibold !text-[var(--color-ong-bleu)]">
            Informations légales
          </h3>
          <ul className="list-none m-0 p-0 space-y-2.5">
            <li>
              <Link href="/mentions-legales" className="text-[14px] text-[var(--color-ong-texte-vert)] hover:text-[var(--color-ong-bleu)] hover:underline">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link href="/confidentialite" className="text-[14px] text-[var(--color-ong-texte-vert)] hover:text-[var(--color-ong-bleu)] hover:underline">
                Politique de confidentialité
              </Link>
            </li>
            <li>
              <Link href="/conditions-utilisation" className="text-[14px] text-[var(--color-ong-texte-vert)] hover:text-[var(--color-ong-bleu)] hover:underline">
                Conditions d&apos;utilisation
              </Link>
            </li>
              <li>
               <Link href="/connexion" className="text-[14px] text-[var(--color-ong-texte-vert)] hover:text-[var(--color-ong-bleu)] hover:underline">
                 Espace gestionnaire
               </Link>
             </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--color-ong-ligne)] py-5 text-center text-[13px] text-[var(--color-ong-muted)]">
        <div className="container">
          © 2026 ONG Global Actions Solidarité. Tous droits réservés.
          <span className="block mt-1 text-[12px]">
            Association immatriculée au Bénin — Abomey-Calavi — N° déclaration : 2025/ONG/GAS/001
          </span>
        </div>
      </div>
    </footer>
  );
}
