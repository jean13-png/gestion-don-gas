import Link from "next/link";

export const metadata = {
  title: "Page introuvable — ONG-GAS",
  description: "La page demandée n'existe pas.",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--color-ong-fond)] text-[var(--color-ong-texte)] flex flex-col">
      <header className="bg-[var(--color-ong-bleu-clair)] border-b border-[var(--color-ong-bordure)]">
        <div className="container flex items-center min-h-[108px] py-5">
          <Link href="/" aria-label="Retour à l'accueil ONG-GAS">
            <img
              src="/images/logo-ong-gas.png"
              alt="Logo ONG-GAS"
              className="h-[58px] w-[58px] object-contain border-2 border-[var(--color-ong-bleu)] bg-white"
            />
          </Link>
        </div>
      </header>

      <section className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[620px] text-center">
          <p className="text-[var(--color-ong-bleu)] text-[72px] leading-none font-extrabold tracking-tight">
            404
          </p>
          <h1 className="mt-5 text-[30px] lg:text-[40px] font-extrabold uppercase tracking-tight">
            Page introuvable
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-[var(--color-ong-texte-secondaire)]">
            Cette page n&apos;existe pas ou a été déplacée. Retournez à
            l&apos;accueil pour poursuivre votre navigation.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center mt-8 h-12 px-7 rounded-md bg-[var(--color-ong-bleu)] text-white text-[14px] font-semibold hover:bg-[var(--color-ong-bleu-fonce)] transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </section>

      <footer className="bg-[var(--color-ong-bleu-clair)] border-t border-[var(--color-ong-bordure)] py-6">
        <p className="container text-center text-[13px] text-[var(--color-ong-texte-secondaire)]">
          ONG-GAS — Global Actions Solidarité
        </p>
      </footer>
    </main>
  );
}
