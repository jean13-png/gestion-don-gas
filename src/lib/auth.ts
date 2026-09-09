import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

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

  return admin;
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
