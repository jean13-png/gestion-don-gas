import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

/* ---------------------------------------------------------------------------
 * AUTORISATIONS DES COMPTES
 * Chaque compte administrateur porte une liste d'autorisations (clés).
 * Un compte sans autorisation peut se connecter et consulter, mais n'agit pas.
 * ------------------------------------------------------------------------- */

export const PERMISSIONS = [
  { cle: "dons.creer", label: "Enregistrer de nouveaux dons" },
  { cle: "dons.modifier", label: "Modifier les dons (détails, photos, réponses)" },
  { cle: "dons.statuts", label: "Valider, refuser et changer les statuts des dons" },
  { cle: "dons.supprimer", label: "Supprimer des dons" },
  { cle: "dons.attestations", label: "Générer et envoyer les attestations" },
  { cle: "dons.export", label: "Exporter la liste des dons (Excel)" },
  { cle: "contenu.gerer", label: "Gérer les paramètres, les actions et les partenaires" },
  { cle: "comptes.gerer", label: "Créer et gérer les comptes" },
] as const;

export const CLES_PERMISSIONS: string[] = PERMISSIONS.map((p) => p.cle);

/** Vérifie qu'un compte détient une autorisation donnée. */
export function aPermission(
  admin: { permissions?: string[] | null } | null | undefined,
  cle: string,
): boolean {
  return Array.isArray(admin?.permissions) && (admin.permissions as string[]).includes(cle);
}

function getClientIpFromHeaders(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return headers.get("x-real-ip") || "unknown";
}

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("AUTH_REQUIRED");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.user.id as string },
  });

  if (!admin) {
    throw new Error("ADMIN_REQUIRED");
  }

  if (admin.actif === false) {
    throw new Error("ADMIN_INACTIF");
  }

  return admin;
}

/**
 * Exige une autorisation précise pour une action serveur.
 * Lève une erreur explicite si le compte ne la détient pas.
 */
export async function requirePermission(cle: string) {
  const admin = await requireAdmin();

  if (!aPermission(admin, cle)) {
    throw new Error(`PERMISSION_REFUSEE:${cle}`);
  }

  return admin;
}

/**
 * Version silencieuse pour les pages : renvoie le compte connecté
 * (ou null), sans lever, afin d'afficher un message d'accès refusé.
 */
export async function getAdminActuel() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials, req) => {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const ip = getClientIpFromHeaders(req.headers);
        const ipKey = `login-ip:${ip}`;
        const identityKey = `login-email:${email}`;

        if (!(await checkRateLimit(ipKey, LOGIN_WINDOW_MS, LOGIN_MAX_ATTEMPTS)) || !(await checkRateLimit(identityKey, LOGIN_WINDOW_MS, LOGIN_MAX_ATTEMPTS))) {
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { email },
        });

        if (!admin) {
          return null;
        }

        // Un compte désactivé ne peut plus se connecter.
        if (admin.actif === false) {
          return null;
        }

        const isValid = await bcrypt.compare(password, admin.passwordHash);

        if (!isValid) {
          return null;
        }

        await resetRateLimit(ipKey);
        await resetRateLimit(identityKey);

        return {
          id: admin.id,
          email: admin.email,
          name: admin.nom,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/connexion",
  },
  session: {
    strategy: "jwt",
  },
});
