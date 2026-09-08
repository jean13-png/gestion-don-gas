import prisma from "@/lib/prisma";
import AdminDonsPageClient from "./AdminDonsPageClient";

export const dynamic = "force-dynamic";

export default async function AdminDonsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialFilter = {
    search: typeof params.search === "string" ? params.search : "",
    statut: typeof params.statut === "string" ? params.statut : "ALL",
    nature: typeof params.nature === "string" ? params.nature : "ALL",
    periode: (typeof params.periode === "string" ? params.periode : "all") as "7j" | "30j" | "90j" | "12m" | "all",
    page: typeof params.page === "string" ? Number(params.page) : 1,
    limit: 20,
  };

  const initialData = await prisma.$transaction(async (tx) => {
    const where: Record<string, unknown> = {};

    if (initialFilter.search && initialFilter.search.trim()) {
      const q = initialFilter.search.trim();
      where.OR = [
        { reference: { contains: q, mode: "insensitive" } },
        { donateur: { nom: { contains: q, mode: "insensitive" } } },
        { donateur: { prenom: { contains: q, mode: "insensitive" } } },
        { donateur: { email: { contains: q, mode: "insensitive" } } },
      ];
    }

    if (initialFilter.statut && initialFilter.statut !== "ALL") {
      where.statut = initialFilter.statut;
    }

    if (initialFilter.nature && initialFilter.nature !== "ALL") {
      where.nature = initialFilter.nature;
    }

    if (initialFilter.periode && initialFilter.periode !== "all") {
      const now = new Date();
      let start: Date;
      switch (initialFilter.periode) {
        case "7j":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30j":
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90j":
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case "12m":
          start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          start = new Date(0);
      }
      where.createdAt = { gte: start };
    }

    const skip = ((initialFilter.page || 1) - 1) * initialFilter.limit;

    const [dons, total] = await Promise.all([
      tx.don.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: initialFilter.limit,
        include: { donateur: true },
      }),
      tx.don.count({ where }),
    ]);

    return {
      dons: dons.map((don) => ({
        id: don.id,
        reference: don.reference,
        nature: don.nature,
        statut: don.statut,
        createdAt: don.createdAt.toISOString(),
        donateur: {
          prenom: don.donateur.prenom,
          nom: don.donateur.nom,
          email: don.donateur.email,
        },
      })),
      total,
      page: initialFilter.page || 1,
      limit: initialFilter.limit,
      totalPages: Math.max(1, Math.ceil(total / initialFilter.limit)),
    };
  });

  return <AdminDonsPageClient initialData={initialData} />;
}
