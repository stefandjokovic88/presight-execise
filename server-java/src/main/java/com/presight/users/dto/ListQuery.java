package com.presight.users.dto;

import java.util.List;
import java.util.Set;

public record ListQuery(
    String q,
    List<String> nationalities,
    List<String> hobbies,
    String sortBy,
    String sortDir,
    int page,
    int pageSize) {

  public static final Set<String> SORT_FIELDS =
      Set.of("first_name", "last_name", "age", "nationality");

  public UserFilters toFilters() {
    return new UserFilters(q, nationalities, hobbies);
  }
}
