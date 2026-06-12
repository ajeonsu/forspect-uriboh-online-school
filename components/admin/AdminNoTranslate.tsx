"use client";

import { useEffect } from "react";

/** Keep Chrome/Google Translate off admin UI to avoid hydration errors. */
export function AdminNoTranslate() {
  useEffect(() => {
    const html = document.documentElement;
    const prevLang = html.getAttribute("lang");
    html.classList.add("notranslate");
    html.setAttribute("translate", "no");

    let meta = document.querySelector('meta[name="google"][content="notranslate"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "google");
      meta.setAttribute("content", "notranslate");
      document.head.appendChild(meta);
    }

    return () => {
      html.classList.remove("notranslate");
      html.removeAttribute("translate");
      if (prevLang) html.setAttribute("lang", prevLang);
      if (created && meta?.parentNode) meta.parentNode.removeChild(meta);
    };
  }, []);

  return null;
}
