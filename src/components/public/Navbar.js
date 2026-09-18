"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="bg-[var(--color-ong-bleu-clair)] border-b border-[var(--color-ong-bordure)] text-[12px] text-[var(--color-ong-texte)]">
        <div className="container flex flex-wrap justify-between gap-2 py-[7px]">
          <div>ONG Global Actions Solidarité · Abomey-Calavi, Bénin</div>
          <div>
            <a href="tel:+2290146466656" className="transition-colors hover:text-[var(--color-ong-bleu)] hover:underline">
              +229 01 46 46 66 56
            </a>
            &nbsp;|&nbsp;
            <a href="mailto:infos@ongglobalactionsolidarite.com" className="transition-colors hover:text-[var(--color-ong-bleu)] hover:underline">
              infos@ongglobalactionsolidarite.com
            </a>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-50 bg-white shadow-sm shadow-slate-200/50">
        <header>
          <div className="container flex items-center justify-between gap-4 min-h-[108px] py-5 lg:py-0">
            <a className="brand flex items-center gap-3 transition-transform duration-200 hover:-translate-y-0.5" href="/" aria-label="Accueil ONG-GAS">
              <img
                src="/images/logo-ong-gas.png"
                alt="Logo ONG-GAS"
                className="h-[58px] w-[58px] object-contain border-2 border-[var(--color-ong-bleu)] bg-white shadow-sm transition-transform duration-200 hover:scale-[1.02]"
              />
              <div className="brand-text">
                <strong className="block text-[21px] font-extrabold text-[var(--color-ong-texte)] tracking-tight leading-tight">
                  ONG-GAS
                </strong>
                <span className="block max-w-[170px] text-[8px] font-semibold text-[var(--color-ong-texte-secondaire)] leading-tight uppercase">
                  Global Actions Solidarité
                  <br />
                  Projet Informatique Pour Tous
                </span>
              </div>
            </a>

            <button
              type="button"
              className="lg:hidden cursor-pointer !text-[var(--color-ong-bleu)] text-[22px] p-2 transition-transform duration-200 hover:scale-105"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <Icon name={menuOpen ? "xmark" : "bars"} />
            </button>

            <form className="hidden lg:flex justify-center flex-1 max-w-[420px] mx-auto" action="/recherche" method="get">
              <input
                type="search"
                name="q"
                placeholder="Que cherchez-vous...?"
                aria-label="Rechercher sur le site"
                className="w-full min-h-[45px] px-3.5 border border-[var(--color-ong-bordure)] outline-none text-[var(--color-ong-texte)] bg-white transition-all duration-200 focus:border-[var(--color-ong-bleu)] focus:ring-2 focus:ring-[var(--color-ong-bleu)]/20"
              />
              <button
                type="submit"
                aria-label="Lancer la recherche"
                className="w-[52px] border-0 text-white bg-[var(--color-ong-bleu)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-ong-bleu-fonce)] hover:shadow-md"
              >
                <Icon name="magnifying-glass" />
              </button>
            </form>

            <Link
              href="/don"
              className="hidden lg:flex items-center justify-center gap-2 min-h-[44px] px-3.5 bg-[var(--color-ong-bleu)] !text-white text-[14px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-ong-bleu-fonce)] hover:shadow-md"
            >
              <Icon name="hand-holding-heart" fixedWidth />
              Proposer un don
            </Link>
          </div>

          <div className="lg:hidden container pb-4">
            <form className="flex justify-center" action="/recherche" method="get">
              <input
                type="search"
                name="q"
                placeholder="Que cherchez-vous...?"
                aria-label="Rechercher sur le site"
                className="w-full min-h-[45px] px-3.5 border border-[var(--color-ong-bordure)] outline-none text-[var(--color-ong-texte)] bg-white transition-all duration-200 focus:border-[var(--color-ong-bleu)] focus:ring-2 focus:ring-[var(--color-ong-bleu)]/20"
              />
              <button
                type="submit"
                aria-label="Lancer la recherche"
                className="w-[52px] border-0 text-white bg-[var(--color-ong-bleu)] cursor-pointer transition-all duration-200 hover:bg-[var(--color-ong-bleu-fonce)] hover:shadow-md"
              >
                <Icon name="magnifying-glass" />
              </button>
            </form>
          </div>
        </header>

        <nav className="bg-[var(--color-ong-bleu)] relative" aria-label="Navigation principale">
          <div className="container">
            <ul
              className={`${
                menuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
              } overflow-hidden transition-all duration-300 ease-in-out lg:max-h-none lg:opacity-100 lg:flex lg:flex-row list-none m-0 p-0 flex-col`}
            >
              <li>
                <Link href="/" onClick={closeMenu} className="block px-4 py-[13px] !text-white text-[13px] font-medium transition-all duration-200 hover:bg-[var(--color-ong-bleu-fonce)] hover:translate-x-0.5">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/a-propos" onClick={closeMenu} className="block px-4 py-[13px] !text-white text-[13px] font-medium transition-all duration-200 hover:bg-[var(--color-ong-bleu-fonce)] hover:translate-x-0.5">
                  Le projet PIPT
                </Link>
              </li>
              <li>
               <Link href="/#actions" onClick={closeMenu} className="block px-4 py-[13px] !text-white text-[13px] font-medium transition-all duration-200 hover:bg-[var(--color-ong-bleu-fonce)] hover:translate-x-0.5">
                 Nos actions
               </Link>
              </li>
              <li>
                <Link href="/don" onClick={closeMenu} className="block px-4 py-[13px] !text-white text-[13px] font-medium transition-all duration-200 hover:bg-[var(--color-ong-bleu-fonce)] hover:translate-x-0.5">
                  Faire un don
                </Link>
              </li>
              <li>
                <Link href="/suivi" onClick={closeMenu} className="block px-4 py-[13px] !text-white text-[13px] font-medium transition-all duration-200 hover:bg-[var(--color-ong-bleu-fonce)] hover:translate-x-0.5">
                  Suivre ma demande
                </Link>
              </li>
              <li>
                <Link href="/contact" onClick={closeMenu} className="block px-4 py-[13px] !text-white text-[13px] font-medium transition-all duration-200 hover:bg-[var(--color-ong-bleu-fonce)] hover:translate-x-0.5">
                  Contact
                </Link>
              </li>
              <li>
                <a href="https://ongglobalactionsolidarite.com/" target="_blank" rel="noopener noreferrer" onClick={closeMenu} className="block px-4 py-[13px] !text-white text-[13px] font-medium transition-all duration-200 hover:bg-[var(--color-ong-bleu-fonce)] hover:translate-x-0.5">
                  Notre plateforme
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  );
}
