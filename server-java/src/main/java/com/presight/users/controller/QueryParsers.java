package com.presight.users.controller;

import com.presight.users.dto.ListQuery;
import com.presight.users.dto.UserFilters;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** Query parsing matching Node {@code parseQuery.ts}. */
public final class QueryParsers {

  private QueryParsers() {}

  public static UserFilters parseUserFilters(
      String q, String[] nationalities, String[] hobbies) {
    return new UserFilters(
        q == null ? "" : q.trim(), parseListParam(nationalities), parseListParam(hobbies));
  }

  public static ListQuery parseListQuery(
      String q,
      String[] nationalities,
      String[] hobbies,
      String sortBy,
      String sortDir,
      Integer page,
      Integer pageSize) {
    UserFilters filters = parseUserFilters(q, nationalities, hobbies);

    String sortByRaw = sortBy == null || sortBy.isBlank() ? "last_name" : sortBy;
    String resolvedSortBy =
        ListQuery.SORT_FIELDS.contains(sortByRaw) ? sortByRaw : "last_name";

    String sortDirRaw = sortDir == null ? "" : sortDir.toLowerCase();
    String resolvedSortDir = "desc".equals(sortDirRaw) ? "desc" : "asc";

    int resolvedPage = page == null || page < 1 ? 1 : page;
    int rawPageSize = pageSize == null ? 50 : pageSize;
    int resolvedPageSize = Math.min(100, Math.max(1, rawPageSize));

    return new ListQuery(
        filters.q(),
        filters.nationalities(),
        filters.hobbies(),
        resolvedSortBy,
        resolvedSortDir,
        resolvedPage,
        resolvedPageSize);
  }

  /** Accepts {@code a,b} or repeated {@code a&b} query params. */
  public static List<String> parseListParam(String[] values) {
    if (values == null || values.length == 0) {
      return List.of();
    }
    List<String> result = new ArrayList<>();
    for (String value : values) {
      if (value == null || value.isBlank()) {
        continue;
      }
      Arrays.stream(value.split(","))
          .map(String::trim)
          .filter(s -> !s.isEmpty())
          .forEach(result::add);
    }
    return result;
  }
}
