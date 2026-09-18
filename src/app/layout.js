import { Inter } from "next/font/google";
import ScrollReveal from "@/components/ui/ScrollReveal";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "ONG-GAS — PIPT | Plateforme de gestion des dons",
  description:
    "Plateforme officielle de l'ONG Global Actions Solidarité. Soumettez et suivez vos dons destinés à améliorer la santé, l'éducation et les conditions de vie des communautés.",
  keywords: ["ONG", "GAS", "dons", "donation", "éducation", "aide", "solidarité"],
  authors: [{ name: "ONG Global Actions Solidarité", url: "https://gestion-don-gas.vercel.app" }],
  openGraph: {
    title: "ONG-GAS — PIPT | Plateforme de gestion des dons",
    description:
      "Soumettez et suivez vos dons destinés à améliorer la santé, l'éducation et les conditions de vie des communautés. Plateforme officielle de l'ONG Global Actions Solidarité.",
    url: "https://gestion-don-gas.vercel.app",
    siteName: "ONG-GAS",
    images: ["/favicon.svg"],
    locale: "fr_FR",
    type: "website",
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
        <link rel="canonical" href="https://gestion-don-gas.vercel.app" />
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="ONG, GAS, dons, donation, éducation, aide, solidarité" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="ONG-GAS" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body className="min-h-screen flex flex-col bg-ong-fond text-ong-texte min-w-0">
        <ScrollReveal>{children}</ScrollReveal>
        <script type="application/ld+json">{`{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ONG Global Actions Solidarité",
          "url": "https://gestion-don-gas.vercel.app",
          "logo": "https://gestion-don-gas.vercel.app/favicon.svg",
          "contactPoint": [{ "@type": "ContactPoint", "email": "infos@ongglobalactionsolidarite.com", "contactType": "customer service", "availableLanguage": "fr" }]
        }`}</script>
      </body>
    </html>
  );
}
