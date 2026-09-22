import type Database from "better-sqlite3";
import { buildUserFilter } from "../db/filters.js";
import type {
  FacetValue,
  ListQuery,
  PaginationMeta,
  User,
  UserFilters,
  UserRow,
} from "../types.js";

export function listUsers(
  db: Database.Database,
  query: ListQuery,
): { data: User[]; pagination: PaginationMeta } {
  const { whereSql, params } = buildUserFilter(query);
  const direction = query.sortDir.toUpperCase() === "DESC" ? "DESC" : "ASC";
  // Whitelisted in parseListQuery — safe to interpolate column name.
  const sortColumn = query.sortBy;

  const totalRow = db
    .prepare(`SELECT COUNT(*) AS total FROM users ${whereSql}`)
    .get(...params) as { total: number };

  const total = totalRow.total;
  const offset = (query.page - 1) * query.pageSize;

  const rows = db
    .prepare(
      `
      SELECT id, avatar, first_name, last_name, age, nationality
      FROM users
      ${whereSql}
      ORDER BY ${sortColumn} ${direction}, id ${direction}
      LIMIT ? OFFSET ?
    `,
    )
    .all(...params, query.pageSize, offset) as UserRow[];

  const data = attachHobbies(db, rows);

  return {
    data,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      hasMore: offset + rows.length < total,
    },
  };
}

function attachHobbies(db: Database.Database, rows: UserRow[]): User[] {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => "?").join(", ");

  const hobbyRows = db
    .prepare(
      `
      SELECT uh.user_id AS user_id, h.name AS name
      FROM user_hobbies uh
      INNER JOIN hobbies h ON h.id = uh.hobby_id
      WHERE uh.user_id IN (${placeholders})
      ORDER BY h.name ASC
    `,
    )
    .all(...ids) as Array<{ user_id: number; name: string }>;

  const hobbiesByUser = new Map<number, string[]>();
  for (const row of hobbyRows) {
    const list = hobbiesByUser.get(row.user_id);
    if (list) {
      list.push(row.name);
    } else {
      hobbiesByUser.set(row.user_id, [row.name]);
    }
  }

  return rows.map((row) => ({
    ...row,
    hobbies: hobbiesByUser.get(row.id) ?? [],
  }));
}

export function getTopHobbies(
  db: Database.Database,
  filters: UserFilters,
  limit = 20,
): FacetValue[] {
  // Apply text + nationality, but not selected hobbies — so other hobbies
  // stay visible for multi-select while counts still respect the result set.
  const { whereSql, params } = buildUserFilter(filters, {
    excludeHobbyFilter: true,
  });

  return db
    .prepare(
      `
      SELECT h.name AS value, COUNT(*) AS count
      FROM users
      INNER JOIN user_hobbies uh ON uh.user_id = users.id
      INNER JOIN hobbies h ON h.id = uh.hobby_id
      ${whereSql}
      GROUP BY h.name
      ORDER BY count DESC, value ASC
      LIMIT ?
    `,
    )
    .all(...params, limit) as FacetValue[];
}

export function getTopNationalities(
  db: Database.Database,
  filters: UserFilters,
  limit = 20,
): FacetValue[] {
  // Apply text + hobbies, but not selected nationalities — so other countries
  // stay visible for multi-select (OR) while counts still respect other filters.
  const { whereSql, params } = buildUserFilter(filters, {
    excludeNationalityFilter: true,
  });

  return db
    .prepare(
      `
      SELECT users.nationality AS value, COUNT(*) AS count
      FROM users
      ${whereSql}
      GROUP BY users.nationality
      ORDER BY count DESC, value ASC
      LIMIT ?
    `,
    )
    .all(...params, limit) as FacetValue[];
}
