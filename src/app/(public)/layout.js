import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import CookieConsent from "@/components/public/CookieConsent";

export const metadata = {
  description:
    "Plateforme officielle de l'ONG Global Actions Solidarité : soumettez votre don en ligne et suivez son affectation à la santé, à l'éducation et à l'amélioration des conditions de vie.",
  alternates: { canonical: "/" },
};

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
}
