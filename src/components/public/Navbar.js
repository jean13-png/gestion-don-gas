import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-ong-bordure">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex items-center justify-center h-9 w-9 rounded-md bg-ong-bleu text-white font-display font-semibold">
            G
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display font-semibold text-ong-bleu text-[15px]">
              ONG-GAS
            </span>
            <span className="text-[11px] text-ong-muted uppercase tracking-wider">
              Projet PIPT
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/#comment-ca-marche"
            className="text-[14px] font-medium text-ong-texte hover:text-ong-bleu-clair transition-colors"
          >
            Comment ça marche
          </Link>
          <Link
            href="/#types-de-dons"
            className="text-[14px] font-medium text-ong-texte hover:text-ong-bleu-clair transition-colors"
          >
            Types de dons
          </Link>
          <Link
            href="/a-propos"
            className="text-[14px] font-medium text-ong-texte hover:text-ong-bleu-clair transition-colors"
          >
            À propos
          </Link>
          <Link
            href="/contact"
            className="text-[14px] font-medium text-ong-texte hover:text-ong-bleu-clair transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/don"
            className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-md bg-ong-vert text-white text-[14px] font-medium hover:brightness-95 transition"
          >
            <Icon name="hand-holding-heart" className="text-[14px]" />
            Faire un don
          </Link>
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-md border border-ong-bordure text-ong-bleu"
          >
            <Icon name="bars" />
          </button>
        </div>
      </div>
    </header>
  );
}
