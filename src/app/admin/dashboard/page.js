import prisma from "@/lib/prisma";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

const STATUT_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  SOUMIS: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border border-yellow-200", label: "Soumis" },
  EN_VERIFICATION: { bg: "bg-blue-50", text: "text-blue-700", border: "border border-blue-200", label: "En vérification" },
  INSPECTE: { bg: "bg-purple-50", text: "text-purple-700", border: "border border-purple-200", label: "Inspecté" },
  VALIDE: { bg: "bg-green-50", text: "text-green-700", border: "border border-green-200", label: "Validé" },
  FICHE_GENEREE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border border-emerald-200", label: "Fiche générée" },
};

export default async function AdminDashboard() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalDons,
    enAttente,
    validesCeMois,
    fichesGenerees,
    validesMoisDernier,
    parStatut,
    parNature,
    donsRecents,
  ] = await Promise.all([
    prisma.don.count(),
    prisma.don.count({ where: { statut: { in: ["SOUMIS", "EN_VERIFICATION", "INSPECTE"] } } }),
    prisma.don.count({ where: { statut: { in: ["VALIDE", "FICHE_GENEREE"] }, validatedAt: { gte: startOfMonth } } }),
    prisma.don.count({ where: { statut: "FICHE_GENEREE" } }),
    prisma.don.count({ where: { statut: { in: ["VALIDE", "FICHE_GENEREE"] }, validatedAt: { gte: startOfPrevMonth, lte: endOfPrevMonth } } }),
    prisma.don.groupBy({ by: ["statut"], _count: { statut: true } }),
    prisma.don.groupBy({ by: ["nature"], _count: { nature: true } }),
    prisma.don.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { donateur: true } }),
  ]);

  const stats = [
    { label: "Total dons", value: totalDons, href: "/admin/dons" },
    { label: "En attente", value: enAttente, href: "/admin/dons?statut=SOUMIS" },
    { label: "Validés ce mois", value: validesCeMois, href: "/admin/dons?statut=VALIDE" },
    { label: "Attestations", value: fichesGenerees, href: "/admin/dons?statut=FICHE_GENEREE" },
  ];

  const tauxValidation = totalDons > 0 ? Math.round((validesCeMois / totalDons) * 100) : 0;
  const evolutionMoisDernier = validesMoisDernier > 0 ? Math.round(((validesCeMois - validesMoisDernier) / validesMoisDernier) * 100) : null;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-semibold text-ong-bleu text-[28px]">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/dons" className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-ong-bordure text-ong-bleu text-[13px] font-medium hover:bg-ong-fond transition-colors">
            <Icon name="list" fixedWidth />
            Voir les dons
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block bg-white border border-ong-bordure rounded-lg p-5 hover:border-ong-bleu transition-colors">
            <p className="text-[12px] text-ong-muted uppercase tracking-wider">{s.label}</p>
            <p className="mt-2 font-display font-semibold text-ong-bleu text-[30px]">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-ong-bordure rounded-lg p-5">
          <h2 className="font-display font-semibold text-ong-bleu text-[16px] mb-4">Performance</h2>
          <div className="space-y-3 text-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-ong-muted">Taux de validation</span>
              <span className="font-semibold text-ong-texte">{tauxValidation}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ong-muted">Évolution vs mois dernier</span>
              <span className={`font-semibold ${evolutionMoisDernier && evolutionMoisDernier >= 0 ? "text-ong-vert" : "text-red-600"}`}>
                {evolutionMoisDernier !== null ? `${evolutionMoisDernier > 0 ? "+" : ""}${evolutionMoisDernier}%` : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ong-muted">Dons en attente</span>
              <span className="font-semibold text-ong-texte">{enAttente}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-ong-bordure rounded-lg p-5">
          <h2 className="font-display font-semibold text-ong-bleu text-[16px] mb-4">Par statut</h2>
          <div className="space-y-2">
            {parStatut.map((item) => (
              <div key={item.statut} className="flex items-center justify-between text-[14px]">
                <span className="text-ong-muted">{STATUT_STYLES[item.statut]?.label || item.statut}</span>
                <span className="font-semibold text-ong-texte">{item._count.statut}</span>
              </div>
            ))}
            {!parStatut.length && <p className="text-[14px] text-ong-muted">Aucune donnée</p>}
          </div>
        </div>

        <div className="bg-white border border-ong-bordure rounded-lg p-5">
          <h2 className="font-display font-semibold text-ong-bleu text-[16px] mb-4">Par nature</h2>
          <div className="space-y-2">
            {parNature.map((item) => (
              <div key={item.nature} className="flex items-center justify-between text-[14px]">
                <span className="text-ong-muted">{item.nature}</span>
                <span className="font-semibold text-ong-texte">{item._count.nature}</span>
              </div>
            ))}
            {!parNature.length && <p className="text-[14px] text-ong-muted">Aucune donnée</p>}
          </div>
        </div>
      </div>

      <div className="bg-white border border-ong-bordure rounded-lg">
        <div className="px-6 py-4 border-b border-ong-bordure flex items-center justify-between">
          <h2 className="font-display font-semibold text-ong-bleu text-[18px]">Dernières demandes</h2>
          <Link href="/admin/dons" className="text-[13px] text-ong-bleu hover:underline font-medium">
            Voir tout
          </Link>
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
              {donsRecents.map((don) => {
                const style = STATUT_STYLES[don.statut] || { bg: "bg-gray-50", text: "text-gray-700", border: "border border-gray-200" };
                return (
                  <tr key={don.id} className="hover:bg-ong-fond">
                    <td className="px-6 py-3 font-mono text-[12px]">{don.reference}</td>
                    <td className="px-6 py-3">
                      {don.donateur.prenom} {don.donateur.nom}
                    </td>
                    <td className="px-6 py-3">{don.nature}</td>
                    <td className="px-6 py-3 text-ong-muted">
                      {don.createdAt.toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium ${style.bg} ${style.text} ${style.border}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <Link href={`/admin/dons/${don.id}`} className="text-ong-bleu hover:underline font-medium">
                        Voir
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
