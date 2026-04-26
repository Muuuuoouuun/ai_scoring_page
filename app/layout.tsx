import "./globals.css";
import type { Metadata } from "next";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Gnb } from "@/components/Gnb";
import { JournalRail } from "@/components/JournalRail";
import { AppFooter } from "@/components/AppFooter";
import { BottomDock } from "@/components/BottomDock";

import { GlobalBackgroundSVG } from "@/components/GlobalBackgroundSVG";

export const metadata: Metadata = {
  title: "TOPAI | Judgment-led SaaS + AI Reviews",
  description: "Human-centered reviews of SaaS and AI tools, grounded in judgment and impact."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <GlobalBackgroundSVG />
        <LanguageProvider>
          <Gnb />
          <JournalRail />
          {children}
          <AppFooter />
          <BottomDock />
        </LanguageProvider>
      </body>
    </html>
  );
}
