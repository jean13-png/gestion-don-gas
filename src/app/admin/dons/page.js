import prisma from "@/lib/prisma";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default async function AdminDonsPage() {
  const dons = await prisma.don.findMany({
    orderBy: { createdAt: "desc" },
    include: { donateur: true },
  });

  return (
    <div className="max-w-6xl">
      <h1 className="font-display font-semibold text-ong-bleu text-[28px]">Dons</h1>

      <div className="mt-6 bg-white border border-ong-bordure rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-ong-bordure text-ong-muted">
                <th className="px-6 py-3 font-medium">Référence</th>
                <th className="px-6 py-3 font-medium">Donateur</th>
                <th className="px-6 py-3 font-medium">Nature</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Statut</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ong-bordure">
              {dons.map((don) => (
                <tr key={don.id} className="hover:bg-ong-fond/50">
                  <td className="px-6 py-3 font-mono text-[12px]">{don.reference}</td>
                  <td className="px-6 py-3">
                    {don.donateur.prenom} {don.donateur.nom}
                  </td>
                  <td className="px-6 py-3">{don.nature}</td>
                  <td className="px-6 py-3 text-ong-muted">
                    {don.createdAt.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-ong-vert-pale text-ong-vert">
                      {don.statut}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/dons/${don.id}`}
                      className="text-ong-bleu hover:text-ong-bleu-clair font-medium"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
