import type { ToolGenre } from "@/lib/types";
import type { Language } from "@/lib/i18n";

export const toolGenres: ToolGenre[] = ["ai", "it", "githubProject", "saas"];

export const genreMeta: Record<ToolGenre, {
  label: Record<Language, string>;
  summary: Record<Language, string>;
}> = {
  ai: {
    label: { ko: "AI", en: "AI" },
    summary: {
      ko: "생성형 AI, 코파일럿, 자동화 판단 보조",
      en: "Generative AI, copilots, and judgment support"
    }
  },
  it: {
    label: { ko: "IT", en: "IT" },
    summary: {
      ko: "운영, 보안, 내부 시스템, 기술 워크플로우",
      en: "Operations, security, internal systems, and technical workflows"
    }
  },
  githubProject: {
    label: { ko: "GitHub Project", en: "GitHub Project" },
    summary: {
      ko: "개발자 도구, 오픈소스, 코드 기반 프로젝트",
      en: "Developer tools, open source, and code-first projects"
    }
  },
  saas: {
    label: { ko: "SaaS", en: "SaaS" },
    summary: {
      ko: "팀 협업, 업무 관리, 구독형 생산성 도구",
      en: "Team collaboration, work management, and subscription software"
    }
  }
};

export const getGenreLabel = (genre: ToolGenre, language: Language) =>
  genreMeta[genre].label[language];
