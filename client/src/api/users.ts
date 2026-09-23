import type {
  DirectoryFacetsResponse,
  DirectoryFilters,
  UsersResponse,
} from "../types";
import { PAGE_SIZE } from "../types";
import { ApiError } from "./errors";

function buildUsersSearchParams(
  filters: DirectoryFilters,
  page: number,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.nationalities.length > 0) {
    params.set("nationalities", filters.nationalities.join(","));
  }
  if (filters.hobbies.length > 0) {
    params.set("hobbies", filters.hobbies.join(","));
  }
  params.set("sortBy", filters.sortBy);
  params.set("sortDir", filters.sortDir);
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));

  return params;
}

/** Filter params that affect facet counts (sort is ignored server-side). */
function buildFacetsSearchParams(filters: DirectoryFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.nationalities.length > 0) {
    params.set("nationalities", filters.nationalities.join(","));
  }
  if (filters.hobbies.length > 0) {
    params.set("hobbies", filters.hobbies.join(","));
  }
  return params;
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(
      "Network error — check that the API server is running.",
      undefined,
      url,
    );
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(message, response.status, url);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(
      "Invalid JSON response from server",
      response.status,
      url,
    );
  }
}

export function fetchUsersPage(
  filters: DirectoryFilters,
  page: number,
  signal?: AbortSignal,
): Promise<UsersResponse> {
  const params = buildUsersSearchParams(filters, page).toString();
  return getJson<UsersResponse>(`/api/users?${params}`, signal);
}

export function fetchFacets(
  filters: DirectoryFilters,
  signal?: AbortSignal,
): Promise<DirectoryFacetsResponse> {
  const params = buildFacetsSearchParams(filters).toString();
  const url = params ? `/api/facets?${params}` : "/api/facets";
  return getJson<DirectoryFacetsResponse>(url, signal);
}
