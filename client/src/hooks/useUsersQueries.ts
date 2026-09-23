import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { fetchFacets, fetchUsersPage } from "../api/users";
import type { DirectoryFilters } from "../types";

/** Full directory state — users list depends on every field, including sort. */
export function filtersKey(filters: DirectoryFilters) {
  return {
    q: filters.q,
    nationalities: [...filters.nationalities].sort(),
    hobbies: [...filters.hobbies].sort(),
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  };
}

/**
 * Combined facets depend on search + both facet selections (each dimension
 * still applies disjunctive rules server-side). Omit sort — facets ignore it.
 */
export function facetsKey(filters: DirectoryFilters) {
  return {
    q: filters.q,
    nationalities: [...filters.nationalities].sort(),
    hobbies: [...filters.hobbies].sort(),
  };
}

export function useUsersInfiniteQuery(filters: DirectoryFilters) {
  return useInfiniteQuery({
    queryKey: ["users", filtersKey(filters)],
    queryFn: ({ pageParam, signal }) =>
      fetchUsersPage(filters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.page + 1
        : undefined,
    placeholderData: keepPreviousData,
  });
}

export function useFacetsQuery(filters: DirectoryFilters) {
  return useQuery({
    queryKey: ["facets", facetsKey(filters)],
    queryFn: ({ signal }) => fetchFacets(filters, signal),
    placeholderData: keepPreviousData,
  });
}
