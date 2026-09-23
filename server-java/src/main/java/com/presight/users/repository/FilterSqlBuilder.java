package com.presight.users.repository;

import com.presight.users.dto.UserFilters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds a WHERE clause for the users table — mirrors Node {@code buildUserFilter}.
 *
 * <ul>
 *   <li>Text: first_name OR last_name (case-insensitive substring)
 *   <li>Nationalities: OR (IN)
 *   <li>Hobbies: AND (user must have every selected hobby)
 * </ul>
 */
public final class FilterSqlBuilder {

  public record SqlFragment(String whereSql, Map<String, Object> params) {}

  private FilterSqlBuilder() {}

  public static SqlFragment build(UserFilters filters) {
    return build(filters, false, false);
  }

  public static SqlFragment build(
      UserFilters filters, boolean excludeHobbyFilter, boolean excludeNationalityFilter) {
    List<String> clauses = new ArrayList<>();
    Map<String, Object> params = new HashMap<>();

    if (filters.q() != null && !filters.q().isBlank()) {
      clauses.add(
          "(LOWER(users.first_name) LIKE :qLike OR LOWER(users.last_name) LIKE :qLike)");
      params.put("qLike", "%" + filters.q().toLowerCase() + "%");
    }

    if (!filters.nationalities().isEmpty() && !excludeNationalityFilter) {
      clauses.add("users.nationality IN (:nationalities)");
      params.put("nationalities", filters.nationalities());
    }

    if (!filters.hobbies().isEmpty() && !excludeHobbyFilter) {
      clauses.add(
          """
          users.id IN (
            SELECT uh.user_id
            FROM user_hobbies uh
            INNER JOIN hobbies h ON h.id = uh.hobby_id
            WHERE h.name IN (:hobbies)
            GROUP BY uh.user_id
            HAVING COUNT(DISTINCT h.name) = :hobbyCount
          )
          """);
      params.put("hobbies", filters.hobbies());
      params.put("hobbyCount", filters.hobbies().size());
    }

    String whereSql = clauses.isEmpty() ? "" : "WHERE " + String.join(" AND ", clauses);
    return new SqlFragment(whereSql, params);
  }
}
