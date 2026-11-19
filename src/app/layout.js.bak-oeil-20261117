import { Inter } from "next/font/google";
import ScrollReveal from "@/components/ui/ScrollReveal";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://donongas.com"),
  title: {
    default: "ONG-GAS · PIPT | Plateforme de gestion des dons",
    template: "%s | ONG-GAS · PIPT",
  },
  description:
    "Plateforme officielle de l'ONG Global Actions Solidarité. Soumettez et suivez vos dons destinés à améliorer la santé, l'éducation et les conditions de vie des communautés.",
  keywords: [
    "ONG",
    "GAS",
    "PIPT",
    "dons",
    "donation",
    "don en ligne",
    "éducation",
    "aide",
    "solidarité",
  ],
  authors: [{ name: "ONG Global Actions Solidarité", url: "https://donongas.com" }],
  openGraph: {
    title: "ONG-GAS · PIPT | Plateforme de gestion des dons",
    description:
      "Soumettez et suivez vos dons destinés à améliorer la santé, l'éducation et les conditions de vie des communautés. Plateforme officielle de l'ONG Global Actions Solidarité.",
    url: "https://donongas.com",
    siteName: "ONG-GAS",
    images: [
      {
        url: "/images/og-dons.png",
        width: 1200,
        height: 630,
        alt: "ONG Global Actions Solidarité · Plateforme de gestion des dons",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ONG-GAS · PIPT | Plateforme de gestion des dons",
    description:
      "Soumettez et suivez vos dons destinés à améliorer la santé, l'éducation et les conditions de vie des communautés.",
    images: ["/images/og-dons.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
        <link rel="icon" href="/favicon-32.png" sizes="32x32" />
        <link rel="icon" href="/favicon-16.png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon-96.png" />
        <link rel="mask-icon" href="/favicon.svg" color="#1F4E79" />
      </head>
      <body className="min-h-screen flex flex-col bg-ong-fond text-ong-texte min-w-0">
        <ScrollReveal>{children}</ScrollReveal>
        <script type="application/ld+json">{`{
          "@context": "https://schema.org",
          "@type": "NGO",
          "name": "ONG Global Actions Solidarité",
          "alternateName": "ONG-GAS",
          "url": "https://donongas.com",
          "logo": "https://donongas.com/images/logo-ong-gas.png",
          "contactPoint": [{ "@type": "ContactPoint", "email": "infos@ongglobalactionsolidarite.com", "contactType": "customer service", "availableLanguage": "fr" }]
        }`}</script>
      </body>
    </html>
  );
}
