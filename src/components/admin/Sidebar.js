'use client'
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { signOutAction } from "@/app/actions/auth";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir le menu admin"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-md border border-ong-bordure bg-white text-ong-bleu shadow-sm lg:hidden"
      >
        <Icon name="bars" />
      </button>
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu admin"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
        />
      )}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,86vw)] flex-col border-r border-ong-bordure bg-white transition-transform duration-200 lg:z-30 lg:w-64 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
      <div className="flex h-16 items-center justify-between border-b border-ong-bordure px-5 sm:px-6">
        <span className="font-display font-semibold text-ong-bleu">ONG-GAS Admin</span>
        <button
          type="button"
          aria-label="Fermer le menu admin"
          onClick={() => setOpen(false)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ong-muted hover:bg-ong-fond lg:hidden"
        >
          <Icon name="xmark" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <Link
          onClick={() => setOpen(false)}
          href="/admin/dashboard"
          aria-current={isActive("/admin/dashboard") ? "page" : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-md border-l-4 text-[14px] font-medium transition-colors ${
            isActive("/admin/dashboard")
              ? "border-ong-bleu bg-ong-bleu-pale text-ong-bleu"
              : "border-transparent text-ong-texte hover:border-ong-bleu-pale hover:bg-ong-fond"
          }`}
        >
          <Icon name="gauge-high" />
          Dashboard
        </Link>
        <Link href="/admin/parametres" onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-md border-l-4 text-[14px] font-medium transition-colors ${isActive("/admin/parametres") ? "border-ong-bleu bg-ong-bleu-pale text-ong-bleu" : "border-transparent text-ong-texte hover:border-ong-bleu-pale hover:bg-ong-fond"}`}>
          <Icon name="gear" />
          Paramètres
        </Link>
        <Link href="/admin/historique" onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-md border-l-4 text-[14px] font-medium transition-colors ${isActive("/admin/historique") ? "border-ong-bleu bg-ong-bleu-pale text-ong-bleu" : "border-transparent text-ong-texte hover:border-ong-bleu-pale hover:bg-ong-fond"}`}>
          <Icon name="clock-rotate-left" />
          Historique
        </Link>
        <Link
          onClick={() => setOpen(false)}
          href="/admin/dons"
          aria-current={isActive("/admin/dons") ? "page" : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-md border-l-4 text-[14px] font-medium transition-colors ${
            isActive("/admin/dons")
              ? "border-ong-bleu bg-ong-bleu-pale text-ong-bleu"
              : "border-transparent text-ong-texte hover:border-ong-bleu-pale hover:bg-ong-fond"
          }`}
        >
          <Icon name="boxes-stacked" />
          Dons
        </Link>
        <Link
          onClick={() => setOpen(false)}
          href="/admin/partenaires"
          aria-current={isActive("/admin/partenaires") ? "page" : undefined}
          className={`flex items-center gap-3 px-3 py-2 rounded-md border-l-4 text-[14px] font-medium transition-colors ${
            isActive("/admin/partenaires")
              ? "border-ong-bleu bg-ong-bleu-pale text-ong-bleu"
              : "border-transparent text-ong-texte hover:border-ong-bleu-pale hover:bg-ong-fond"
          }`}
        >
          <Icon name="handshake" />
          Partenaires
        </Link>
      </nav>
      <div className="p-4 border-t border-ong-bordure">
        <form action={signOutAction}>
          <button type="submit" className="cursor-pointer flex items-center gap-3 w-full px-3 py-2 rounded-md text-[14px] font-medium text-red-600 hover:bg-red-50">
            <Icon name="right-from-bracket" />
            Déconnexion
          </button>
        </form>
      </div>
      </aside>
    </>
  );
}
