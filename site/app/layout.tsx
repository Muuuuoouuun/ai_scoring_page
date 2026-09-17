import {waitUntil} from 'cloudflare:workers';
import {syncBatch} from '@/lib/source-sync';
import type { Metadata } from "next";
import "./globals.css";
import {getChatGPTUser} from './chatgpt-auth';
import {Provider} from '@/components/Provider';
import {Header,Footer,CompareDock} from '@/components/Shell';
import PerformanceDiagnostics from '@/components/PerformanceDiagnostics';

export const metadata: Metadata = {
  title: {default:'AIs — AI·SaaS 탐색과 활용',template:'%s | AIs'},
  description: "AI·SaaS·모델의 기능과 업데이트를 공식 출처로 확인하고 비교하세요. 사용자 경험과 개인 도구·구독 관리까지.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user=await getChatGPTUser();
  waitUntil(syncBatch().catch(e=>console.error('Source sync failed',e.message)));
  return (
    <html lang="ko">
      <body><Provider user={user?{name:user.fullName||'회원'}:null}><Header/>{children}<Footer/><CompareDock/><PerformanceDiagnostics/></Provider></body>
    </html>
  );
}
