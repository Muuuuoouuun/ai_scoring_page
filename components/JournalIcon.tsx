"use client";

import type { ReactNode } from "react";

export type JournalIconName =
  | "home"
  | "search"
  | "signals"
  | "method"
  | "compass"
  | "message"
  | "radar"
  | "spark"
  | "grid"
  | "shield"
  | "compare"
  | "ranking"
  | "github"
  | "archive";

const iconPaths: Record<JournalIconName, ReactNode> = {
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),
  signals: (
    <>
      <path d="M4 16c2.4-3.2 4.8-3.2 7.2 0s4.8 3.2 8.8 0" />
      <path d="M4 11c2.4-3.2 4.8-3.2 7.2 0s4.8 3.2 8.8 0" />
      <path d="M4 6c2.4-3.2 4.8-3.2 7.2 0s4.8 3.2 8.8 0" />
    </>
  ),
  method: (
    <>
      <path d="M5 5h14v14H5z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
      <path d="M8 17h7" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m15.5 8.5-2.1 5-4.9 2 2.1-5z" />
    </>
  ),
  message: (
    <>
      <path d="M5 6h14v9H8l-3 3z" />
      <path d="M8.5 9.5h7" />
      <path d="M8.5 12.5h4.5" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 12 18 7" />
      <path d="M12 4v3" />
      <path d="M20 12h-3" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v5" />
      <path d="M12 16v5" />
      <path d="M3 12h5" />
      <path d="M16 12h5" />
      <path d="m6.5 6.5 3 3" />
      <path d="m14.5 14.5 3 3" />
      <path d="m17.5 6.5-3 3" />
      <path d="m9.5 14.5-3 3" />
    </>
  ),
  grid: (
    <>
      <path d="M5 5h5v5H5z" />
      <path d="M14 5h5v5h-5z" />
      <path d="M5 14h5v5H5z" />
      <path d="M14 14h5v5h-5z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19 6v5c0 4.5-2.8 7.4-7 10-4.2-2.6-7-5.5-7-10V6z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  compare: (
    <>
      <path d="M7 7h11" />
      <path d="m15 4 3 3-3 3" />
      <path d="M17 17H6" />
      <path d="m9 14-3 3 3 3" />
    </>
  ),
  ranking: (
    <>
      <path d="M5 19V9" />
      <path d="M12 19V5" />
      <path d="M19 19v-7" />
      <path d="M4 19h16" />
    </>
  ),
  github: (
    <>
      <path d="M9 19c-4 1.2-4-2-5.5-2.5" />
      <path d="M15 22v-3.8c0-1 .4-1.7.9-2.1 3-.3 6.1-1.5 6.1-6.6 0-1.5-.5-2.7-1.4-3.7.1-.4.6-1.8-.2-3.8 0 0-1.2-.4-3.9 1.4A13.2 13.2 0 0 0 12 3c-1.3 0-2.6.2-3.6.4C5.7 1.6 4.5 2 4.5 2c-.8 2-.3 3.4-.2 3.8A5.2 5.2 0 0 0 3 9.5c0 5.1 3.1 6.3 6.1 6.6.4.3.8.9.8 1.8V22" />
    </>
  ),
  archive: (
    <>
      <path d="M4 6h16" />
      <path d="M5 6l1.2 14h11.6L19 6" />
      <path d="M8 6V4h8v2" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </>
  )
};

export function JournalIcon({
  name,
  className,
  decorative = true
}: {
  name: JournalIconName;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <svg
      aria-hidden={decorative}
      className={className}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {iconPaths[name]}
    </svg>
  );
}
