import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Epilogue, Noto_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Gnb } from "@/components/Gnb";
import { JournalRail } from "@/components/JournalRail";
import { AppFooter } from "@/components/AppFooter";

import { GlobalBackgroundSVG } from "@/components/GlobalBackgroundSVG";

const display = Epilogue({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display-loaded",
  display: "swap"
});

const sans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-sans-loaded",
  display: "swap"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono-loaded",
  display: "swap"
});

export const metadata: Metadata = {
  title: brand.title,
  description: brand.description
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#171613" }
  ]
};

// Applies the stored theme before first paint so the page never flashes the wrong palette.
const themeBootstrap = `(function(){try{var s=localStorage.getItem('g2-theme');if(s==='light'||s==='dark'){document.documentElement.dataset.theme=s;}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          본문 바로가기
        </a>
        <GlobalBackgroundSVG />
        <CompareProvider>
            <Gnb />
            <JournalRail />
            {children}
            <AppFooter />
        </CompareProvider>
      </body>
    </html>
  );
}
