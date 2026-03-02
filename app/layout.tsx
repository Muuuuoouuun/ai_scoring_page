import "./globals.css";
import type { Metadata } from "next";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Gnb } from "@/components/Gnb";
import { AppFooter } from "@/components/AppFooter";

import { GlobalBackgroundSVG } from "@/components/GlobalBackgroundSVG";

export const metadata: Metadata = {
  title: "g2 | Judgment-led SaaS + AI Reviews",
  description: "Human-centered reviews of SaaS and AI tools, grounded in judgment and impact."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <GlobalBackgroundSVG />
        <LanguageProvider>
          <Gnb />
          {children}
          <AppFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
