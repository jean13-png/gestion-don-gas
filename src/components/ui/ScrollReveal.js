"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ScrollReveal({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) {
      return;
    }
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const nodes = document.querySelectorAll("main *, section, article, header, footer, nav");
      nodes.forEach((node) => {
        node.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    const targets = document.querySelectorAll(
      "main section, main article, main div, main form, main img, main a, main li, main p, main h1, main h2, main h3, main h4, main button",
    );

    targets.forEach((node, index) => {
      if (node.closest("script, style") || node.classList.contains("no-reveal")) {
        return;
      }
      node.classList.add("reveal-item");
      node.style.transitionDelay = `${(index % 12) * 60}ms`;
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, [pathname]);

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
