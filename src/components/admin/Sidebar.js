'use client'
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { signOutAction } from "@/app/actions/auth";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-ong-bordure flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-ong-bordure">
        <span className="font-display font-semibold text-ong-bleu">ONG-GAS Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <Link href="/admin/dashboard" className={`flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium ${pathname === "/admin/dashboard" ? "bg-ong-fond text-ong-bleu" : "text-ong-texte hover:bg-ong-fond"}`}>
          <Icon name="gauge-high" />
          Dashboard
        </Link>
        <Link href="/admin/dons" className={`flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium ${pathname === "/admin/dons" ? "bg-ong-fond text-ong-bleu" : "text-ong-texte hover:bg-ong-fond"}`}>
          <Icon name="boxes-stacked" />
          Dons
        </Link>
        <Link href="/admin/partenaires" className={`flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium ${pathname === "/admin/partenaires" ? "bg-ong-fond text-ong-bleu" : "text-ong-texte hover:bg-ong-fond"}`}>
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
