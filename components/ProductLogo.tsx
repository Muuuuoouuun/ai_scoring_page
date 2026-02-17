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

const getHue = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return Math.abs(hash);
};

export function ProductLogo({ name, size = "md" }: ProductLogoProps) {
  const hue = getHue(name);
  const initials = getInitials(name);
  const style = {
    background: `linear-gradient(135deg, hsl(${hue} 75% 60%), hsl(${(hue + 48) % 360} 85% 52%))`
  };

  return (
    <span className={`product-logo product-logo-${size}`} style={style} aria-label={`${name} logo`}>
      {initials}
    </span>
  );
}
