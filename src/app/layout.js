import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "ONG-GAS — PIPT | Plateforme de gestion des dons",
  description:
    "Plateforme officielle du Projet Informatique Pour Tous (PIPT) de l'ONG Global Actions Solidarité. Soumettez et suivez vos dons destinés aux écoles du Bénin.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable} antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-ong-fond text-ong-texte">
        {children}
      </body>
    </html>
  );
}
