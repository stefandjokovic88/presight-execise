import type { UserFilters } from "../types.js";

export interface SqlFragment {
  whereSql: string;
  params: unknown[];
}

/**
 * Builds a WHERE clause for the users table.
 *
 * - Text: first_name OR last_name (case-insensitive substring)
 * - Nationalities: OR (IN)
 * - Hobbies: AND (user must have every selected hobby)
 */
export function buildUserFilter(
  filters: UserFilters,
  options: {
    excludeHobbyFilter?: boolean;
    excludeNationalityFilter?: boolean;
  } = {},
): SqlFragment {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (filters.q) {
    clauses.push(
      "(LOWER(users.first_name) LIKE ? OR LOWER(users.last_name) LIKE ?)",
    );
    const like = `%${filters.q.toLowerCase()}%`;
    params.push(like, like);
  }

  if (filters.nationalities.length > 0 && !options.excludeNationalityFilter) {
    const placeholders = filters.nationalities.map(() => "?").join(", ");
    clauses.push(`users.nationality IN (${placeholders})`);
    params.push(...filters.nationalities);
  }

  if (filters.hobbies.length > 0 && !options.excludeHobbyFilter) {
    const placeholders = filters.hobbies.map(() => "?").join(", ");
    clauses.push(`users.id IN (
      SELECT uh.user_id
      FROM user_hobbies uh
      INNER JOIN hobbies h ON h.id = uh.hobby_id
      WHERE h.name IN (${placeholders})
      GROUP BY uh.user_id
      HAVING COUNT(DISTINCT h.name) = ?
    )`);
    params.push(...filters.hobbies, filters.hobbies.length);
  }

  return {
    whereSql: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}
