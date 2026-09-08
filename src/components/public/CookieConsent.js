"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const handleRefuse = () => {
    localStorage.setItem("cookie-consent", "refused");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-ong-bordure shadow-lg">
      <div className="container py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[14px] text-ong-texte leading-relaxed">
            Nous utilisons des cookies pour améliorer votre expérience sur ce site.
            En continuant, vous acceptez notre{" "}
            <Link href="/confidentialite" className="text-ong-bleu underline">
              politique de confidentialité
            </Link>
            .
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleAccept}
              className="cursor-pointer inline-flex items-center justify-center h-10 px-5 rounded-md bg-ong-bleu text-white text-[14px] font-medium hover:bg-ong-bleu-fonce transition-colors"
            >
              Accepter tout
            </button>
            <button
              type="button"
              onClick={handleRefuse}
              className="inline-flex items-center justify-center h-10 px-5 cursor-pointer rounded-md border border-ong-bordure text-ong-texte text-[14px] font-medium hover:bg-ong-gris-clair transition-colors"
            >
              Refuser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
