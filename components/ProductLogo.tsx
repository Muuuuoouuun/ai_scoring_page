"use client";

import { useState } from "react";

type ProductLogoProps = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const JOURNAL_LOGO_GRADIENTS = [
  ["#453c34", "#b08a52"],
  ["#675d53", "#d2c4b9"],
  ["#b08a52", "#453c34"],
  ["#d2c4b9", "#675d53"]
] as const;

const getPaletteIndex = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % JOURNAL_LOGO_GRADIENTS.length;
  }
  return Math.abs(hash);
};

export function ProductLogo({ name, size = "md" }: ProductLogoProps) {
  const [imgError, setImgError] = useState(false);

  const initials = getInitials(name);
  const [startColor, endColor] = JOURNAL_LOGO_GRADIENTS[getPaletteIndex(name)];
  const style = {
    background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
    color: startColor === "#d2c4b9" ? "#453c34" : "#fff8ef"
  };

  const LOCAL_LOGO_MAP: Record<string, string> = {
    Notion: "/images/logos/notion.png",
    Slack: "/images/logos/slack.svg"
  };

  const imageSrc = LOCAL_LOGO_MAP[name];

  if (!imgError && imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={`${name} logo`}
        className={`product-logo product-logo-${size}`}
        onError={() => setImgError(true)}
        style={{ objectFit: "contain", background: "#fff", padding: "4px" }}
      />
    );
  }

  return (
    <span className={`product-logo product-logo-${size}`} style={style} aria-label={`${name} logo`}>
      {initials}
    </span>
  );
}
