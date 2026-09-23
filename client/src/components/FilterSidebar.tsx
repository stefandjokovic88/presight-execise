import { useId, useState } from "react";
import type { FacetValue } from "../types";
import { StudioGlowCard } from "./StudioGlowCard";

interface FilterSidebarProps {
  hobbies: FacetValue[];
  nationalities: FacetValue[];
  selectedHobbies: string[];
  selectedNationalities: string[];
  facetsLoading: boolean;
  facetsError?: string | null;
  onToggleHobby: (value: string) => void;
  onToggleNationality: (value: string) => void;
  onRetryFacets?: () => void;
  onClear: () => void;
}

/** Keep selected values visible even if they fall outside the API top 20. */
function withSelectedFacets(
  items: FacetValue[],
  selected: string[],
): FacetValue[] {
  const byValue = new Map(items.map((item) => [item.value, item]));
  for (const value of selected) {
    if (!byValue.has(value)) {
      byValue.set(value, { value, count: 0 });
    }
  }
  return Array.from(byValue.values());
}

export function FilterSidebar({
  hobbies,
  nationalities,
  selectedHobbies,
  selectedNationalities,
  facetsLoading,
  facetsError,
  onToggleHobby,
  onToggleNationality,
  onRetryFacets,
  onClear,
}: FilterSidebarProps) {
  const hasSelection =
    selectedHobbies.length > 0 || selectedNationalities.length > 0;

  const hobbyItems = withSelectedFacets(hobbies, selectedHobbies);
  const nationalityItems = withSelectedFacets(
    nationalities,
    selectedNationalities,
  );

  return (
    <StudioGlowCard
      className="h-full"
      contentClassName="studio-glow-card__content--clip h-full"
    >
      <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--color-muted)] uppercase">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClear}
            disabled={!hasSelection}
            aria-hidden={!hasSelection}
            tabIndex={hasSelection ? undefined : -1}
            className={`rounded-md border border-[rgba(255,255,255,0.22)] px-2 py-1 text-xs font-medium text-[var(--color-accent)] transition hover:border-[rgba(31,182,230,0.65)] hover:bg-[var(--color-accent-soft)] ${hasSelection ? "visible" : "invisible"}`}
          >
            Clear
          </button>
        </div>

        <FacetSection
          title="Hobbies"
          items={hobbyItems}
          selected={selectedHobbies}
          loading={facetsLoading}
          error={facetsError}
          onRetry={onRetryFacets}
          onToggle={onToggleHobby}
        />

        <FacetSection
          title="Nationalities"
          items={nationalityItems}
          selected={selectedNationalities}
          loading={facetsLoading}
          error={facetsError}
          onRetry={onRetryFacets}
          onToggle={onToggleNationality}
        />
      </div>
    </StudioGlowCard>
  );
}

function FacetSection({
  title,
  items,
  selected,
  loading,
  error,
  onRetry,
  onToggle,
  defaultOpen = true,
}: {
  title: string;
  items: FacetValue[];
  selected: string[];
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onToggle: (value: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const selectedCount = selected.length;

  return (
    <section className="rounded-xl border border-[rgba(255,255,255,0.22)] bg-[var(--color-panel)]/50">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition hover:bg-[rgba(31,182,230,0.08)]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-sm font-semibold">{title}</span>
          {selectedCount > 0 && (
            <span className="rounded-md border border-[rgba(31,182,230,0.65)] bg-[var(--color-accent-soft)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--color-accent)]">
              {selectedCount}
            </span>
          )}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className={[
            "h-3.5 w-3.5 shrink-0 text-[var(--color-muted)] transition-transform duration-150",
            open ? "rotate-180" : "",
          ].join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          id={panelId}
          className="border-t border-[rgba(255,255,255,0.12)] px-2 py-2"
        >
          {error && items.length === 0 ? (
            <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] p-2">
              <p className="text-xs text-[var(--color-danger)]">{error}</p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-1.5 text-xs font-medium text-[var(--color-accent)] hover:underline"
                >
                  Retry
                </button>
              )}
            </div>
          ) : loading && items.length === 0 ? (
            <FacetSkeleton />
          ) : items.length === 0 ? (
            <p className="px-1 py-1 text-sm text-[var(--color-muted)]">
              No values
            </p>
          ) : (
            <ul
              className={[
                "flex flex-col gap-1",
                loading ? "opacity-60" : "opacity-100",
              ].join(" ")}
            >
              {items.map((item) => {
                const isSelected = selected.includes(item.value);
                return (
                  <li key={item.value}>
                    <button
                      type="button"
                      onClick={() => onToggle(item.value)}
                      className={[
                        "flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-sm transition",
                        isSelected
                          ? "border-[rgba(31,182,230,0.65)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                          : "border-transparent text-[var(--color-ink)] hover:border-[rgba(255,255,255,0.22)] hover:bg-[rgba(255,255,255,0.04)]",
                      ].join(" ")}
                    >
                      <span className="truncate">{item.value}</span>
                      <span
                        className={[
                          "shrink-0 font-mono text-xs",
                          isSelected
                            ? "text-[var(--color-accent)]"
                            : "text-[var(--color-muted)]",
                        ].join(" ")}
                      >
                        {item.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function FacetSkeleton() {
  return (
    <ul className="flex flex-col gap-1">
      {Array.from({ length: 6 }, (_, index) => (
        <li
          key={index}
          className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
        >
          <span className="h-3.5 w-28 animate-pulse rounded bg-[var(--color-surface)]" />
          <span className="h-3 w-8 animate-pulse rounded bg-[var(--color-surface)]" />
        </li>
      ))}
    </ul>
  );
}
