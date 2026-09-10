"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
            500
          </p>
          <h1 className="mt-5 text-[30px] lg:text-[40px] font-extrabold uppercase tracking-tight">
            Une erreur est survenue
          </h1>
          <p className="mt-4 text-[16px] leading-7 text-[var(--color-ong-texte-secondaire)]">
            Le service rencontre momentanément un problème. Réessayez ou
            revenez à l&apos;accueil.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center h-12 px-7 rounded-md bg-[var(--color-ong-bleu)] text-white text-[14px] font-semibold hover:bg-[var(--color-ong-bleu-fonce)] transition-colors"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-12 px-7 rounded-md border border-[var(--color-ong-bleu)] text-[var(--color-ong-bleu)] text-[14px] font-semibold hover:bg-[var(--color-ong-bleu-clair)] transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
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
