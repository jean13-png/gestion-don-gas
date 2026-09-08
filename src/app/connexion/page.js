"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const credentialsError = ready && searchParams.get("error") === "CredentialsSignin";
  const displayError = credentialsError ? "Identifiants invalides." : error;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: true,
      callbackUrl: "/admin/dashboard",
    });

    if (result?.error) {
      setError("Identifiants invalides.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ong-fond)]">
      <header className="bg-[var(--color-ong-bleu-clair)]">
        <div className="container flex items-center justify-between gap-4 min-h-[108px] py-5">
          <a className="brand flex items-center gap-3" href="/" aria-label="Accueil ONG-GAS">
            <img
              src="/images/logo-ong-gas.png"
              alt="Logo ONG-GAS"
              className="h-[58px] w-[58px] object-contain border-2 border-[var(--color-ong-bleu)] bg-white"
            />
            <div className="brand-text">
              <strong className="block text-[21px] font-extrabold text-[var(--color-ong-texte)] tracking-tight leading-tight">
                ONG-GAS
              </strong>
              <span className="block max-w-[170px] text-[8px] font-semibold text-[var(--color-ong-texte-secondaire)] leading-tight uppercase">
                Global Actions Solidarité
                <br />
                Projet Informatique Pour Tous
              </span>
            </div>
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 lg:py-16">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-8">
            <h1 className="text-[34px] lg:text-[40px] font-extrabold text-[var(--color-ong-texte)] uppercase tracking-tight">
              Espace gestionnaire
            </h1>
            <p className="mt-3 text-[15px] text-[var(--color-ong-texte-secondaire)]">
              Connectez-vous pour accéder au back-office de la plateforme PIPT.
            </p>
          </div>

          <div className="bg-white border border-[var(--color-ong-bordure)] rounded-lg p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-[12px] font-medium text-[var(--color-ong-muted)] uppercase tracking-wider mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full h-12 px-4 rounded-md border border-[var(--color-ong-bordure)] bg-white text-[15px] text-[var(--color-ong-texte)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ong-bleu)]/20 focus:border-[var(--color-ong-bleu)] transition-colors"
                  placeholder="exemple@ong-gas.org"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[12px] font-medium text-[var(--color-ong-muted)] uppercase tracking-wider mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full h-12 px-4 rounded-md border border-[var(--color-ong-bordure)] bg-white text-[15px] text-[var(--color-ong-texte)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ong-bleu)]/20 focus:border-[var(--color-ong-bleu)] transition-colors"
                  placeholder="Votre mot de passe"
                />
              </div>

              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[13px] px-4 py-3 rounded-md">
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                className="cursor-pointer w-full h-12 px-6 rounded-md bg-[var(--color-ong-bleu)] text-white text-[14px] font-semibold hover:bg-[var(--color-ong-bleu-fonce)] transition-colors mt-2"
              >
                Se connecter
              </button>
            </form>

            <p className="mt-6 text-center text-[13px] text-[var(--color-ong-muted)]">
              Accès réservé aux gestionnaires autorisés.
            </p>
          </div>

          <p className="mt-6 text-center text-[13px] text-[var(--color-ong-muted)]">
            <a href="/" className="text-[var(--color-ong-bleu)] hover:underline">
              Retour à l&apos;accueil
            </a>
          </p>
        </div>
      </main>

      <footer className="bg-[var(--color-ong-bleu-clair)] pt-[52px]">
        <div className="container">
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <img
              src="/images/logo-ong-gas.png"
              alt="Logo ONG-GAS"
              className="h-[70px] w-auto object-contain"
            />
            <img
              src="/images/logo-projet-ipt.png"
              alt="Logo Projet PIPT"
              className="h-[70px] w-auto object-contain"
            />
          </div>
        </div>

        <div className="container grid grid-cols-1 md:grid-cols-[1.2fr_0.85fr_1fr] gap-10 md:gap-[70px] pb-9">
          <div>
            <h3 className="m-0 mb-4 text-[18px] font-semibold !text-[var(--color-ong-bleu)]">
              ONG-GAS
            </h3>
            <p className="m-0 mb-2 text-[14px] text-[var(--color-ong-texte)]">
              Global Actions Solidarité.
            </p>
            <p className="m-0 mb-2 text-[14px] text-[var(--color-ong-texte)]">
              Projet Informatique Pour Tous : plateforme de gestion,
              de suivi et de traçabilité des dons.
            </p>
          </div>

          <div>
            <h3 className="m-0 mb-4 text-[18px] font-semibold !text-[var(--color-ong-bleu)]">
              Liens utiles
            </h3>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li>
                <a href="/a-propos" className="text-[14px] text-[var(--color-ong-texte)] hover:text-[var(--color-ong-bleu)] hover:underline">
                  Le projet PIPT
                </a>
              </li>
              <li>
                <a href="/don" className="text-[14px] text-[var(--color-ong-texte)] hover:text-[var(--color-ong-bleu)] hover:underline">
                  Faire un don
                </a>
              </li>
              <li>
                <a href="/suivi" className="text-[14px] text-[var(--color-ong-texte)] hover:text-[var(--color-ong-bleu)] hover:underline">
                  Suivre une demande
                </a>
              </li>
              <li>
                <a href="/contact" className="text-[14px] text-[var(--color-ong-texte)] hover:text-[var(--color-ong-bleu)] hover:underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="m-0 mb-4 text-[18px] font-semibold !text-[var(--color-ong-bleu)]">
              Informations légales
            </h3>
            <ul className="list-none m-0 p-0 space-y-2.5">
              <li>
                <a href="/mentions-legales" className="text-[14px] text-[var(--color-ong-texte)] hover:text-[var(--color-ong-bleu)] hover:underline">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="/confidentialite" className="text-[14px] text-[var(--color-ong-texte)] hover:text-[var(--color-ong-bleu)] hover:underline">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="/conditions-utilisation" className="text-[14px] text-[var(--color-ong-texte)] hover:text-[var(--color-ong-bleu)] hover:underline">
                  Conditions d&apos;utilisation
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--color-ong-ligne)] py-5 text-center text-[13px] text-[var(--color-ong-muted)]">
          <div className="container">
            © 2026 ONG Global Actions Solidarité. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--color-ong-fond)]"><p className="text-[15px] text-[var(--color-ong-texte)]">Chargement...</p></div>}>
      <LoginForm />
    </Suspense>
  );
}
