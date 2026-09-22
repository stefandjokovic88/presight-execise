import type { Request } from "express";
import {
  SORT_FIELDS,
  type ListQuery,
  type SortDir,
  type SortField,
  type UserFilters,
} from "./types.js";

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
}

/** Accepts `a,b` or repeated `a&b` query params. */
export function parseListParam(value: unknown): string[] {
  const raw: string[] = [];

  if (typeof value === "string") {
    raw.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string") raw.push(item);
    }
  }

  return raw
    .flatMap((part) => part.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseUserFilters(req: Request): UserFilters {
  return {
    q: asString(req.query.q).trim(),
    nationalities: parseListParam(req.query.nationalities),
    hobbies: parseListParam(req.query.hobbies),
  };
}

export function parseListQuery(req: Request): ListQuery {
  const filters = parseUserFilters(req);

  const sortByRaw = asString(req.query.sortBy) || "last_name";
  const sortBy: SortField = SORT_FIELDS.includes(sortByRaw as SortField)
    ? (sortByRaw as SortField)
    : "last_name";

  const sortDirRaw = asString(req.query.sortDir).toLowerCase();
  const sortDir: SortDir = sortDirRaw === "desc" ? "desc" : "asc";

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 50));

  return { ...filters, sortBy, sortDir, page, pageSize };
}
