import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SORT_FIELDS,
  type DirectoryFilters,
  type SortDir,
  type SortField,
} from "../types";

function parseList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSortBy(value: string | null): SortField {
  if (value && SORT_FIELDS.includes(value as SortField)) {
    return value as SortField;
  }
  return "last_name";
}

function parseSortDir(value: string | null): SortDir {
  return value === "desc" ? "desc" : "asc";
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value].sort((a, b) => a.localeCompare(b));
}

export function useDirectoryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: DirectoryFilters = useMemo(
    () => ({
      q: searchParams.get("q") ?? "",
      nationalities: parseList(searchParams.get("nationalities")),
      hobbies: parseList(searchParams.get("hobbies")),
      sortBy: parseSortBy(searchParams.get("sortBy")),
      sortDir: parseSortDir(searchParams.get("sortDir")),
    }),
    [searchParams],
  );

  const update = useCallback(
    (patch: Partial<DirectoryFilters>) => {
      const next: DirectoryFilters = { ...filters, ...patch };
      const params = new URLSearchParams();

      if (next.q) params.set("q", next.q);
      if (next.nationalities.length > 0) {
        params.set("nationalities", next.nationalities.join(","));
      }
      if (next.hobbies.length > 0) {
        params.set("hobbies", next.hobbies.join(","));
      }
      if (next.sortBy !== "last_name") params.set("sortBy", next.sortBy);
      if (next.sortDir !== "asc") params.set("sortDir", next.sortDir);

      setSearchParams(params, { replace: true });
    },
    [filters, setSearchParams],
  );

  const setQuery = useCallback((q: string) => update({ q }), [update]);
  const setSortBy = useCallback(
    (sortBy: SortField) => update({ sortBy }),
    [update],
  );
  const setSortDir = useCallback(
    (sortDir: SortDir) => update({ sortDir }),
    [update],
  );
  const toggleHobby = useCallback(
    (hobby: string) => update({ hobbies: toggleValue(filters.hobbies, hobby) }),
    [filters.hobbies, update],
  );
  const toggleNationality = useCallback(
    (nationality: string) =>
      update({
        nationalities: toggleValue(filters.nationalities, nationality),
      }),
    [filters.nationalities, update],
  );
  const clearFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        params.delete("q");
        params.delete("hobbies");
        params.delete("nationalities");
        return params;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return {
    filters,
    setQuery,
    setSortBy,
    setSortDir,
    toggleHobby,
    toggleNationality,
    clearFilters,
  };
}
