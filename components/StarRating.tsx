"use client";

const STAR_PATH = "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z";

function StarRow({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <svg key={index} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d={STAR_PATH} />
        </svg>
      ))}
    </>
  );
}

export function StarRating({
  value,
  max = 5,
  size = "md",
  showValue = true,
  label
}: {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(max, value));
  const percent = (clamped / max) * 100;

  return (
    <span className={`star-rating star-rating-${size}`} role="img" aria-label={label ?? `${clamped.toFixed(1)} / ${max}`}>
      <span className="star-rating-track">
        <span className="star-rating-base">
          <StarRow count={max} />
        </span>
        <span className="star-rating-fill" style={{ width: `${percent}%` }}>
          <StarRow count={max} />
        </span>
      </span>
      {showValue ? <span className="star-rating-value">{clamped.toFixed(1)}</span> : null}
    </span>
  );
}
