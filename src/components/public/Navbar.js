"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50">
      {/* Barre d'information */}
      <div className="bg-[var(--color-ong-bleu-clair)] border-b border-[var(--color-ong-bordure)] text-[12px] text-[var(--color-ong-texte)]">
        <div className="container flex flex-wrap justify-between gap-2 py-[7px]">
          <div>ONG Global Actions Solidarité · Abomey-Calavi, Bénin</div>
          <div>
            <a href="tel:+2290146466656" className="hover:underline">
              +229 01 46 46 66 56
            </a>
            &nbsp;|&nbsp;
            <a href="mailto:infos@ongglobalactionsolidarite.com" className="hover:underline">
              infos@ongglobalactionsolidarite.com
            </a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white">
        <div className="container flex items-center justify-between gap-4 min-h-[108px] py-5 lg:py-0">
          <a className="brand flex items-center gap-3" href="/" aria-label="Accueil ONG-GAS">
            <img
              src="/images/logo-ong-gas.png"
              alt="Logo ONG-GAS"
              className="h-[58px] w-[58px] object-contain border-2 border-[var(--color-ong-bleu)] bg-white"
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
            className="lg:hidden !text-[var(--color-ong-bleu)] text-[22px] p-2"
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
              className="w-full min-h-[45px] px-3.5 border border-[var(--color-ong-bordure)] outline-none text-[var(--color-ong-texte)] bg-white"
            />
            <button
              type="submit"
              aria-label="Lancer la recherche"
              className="w-[52px] border-0 text-white bg-[var(--color-ong-bleu)] cursor-pointer hover:bg-[var(--color-ong-bleu-fonce)]"
            >
              <Icon name="magnifying-glass" />
            </button>
          </form>

          <Link
            href="/don"
            className="hidden lg:flex items-center justify-center gap-2 min-h-[44px] px-3.5 bg-[var(--color-ong-bleu)] !text-white text-[14px] font-semibold hover:bg-[var(--color-ong-bleu-fonce)]"
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
              className="w-full min-h-[45px] px-3.5 border border-[var(--color-ong-bordure)] outline-none text-[var(--color-ong-texte)] bg-white"
            />
            <button
              type="submit"
              aria-label="Lancer la recherche"
              className="w-[52px] border-0 text-white bg-[var(--color-ong-bleu)] cursor-pointer hover:bg-[var(--color-ong-bleu-fonce)]"
            >
              <Icon name="magnifying-glass" />
            </button>
          </form>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-[var(--color-ong-bleu)] relative" aria-label="Navigation principale">
        <div className="container">
          <ul
            className={`${
              menuOpen ? "flex" : "hidden"
            } lg:flex flex-col lg:flex-row list-none m-0 p-0`}
          >
            <li>
              <Link href="/" className="block px-4 py-[13px] !text-white text-[13px] font-medium hover:bg-[var(--color-ong-bleu-fonce)]">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/a-propos" className="block px-4 py-[13px] !text-white text-[13px] font-medium hover:bg-[var(--color-ong-bleu-fonce)]">
                Le projet PIPT
              </Link>
            </li>
            <li>
              <Link href="/don" className="block px-4 py-[13px] !text-white text-[13px] font-medium hover:bg-[var(--color-ong-bleu-fonce)]">
                Faire un don
              </Link>
            </li>
            <li>
              <Link href="/suivi" className="block px-4 py-[13px] !text-white text-[13px] font-medium hover:bg-[var(--color-ong-bleu-fonce)]">
                Suivre ma demande
              </Link>
            </li>
            <li>
              <Link href="/ecoles" className="block px-4 py-[13px] !text-white text-[13px] font-medium hover:bg-[var(--color-ong-bleu-fonce)]">
                Écoles partenaires
              </Link>
            </li>
            <li>
              <Link href="/contact" className="block px-4 py-[13px] !text-white text-[13px] font-medium hover:bg-[var(--color-ong-bleu-fonce)]">
                Contact
              </Link>
            </li>
            <li>
              <a href="https://ongglobalactionsolidarite.com/" target="_blank" rel="noopener noreferrer" className="block px-4 py-[13px] !text-white text-[13px] font-medium hover:bg-[var(--color-ong-bleu-fonce)]">
                Notre plateforme
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
