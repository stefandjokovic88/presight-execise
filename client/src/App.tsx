import { useMemo, useState } from "react";
import { getErrorMessage } from "./api/errors";
import { FilterSidebar } from "./components/FilterSidebar";
import { SearchSortBar } from "./components/SearchSortBar";
import { DirectorySkeleton, StatusPanel } from "./components/StatusPanel";
import { UserList } from "./components/UserList";
import { useDelayedTrue } from "./hooks/useDelayedTrue";
import { useDirectoryParams } from "./hooks/useDirectoryParams";
import {
  filtersKey,
  useFacetsQuery,
  useUsersInfiniteQuery,
} from "./hooks/useUsersQueries";

export function App() {
  const {
    filters,
    setQuery,
    setSortBy,
    setSortDir,
    toggleHobby,
    toggleNationality,
    clearFilters,
  } = useDirectoryParams();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const usersQuery = useUsersInfiniteQuery(filters);
  const facetsQuery = useFacetsQuery(filters);

  const users = useMemo(
    () => usersQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [usersQuery.data],
  );

  const total = usersQuery.data?.pages[0]?.pagination.total;
  const usersResultReady =
    Boolean(usersQuery.data) && !usersQuery.isPlaceholderData;
  const noMatchingUsers = usersResultReady && total === 0;

  // When the user list is confirmed empty, don't keep stale facet placeholders.
  const hobbyItems = noMatchingUsers ? [] : (facetsQuery.data?.hobbies ?? []);
  const nationalityItems = noMatchingUsers
    ? []
    : (facetsQuery.data?.nationalities ?? []);

  const isBootstrapLoading =
    !usersQuery.data && usersQuery.isPending && !usersQuery.isPlaceholderData;

  const isUsersError = usersQuery.isError && !usersQuery.data;
  const isRefreshing =
    usersQuery.isFetching &&
    !usersQuery.isFetchingNextPage &&
    !isBootstrapLoading;
  // Only show refresh UI if the request takes longer than ~300ms.
  const showRefreshing = useDelayedTrue(isRefreshing, 300);

  const facetsError =
    facetsQuery.isError && !facetsQuery.data
      ? getErrorMessage(facetsQuery.error)
      : null;
  const facetsLoading =
    !noMatchingUsers && facetsQuery.isPending && !facetsQuery.data;

  const retryAll = () => {
    void usersQuery.refetch();
    void facetsQuery.refetch();
  };

  const sidebar = (
    <FilterSidebar
      hobbies={hobbyItems}
      nationalities={nationalityItems}
      selectedHobbies={filters.hobbies}
      selectedNationalities={filters.nationalities}
      facetsLoading={facetsLoading}
      facetsError={facetsError}
      onToggleHobby={toggleHobby}
      onToggleNationality={toggleNationality}
      onRetryFacets={() => void facetsQuery.refetch()}
      onClear={clearFilters}
    />
  );

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.18em] text-[var(--color-accent)] uppercase">
          Presight
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          User Directory
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Search, filter, and browse people with live facet counts.
        </p>
      </header>

      <SearchSortBar
        q={filters.q}
        sortBy={filters.sortBy}
        sortDir={filters.sortDir}
        total={isBootstrapLoading ? undefined : total}
        onQueryChange={setQuery}
        onSortByChange={setSortBy}
        onSortDirChange={setSortDir}
        onOpenFilters={() => setFiltersOpen(true)}
      />

      {isBootstrapLoading ? (
        <DirectorySkeleton />
      ) : isUsersError ? (
        <StatusPanel
          title="Couldn’t load the directory"
          detail={getErrorMessage(usersQuery.error)}
          actionLabel="Retry"
          onAction={retryAll}
          tone="danger"
        />
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="hidden min-h-0 lg:block">{sidebar}</div>

          <section className="relative min-h-0">
            {showRefreshing && (
              <div className="pointer-events-none absolute top-2 right-2 z-10 rounded-full border border-[var(--color-line)] bg-[var(--color-panel)]/95 px-2.5 py-1 font-mono text-[11px] text-[var(--color-ink)] shadow-lg">
                Updating…
              </div>
            )}
            {users.length === 0 && !usersQuery.isFetching ? (
              <StatusPanel
                title="No users match"
                detail="Try clearing filters or changing your search."
                actionLabel="Clear search & filters"
                onAction={clearFilters}
              />
            ) : (
              <div
                className={[
                  "h-full transition-opacity duration-150",
                  showRefreshing ? "opacity-60" : "opacity-100",
                ].join(" ")}
              >
                <UserList
                  users={users}
                  selectedHobbies={filters.hobbies}
                  resetKey={JSON.stringify(filtersKey(filters))}
                  hasNextPage={Boolean(usersQuery.hasNextPage)}
                  isFetchingNextPage={usersQuery.isFetchingNextPage}
                  onLoadMore={() => {
                    void usersQuery.fetchNextPage();
                  }}
                />
              </div>
            )}
          </section>
        </div>
      )}

      {filtersOpen && !isBootstrapLoading && !isUsersError && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-[min(100%,320px)] flex-col bg-[var(--color-panel)] p-3 shadow-xl">
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm"
              >
                X
              </button>
            </div>
            <div className="min-h-0 flex-1">{sidebar}</div>
          </div>
        </div>
      )}
    </div>
  );
}
