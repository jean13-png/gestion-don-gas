import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import CookieConsent from "@/components/public/CookieConsent";

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
