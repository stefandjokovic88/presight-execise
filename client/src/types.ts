export type SortField = "first_name" | "last_name" | "age" | "nationality";
export type SortDir = "asc" | "desc";

export interface DirectoryFilters {
  q: string;
  nationalities: string[];
  hobbies: string[];
  sortBy: SortField;
  sortDir: SortDir;
}

export interface User {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface UsersResponse {
  data: User[];
  pagination: PaginationMeta;
}

export interface FacetValue {
  value: string;
  count: number;
}

/** Combined facets payload from GET /api/facets */
export interface DirectoryFacetsResponse {
  hobbies: FacetValue[];
  nationalities: FacetValue[];
}

export const SORT_FIELDS: SortField[] = [
  "first_name",
  "last_name",
  "age",
  "nationality",
];

export const PAGE_SIZE = 50;
