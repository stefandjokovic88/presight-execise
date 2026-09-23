import { useEffect, useState } from "react";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";
import type { SortDir, SortField } from "../types";
import { SORT_FIELDS } from "../types";
import { SelectMenu } from "./SelectMenu";
import { StudioGlowCard } from "./StudioGlowCard";

interface SearchSortBarProps {
  q: string;
  sortBy: SortField;
  sortDir: SortDir;
  total?: number;
  onQueryChange: (q: string) => void;
  onSortByChange: (sortBy: SortField) => void;
  onSortDirChange: (sortDir: SortDir) => void;
  onOpenFilters?: () => void;
}

const SORT_FIELD_LABELS: Record<SortField, string> = {
  first_name: "First name",
  last_name: "Last name",
  age: "Age",
  nationality: "Nationality",
};

function directionLabel(sortBy: SortField, sortDir: SortDir): string {
  if (sortBy === "age") {
    return sortDir === "asc" ? "Youngest first" : "Oldest first";
  }
  return sortDir === "asc" ? "A → Z" : "Z → A";
}

export function SearchSortBar({
  q,
  sortBy,
  sortDir,
  total,
  onQueryChange,
  onSortByChange,
  onSortDirChange,
  onOpenFilters,
}: SearchSortBarProps) {
  const [draft, setDraft] = useState(q);
  const { debounced: pushQuery, cancel } = useDebouncedCallback(
    onQueryChange,
    300,
  );

  // External URL changes (Clear, back/forward): sync input and drop pending push.
  useEffect(() => {
    cancel();
    setDraft(q);
  }, [q, cancel]);

  return (
    <StudioGlowCard
      className="relative z-20"
      contentClassName="flex flex-col gap-3 p-3"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="user-search"
            className="text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase"
          >
            Search
          </label>
          {typeof total === "number" && (
            <span className="font-mono text-xs text-[var(--color-muted)]">
              {total.toLocaleString()} results
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onOpenFilters && (
            <button
              type="button"
              onClick={onOpenFilters}
              className="rounded-lg border border-[rgba(255,255,255,0.22)] px-3 py-2 text-sm font-medium lg:hidden"
            >
              Filters
            </button>
          )}
          <input
            id="user-search"
            type="search"
            value={draft}
            onChange={(event) => {
              const value = event.target.value;
              setDraft(value);
              pushQuery(value);
            }}
            placeholder="Search by first or last name…"
            className="w-full rounded-lg border border-[rgba(255,255,255,0.22)] bg-[var(--color-panel)] px-3 py-2 outline-none ring-[var(--color-accent)] focus:ring-2"
          />
        </div>
      </div>

      <div className="h-px bg-[var(--color-line)]" />

      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wide text-[var(--color-muted)] uppercase">
            Sort results
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <SelectMenu
              id="sort-by"
              label="Sort field"
              value={sortBy}
              options={SORT_FIELDS.map((field) => ({
                value: field,
                label: SORT_FIELD_LABELS[field],
              }))}
              onChange={onSortByChange}
            />

            <div
              className="inline-flex rounded-lg border border-[rgba(255,255,255,0.22)] bg-[var(--color-panel)] p-0.5"
              role="group"
              aria-label="Sort direction"
            >
              <button
                type="button"
                onClick={() => onSortDirChange("asc")}
                className={[
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  sortDir === "asc"
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-surface)]",
                ].join(" ")}
              >
                {sortBy === "age" ? "Youngest" : "A → Z"}
              </button>
              <button
                type="button"
                onClick={() => onSortDirChange("desc")}
                className={[
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  sortDir === "desc"
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-fg)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-surface)]",
                ].join(" ")}
              >
                {sortBy === "age" ? "Oldest" : "Z → A"}
              </button>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--color-muted)] sm:pb-2">
          Ordering by {SORT_FIELD_LABELS[sortBy].toLowerCase()} ·{" "}
          {directionLabel(sortBy, sortDir)}
        </p>
      </div>
    </StudioGlowCard>
  );
}
