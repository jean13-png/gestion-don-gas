import prisma from "@/lib/prisma";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const totalDons = await prisma.don.count();
  const enAttente = await prisma.don.count({
    where: { statut: { in: ["SOUMIS", "EN_VERIFICATION", "INSPECTE"] } },
  });
  const validesCeMois = await prisma.don.count({
    where: {
      statut: { in: ["VALIDE", "FICHE_GENEREE"] },
      validatedAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });
  const fichesGenerees = await prisma.don.count({
    where: { statut: "FICHE_GENEREE" },
  });

  const donsRecents = await prisma.don.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { donateur: true },
  });

  const stats = [
    { label: "Total dons reçus", value: totalDons },
    { label: "En attente de vérification", value: enAttente },
    { label: "Validés ce mois", value: validesCeMois },
    { label: "Attestations générées", value: fichesGenerees },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="font-display font-semibold text-ong-bleu text-[28px]">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-ong-bordure rounded-lg p-5">
            <p className="text-[12px] text-ong-muted uppercase tracking-wider">{s.label}</p>
            <p className="mt-2 font-display font-semibold text-ong-bleu text-[30px]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white border border-ong-bordure rounded-lg">
        <div className="px-6 py-4 border-b border-ong-bordure">
          <h2 className="font-display font-semibold text-ong-bleu text-[18px]">Dernières demandes</h2>
        </div>
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
              {donsRecents.map((don) => (
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
