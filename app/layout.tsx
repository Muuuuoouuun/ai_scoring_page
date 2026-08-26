import "./globals.css";
import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import { CompareProvider } from "@/components/CompareProvider";
import { Gnb } from "@/components/Gnb";
import { JournalRail } from "@/components/JournalRail";
import { AppFooter } from "@/components/AppFooter";

import { GlobalBackgroundSVG } from "@/components/GlobalBackgroundSVG";

export const metadata: Metadata = {
  title: brand.title,
  description: brand.description
};

/**
 * 폰트는 <link>로 브라우저가 직접 받습니다.
 *
 * 이전에는 CSS가 "Manrope"/"Epilogue"/"Pretendard"를 지정했지만 아무데서도 불러오지 않아
 * 전부 시스템 폰트로 조용히 폴백됐습니다. 한국어 사이트인데 한글 폰트 지정이 없었습니다.
 *
 * next/font/google도 시도했지만 한글 폰트 파일이 커서 빌드 중 다운로드가 타임아웃 나고도
 * 빌드는 "성공"으로 끝나며 폴백 폰트를 쓰는 문제가 있었습니다.
 * 빌드 환경 네트워크에 의존하지 않는 <link> 방식이 배포에서 더 안전합니다.
 *
 * Latin은 Epilogue/Manrope, 한글은 IBM Plex Sans KR이 받습니다.
 * unicode-range 덕분에 브라우저가 글자 단위로 필요한 파일만 내려받습니다.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Epilogue:wght@600;700;800&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
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
