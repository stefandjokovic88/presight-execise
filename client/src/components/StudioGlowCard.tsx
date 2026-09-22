import type { CSSProperties, ReactNode } from "react";

interface StudioGlowCardProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Static rim by default; full glow activates on hover/focus. */
  quiet?: boolean;
  style?: CSSProperties;
}

/** Helix studio glow shell — rotating spectrum rim, shimmer, ambient bloom. */
export function StudioGlowCard({
  children,
  className = "",
  contentClassName = "",
  quiet = false,
  style,
}: StudioGlowCardProps) {
  return (
    <div
      className={[
        "studio-glow-card",
        quiet ? "studio-glow-card--quiet" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <span aria-hidden className="studio-glow-card__clip">
        <span aria-hidden className="studio-glow-card__halo" />
        <span aria-hidden className="studio-glow-card__border" />
        <span aria-hidden className="studio-glow-card__shimmer" />
      </span>
      <div
        className={["relative z-10", contentClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
