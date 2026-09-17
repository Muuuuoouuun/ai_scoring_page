"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionary, type Dictionary, type Language } from "@/lib/i18n";

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("ko");

  useEffect(() => {
    const stored = localStorage.getItem("g2-language");
    if (stored === "ko" || stored === "en") {
      setLang(stored);
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang: (next: Language) => {
        setLang(next);
        localStorage.setItem("g2-language", next);
      },
      t: dictionary[lang]
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
