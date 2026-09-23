package com.presight.users.repository;

import com.presight.users.dto.ListQuery;
import com.presight.users.dto.UserFilters;
import com.presight.users.model.FacetValue;
import com.presight.users.model.User;
import com.presight.users.repository.FilterSqlBuilder.SqlFragment;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

  private final NamedParameterJdbcTemplate jdbc;

  public UserRepository(NamedParameterJdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public long countUsers(UserFilters filters) {
    SqlFragment fragment = FilterSqlBuilder.build(filters);
    String sql = "SELECT COUNT(*) FROM users " + fragment.whereSql();
    Long total = jdbc.queryForObject(sql, fragment.params(), Long.class);
    return total == null ? 0L : total;
  }

  public List<User> listUsers(ListQuery query) {
    SqlFragment fragment = FilterSqlBuilder.build(query.toFilters());
    String direction = "desc".equalsIgnoreCase(query.sortDir()) ? "DESC" : "ASC";
    String sortColumn = query.sortBy();
    int offset = (query.page() - 1) * query.pageSize();

    MapSqlParameterSource params = new MapSqlParameterSource(fragment.params());
    params.addValue("limit", query.pageSize());
    params.addValue("offset", offset);

    String sql =
        """
        SELECT id, avatar, first_name, last_name, age, nationality
        FROM users
        %s
        ORDER BY %s %s, id %s
        LIMIT :limit OFFSET :offset
        """
            .formatted(fragment.whereSql(), sortColumn, direction, direction);

    List<UserRow> rows = jdbc.query(sql, params, (rs, rowNum) -> mapUserRow(rs));
    return attachHobbies(rows);
  }

  public List<FacetValue> getTopHobbies(UserFilters filters, int limit) {
    SqlFragment fragment = FilterSqlBuilder.build(filters, true, false);
    MapSqlParameterSource params = new MapSqlParameterSource(fragment.params());
    params.addValue("limit", limit);

    String sql =
        """
        SELECT h.name AS value, COUNT(*) AS count
        FROM users
        INNER JOIN user_hobbies uh ON uh.user_id = users.id
        INNER JOIN hobbies h ON h.id = uh.hobby_id
        %s
        GROUP BY h.name
        ORDER BY count DESC, value ASC
        LIMIT :limit
        """
            .formatted(fragment.whereSql());

    return jdbc.query(sql, params, (rs, rowNum) -> new FacetValue(rs.getString("value"), rs.getLong("count")));
  }

  public List<FacetValue> getTopNationalities(UserFilters filters, int limit) {
    SqlFragment fragment = FilterSqlBuilder.build(filters, false, true);
    MapSqlParameterSource params = new MapSqlParameterSource(fragment.params());
    params.addValue("limit", limit);

    String sql =
        """
        SELECT users.nationality AS value, COUNT(*) AS count
        FROM users
        %s
        GROUP BY users.nationality
        ORDER BY count DESC, value ASC
        LIMIT :limit
        """
            .formatted(fragment.whereSql());

    return jdbc.query(sql, params, (rs, rowNum) -> new FacetValue(rs.getString("value"), rs.getLong("count")));
  }

  private List<User> attachHobbies(List<UserRow> rows) {
    if (rows.isEmpty()) {
      return List.of();
    }

    List<Long> ids = rows.stream().map(UserRow::id).toList();
    MapSqlParameterSource params = new MapSqlParameterSource("ids", ids);

    List<HobbyLink> hobbyRows =
        jdbc.query(
            """
            SELECT uh.user_id AS user_id, h.name AS name
            FROM user_hobbies uh
            INNER JOIN hobbies h ON h.id = uh.hobby_id
            WHERE uh.user_id IN (:ids)
            ORDER BY h.name ASC
            """,
            params,
            (rs, rowNum) -> new HobbyLink(rs.getLong("user_id"), rs.getString("name")));

    Map<Long, List<String>> hobbiesByUser = new LinkedHashMap<>();
    for (HobbyLink link : hobbyRows) {
      hobbiesByUser.computeIfAbsent(link.userId(), ignored -> new ArrayList<>()).add(link.name());
    }

    List<User> users = new ArrayList<>(rows.size());
    for (UserRow row : rows) {
      users.add(
          new User(
              row.id(),
              row.avatar(),
              row.firstName(),
              row.lastName(),
              row.age(),
              row.nationality(),
              hobbiesByUser.getOrDefault(row.id(), List.of())));
    }
    return users;
  }

  private static UserRow mapUserRow(ResultSet rs) throws SQLException {
    return new UserRow(
        rs.getLong("id"),
        rs.getString("avatar"),
        rs.getString("first_name"),
        rs.getString("last_name"),
        rs.getInt("age"),
        rs.getString("nationality"));
  }

  private record UserRow(
      long id, String avatar, String firstName, String lastName, int age, String nationality) {}

  private record HobbyLink(long userId, String name) {}
}
