import { StudioGlowCard } from "./StudioGlowCard";

export function StatusPanel({
  title,
  detail,
  actionLabel,
  onAction,
  tone = "neutral",
}: {
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "neutral" | "danger";
}) {
  if (tone === "danger") {
    return (
      <div className="flex h-full flex-col items-start justify-center gap-2 rounded-2xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-soft)] p-6">
        <h2 className="text-lg font-semibold">{title}</h2>
        {detail && <p className="text-sm text-[var(--color-muted)]">{detail}</p>}
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-2 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-accent-fg)]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <StudioGlowCard
      className="h-full"
      contentClassName="flex h-full flex-col items-start justify-center gap-2 p-6"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {detail && <p className="text-sm text-[var(--color-muted)]">{detail}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-[var(--color-accent-fg)]"
        >
          {actionLabel}
        </button>
      )}
    </StudioGlowCard>
  );
}

export function DirectorySkeleton() {
  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <StudioGlowCard
        className="hidden h-full lg:block"
        contentClassName="flex h-full flex-col gap-5 p-4"
      >
        <div className="h-4 w-20 animate-pulse rounded bg-[var(--color-panel)]" />
        <SkeletonFacetBlock />
        <SkeletonFacetBlock />
      </StudioGlowCard>
      <StudioGlowCard
        quiet
        className="h-full"
        contentClassName="flex h-full flex-col gap-2 p-2"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-3"
          >
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-[var(--color-panel)]" />
            <div className="flex flex-1 flex-col gap-2 py-1">
              <div className="h-4 w-48 animate-pulse rounded bg-[var(--color-panel)]" />
              <div className="h-3 w-32 animate-pulse rounded bg-[var(--color-panel)]" />
              <div className="mt-1 flex gap-1.5">
                <div className="h-5 w-16 animate-pulse rounded-md bg-[var(--color-panel)]" />
                <div className="h-5 w-16 animate-pulse rounded-md bg-[var(--color-panel)]" />
              </div>
            </div>
          </div>
        ))}
      </StudioGlowCard>
    </div>
  );
}

function SkeletonFacetBlock() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-panel)]" />
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg px-2 py-1.5"
        >
          <div className="h-3.5 w-28 animate-pulse rounded bg-[var(--color-panel)]" />
          <div className="h-3 w-8 animate-pulse rounded bg-[var(--color-panel)]" />
        </div>
      ))}
    </div>
  );
}
