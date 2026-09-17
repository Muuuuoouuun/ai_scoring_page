"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function AppFooter() {
  const { t } = useLanguage();
  return <footer>{t.footer}</footer>;
}
