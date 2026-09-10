'use client'
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { signOutAction } from "@/app/actions/auth";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-ong-bordure flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-ong-bordure">
        <span className="font-display font-semibold text-ong-bleu">ONG-GAS Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <Link
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
        <Link
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
  );
}
