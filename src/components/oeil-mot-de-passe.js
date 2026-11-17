"use client";

import { useEffect } from "react";

/**
 * OEIL AFFICHER / MASQUER LE MOT DE PASSE
 * Equipe automatiquement tous les champs mot de passe de la page
 * d un petit bouton oeil : un clic affiche, un autre clic masque.
 */
export default function OeilMotDePasse() {
  useEffect(() => {
    const SVG_OEIL =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
    const SVG_BARRE =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

    if (!document.getElementById("pwd-eye-style")) {
      const style = document.createElement("style");
      style.id = "pwd-eye-style";
      style.textContent = [
        ".pwd-eye-wrap{position:relative;display:block;}",
        ".pwd-eye-wrap input{padding-right:44px !important;}",
        ".pwd-eye-btn{position:absolute;top:50%;right:12px;transform:translateY(-50%);display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:none;background:transparent;cursor:pointer;color:#6b7280;border-radius:6px;-webkit-tap-highlight-color:transparent;}",
        ".pwd-eye-btn:hover{color:#1f2937;background:rgba(15,23,42,.06);}",
        ".pwd-eye-btn:focus-visible{outline:2px solid #2563eb;outline-offset:1px;}",
      ].join("");
      document.head.appendChild(style);
    }

    const poserOeil = (champ) => {
      if (!champ || champ.getAttribute("data-oeil")) {
        return;
      }
      champ.setAttribute("data-oeil", "1");

      const enveloppe = document.createElement("span");
      enveloppe.className = "pwd-eye-wrap";
      if (champ.parentNode) {
        champ.parentNode.insertBefore(enveloppe, champ);
      }
      enveloppe.appendChild(champ);

      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = "pwd-eye-btn";
      bouton.setAttribute("aria-label", "Afficher le mot de passe");
      bouton.title = "Afficher le mot de passe";
      bouton.innerHTML =
        '<span class="icone-oeil" style="display:inline-flex;">' +
        SVG_OEIL +
        '</span><span class="icone-barre" style="display:none;">' +
        SVG_BARRE +
        "</span>";

      bouton.addEventListener("click", () => {
        const visible = champ.type === "password";
        champ.type = visible ? "text" : "password";
        const iconeOeil = bouton.querySelector(".icone-oeil");
        const iconeBarre = bouton.querySelector(".icone-barre");
        if (iconeOeil) {
          iconeOeil.style.display = visible ? "none" : "inline-flex";
        }
        if (iconeBarre) {
          iconeBarre.style.display = visible ? "inline-flex" : "none";
        }
        const libelle = visible
          ? "Masquer le mot de passe"
          : "Afficher le mot de passe";
        bouton.setAttribute("aria-label", libelle);
        bouton.title = libelle;
        champ.focus();
      });

      enveloppe.appendChild(bouton);
    };

    const poserTous = () => {
      const champs = document.querySelectorAll('input[type="password"]');
      champs.forEach(poserOeil);
    };

    poserTous();

    const observateur = new MutationObserver(() => {
      poserTous();
    });
    observateur.observe(document.body, { childList: true, subtree: true });

    return () => {
      observateur.disconnect();
    };
  }, []);

  return null;
}
