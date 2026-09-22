import type { User } from "../types";
import { StudioGlowCard } from "./StudioGlowCard";

interface UserCardProps {
  user: User;
  selectedHobbies?: string[];
  hobbiesExpanded: boolean;
  onExpandHobbies: (userId: number) => void;
}

function splitHobbies(userHobbies: string[], selectedHobbies: string[]) {
  if (selectedHobbies.length === 0) {
    return {
      visibleHobbies: userHobbies.slice(0, 2),
      extraHobbies: userHobbies.slice(2),
    };
  }

  const selectedSet = new Set(selectedHobbies);
  const visibleHobbies = selectedHobbies.filter((hobby) =>
    userHobbies.includes(hobby),
  );
  const extraHobbies = userHobbies.filter((hobby) => !selectedSet.has(hobby));

  return { visibleHobbies, extraHobbies };
}

function hobbyChipClass(active = false) {
  return [
    "rounded-md border px-2 py-0.5 text-xs transition-colors",
    active
      ? "border-[rgba(31,182,230,0.65)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
      : "border-[rgba(255,255,255,0.22)] bg-[var(--color-panel)] text-[var(--color-ink)]",
  ].join(" ");
}

export function UserCard({
  user,
  selectedHobbies = [],
  hobbiesExpanded,
  onExpandHobbies,
}: UserCardProps) {
  const selectedSet = new Set(selectedHobbies);
  const { visibleHobbies, extraHobbies } = splitHobbies(
    user.hobbies,
    selectedHobbies,
  );
  const remaining = extraHobbies.length;

  const hobbiesToShow = hobbiesExpanded
    ? [...visibleHobbies, ...extraHobbies]
    : visibleHobbies;

  return (
    <StudioGlowCard
      quiet
      className="user-card rounded-xl"
      contentClassName="flex gap-3 px-3 py-3"
    >
      <img
        src={user.avatar}
        alt=""
        width={48}
        height={48}
        loading="lazy"
        className="h-12 w-12 shrink-0 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)] object-cover"
      />
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[0.95rem] font-semibold leading-tight">
          {user.first_name} {user.last_name}
        </h2>
        <div className="mt-0.5 flex items-baseline gap-2">
          <p className="truncate text-sm text-[var(--color-muted)]">
            {user.nationality}
          </p>
          <span className="shrink-0 font-mono text-xs text-[var(--color-muted)]">
            {user.age}
          </span>
        </div>
        <div
          data-user-hobbies={user.id}
          className="mt-2 flex w-fit flex-wrap items-center gap-1.5"
        >
          {hobbiesToShow.length === 0 ? (
            <span className="text-xs text-[var(--color-muted)]">
              No hobbies
            </span>
          ) : (
            hobbiesToShow.map((hobby) => (
              <span
                key={hobby}
                className={hobbyChipClass(selectedSet.has(hobby))}
              >
                {hobby}
              </span>
            ))
          )}
          {remaining > 0 && !hobbiesExpanded && (
            <span className="group relative inline-flex">
              <span
                role="button"
                tabIndex={0}
                data-expand-hobbies={user.id}
                className={[
                  hobbyChipClass(false),
                  "cursor-pointer font-mono hover:border-[rgba(31,182,230,0.65)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]",
                ].join(" ")}
                aria-expanded={hobbiesExpanded}
                aria-label={`Show ${remaining} more hobbies`}
                onPointerDown={(event) => {
                  // Keep document outside-click handler from racing this open.
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  onExpandHobbies(user.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onExpandHobbies(user.id);
                  }
                }}
              >
                +{remaining}
              </span>
              {/* Desktop only: hover preview */}
              <span
                role="tooltip"
                className="hx-menu pointer-events-none absolute top-full left-0 z-[100] mt-2 hidden w-max max-w-64 flex-col gap-1.5 rounded-xl border border-[rgba(255,255,255,0.22)] bg-[var(--color-popover)] p-2 shadow-[0_12px_32px_rgba(0,0,0,0.45)] md:group-hover:flex md:group-focus-within:flex"
              >
                <span className="px-0.5 font-mono text-[10px] font-semibold tracking-[0.12em] text-[var(--color-muted)] uppercase">
                  More hobbies
                </span>
                <span className="flex flex-wrap gap-1.5">
                  {extraHobbies.map((hobby) => (
                    <span key={hobby} className={hobbyChipClass(false)}>
                      {hobby}
                    </span>
                  ))}
                </span>
              </span>
            </span>
          )}
        </div>
      </div>
    </StudioGlowCard>
  );
}
