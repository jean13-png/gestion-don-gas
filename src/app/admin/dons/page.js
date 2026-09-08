import prisma from "@/lib/prisma";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

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
            {!dons.length ? (
              <tbody>
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-ong-muted">
                    Aucun don trouvé.
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {dons.map((don) => (
                  <tr key={don.id} className="border-b border-ong-bordure hover:bg-ong-fond">
                    <td className="px-6 py-4 font-medium">{don.reference}</td>
                    <td className="px-6 py-4">{don.donateur.prenom} {don.donateur.nom}</td>
                    <td className="px-6 py-4">{don.nature}</td>
                    <td className="px-6 py-4">{new Date(don.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium ${
                        don.statut === "Validé" ? "bg-ong-vert-pale text-ong-vert" :
                        don.statut === "En attente" ? "bg-ong-jaune-pale text-ong-jaune" :
                        "bg-ong-rouge-pale text-ong-rouge"
                      }`}>
                        {don.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/admin/dons/${don.id}`} className="text-ong-bleu hover:underline">
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
