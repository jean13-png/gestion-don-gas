import prisma from "@/lib/prisma";
import Link from "next/link";

const PAGES = [
  { title: "Accueil", href: "/", keywords: ["accueil", "home", "ong", "association", "don"] },
  { title: "Le projet PIPT", href: "/a-propos", keywords: ["projet", "pipt", "mission", "association", "ong"] },
  { title: "Faire un don", href: "/don", keywords: ["don", "contribution", "aider", "soutenir", "participer"] },
  { title: "Suivre ma demande", href: "/suivi", keywords: ["suivi", "statut", "référence", "demande", "don"] },
  { title: "Écoles partenaires", href: "/ecoles", keywords: ["ecoles", "partenaires", "institutions", "éducation", "projet"] },
  { title: "Contact", href: "/contact", keywords: ["contact", "email", "message", "prise de contact", "intervention"] },
  { title: "Conditions d’utilisation", href: "/conditions-utilisation", keywords: ["conditions", "utilisation", "mentions", "règlement", "données"] },
  { title: "Politique de confidentialité", href: "/confidentialite", keywords: ["confidentialite", "vie privée", "données", "protection"] },
];

export const dynamic = "force-dynamic";

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default async function RecherchePage({ searchParams }) {
  const params = await searchParams;
  const q = typeof params?.q === "string" ? params.q.trim() : "";

  const result = q
    ? await prisma.don.findFirst({
        where: {
          OR: [
            { reference: { contains: q, mode: "insensitive" } },
            { donateur: { prenom: { contains: q, mode: "insensitive" } } },
            { donateur: { nom: { contains: q, mode: "insensitive" } } },
            { donateur: { email: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { donateur: true },
      })
    : null;

  const cleanedQuery = normalize(q);
  const pageMatches = q
    ? PAGES.filter((page) => {
        const haystack = `${page.title} ${page.keywords.join(" ")}`;
        return normalize(haystack).includes(cleanedQuery);
      })
    : [];

  return (
    <section className="bg-ong-fond py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-display font-semibold text-ong-bleu text-[30px]">
          Recherche
        </h1>

        <form action="/recherche" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Que cherchez-vous ?"
            className="flex-1 h-12 rounded-md border border-ong-bordure bg-white px-4 text-[15px] focus:outline-none focus:ring-2 focus:ring-ong-bleu focus:border-ong-bleu"
            aria-label="Rechercher sur le site"
          />
          <button
            type="submit"
            className="h-12 rounded-md bg-ong-bleu px-6 text-[14px] font-semibold text-white hover:bg-ong-bleu-fonce transition-colors"
          >
            Rechercher
          </button>
        </form>

        {!q ? (
          <p className="mt-6 text-[15px] text-ong-texte-secondaire">
            Saisissez un mot-clé, une référence de don ou un terme lié à la plateforme.
          </p>
        ) : (
          <div className="mt-8 space-y-6">
            {result && (
              <div className="rounded-lg border border-ong-bordure bg-white p-5">
                <p className="text-[12px] font-medium uppercase tracking-wide text-ong-muted">
                  Référence de don trouvée
                </p>
                <h2 className="mt-2 text-[22px] font-semibold text-ong-bleu">
                  {result.reference}
                </h2>
                <p className="mt-2 text-[14px] text-ong-texte">
                  Donateur : {result.donateur.prenom} {result.donateur.nom}
                </p>
                <Link
                  href={`/suivi?reference=${encodeURIComponent(result.reference)}`}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-ong-bleu px-5 text-[14px] font-medium text-white hover:bg-ong-bleu-fonce transition-colors"
                >
                  Ouvrir le suivi
                </Link>
              </div>
            )}

            {pageMatches.length > 0 && (
              <div className="rounded-lg border border-ong-bordure bg-white p-5">
                <h2 className="text-[18px] font-semibold text-ong-bleu">Pages pertinentes</h2>
                <ul className="mt-4 space-y-2">
                  {pageMatches.map((page) => (
                    <li key={page.href}>
                      <Link href={page.href} className="text-[15px] text-ong-texte hover:text-ong-bleu hover:underline">
                        {page.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!result && pageMatches.length === 0 && (
              <div className="rounded-lg border border-dashed border-ong-bordure bg-white p-6 text-center">
                <p className="text-[15px] text-ong-texte">
                  Aucun résultat pour <strong>{q}</strong>.
                </p>
                <p className="mt-2 text-[13px] text-ong-muted">
                  Essayez une référence de don (ex. GAS-2026-00A2F), un mot-clé ou un nom de page.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
