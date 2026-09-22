import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  fetchHobbyFacets,
  fetchNationalityFacets,
  fetchUsersPage,
} from "../api/users";
import type { DirectoryFilters } from "../types";

export function filtersKey(filters: DirectoryFilters) {
  return {
    q: filters.q,
    nationalities: [...filters.nationalities].sort(),
    hobbies: [...filters.hobbies].sort(),
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
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

export function useHobbyFacetsQuery(filters: DirectoryFilters) {
  return useQuery({
    queryKey: ["facets", "hobbies", filtersKey(filters)],
    queryFn: ({ signal }) => fetchHobbyFacets(filters, signal),
    placeholderData: keepPreviousData,
  });
}

export function useNationalityFacetsQuery(filters: DirectoryFilters) {
  return useQuery({
    queryKey: ["facets", "nationalities", filtersKey(filters)],
    queryFn: ({ signal }) => fetchNationalityFacets(filters, signal),
    placeholderData: keepPreviousData,
  });
}
