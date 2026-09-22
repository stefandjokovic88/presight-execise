export type SortField = "first_name" | "last_name" | "age" | "nationality";
export type SortDir = "asc" | "desc";

export interface UserFilters {
  q: string;
  nationalities: string[];
  hobbies: string[];
}

export interface ListQuery extends UserFilters {
  sortBy: SortField;
  sortDir: SortDir;
  page: number;
  pageSize: number;
}

export interface UserRow {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
}

export interface User extends UserRow {
  hobbies: string[];
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export const SORT_FIELDS: readonly SortField[] = [
  "first_name",
  "last_name",
  "age",
  "nationality",
] as const;
