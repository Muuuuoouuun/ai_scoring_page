"use client";

import { getGenreLabel } from "@/lib/genres";
import type { ToolGenre } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

export function GenrePillList({ genres }: { genres: ToolGenre[] }) {
  const { lang } = useLanguage();

  return (
    <div className="genre-pill-list" aria-label={lang === "ko" ? "장르" : "Genres"}>
      {genres.map((genre) => (
        <span className={`genre-pill ${genre}`} key={genre}>
          {getGenreLabel(genre, lang)}
        </span>
      ))}
    </div>
  );
}
