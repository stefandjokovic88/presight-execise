package com.presight.users.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaInitializer {

  private final JdbcTemplate jdbc;

  public SchemaInitializer(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public void ensureSchema() {
    jdbc.execute("PRAGMA foreign_keys = ON");
    jdbc.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY,
          avatar TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          age INTEGER NOT NULL,
          nationality TEXT NOT NULL
        )
        """);
    jdbc.execute(
        """
        CREATE TABLE IF NOT EXISTS hobbies (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL UNIQUE
        )
        """);
    jdbc.execute(
        """
        CREATE TABLE IF NOT EXISTS user_hobbies (
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          hobby_id INTEGER NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
          PRIMARY KEY (user_id, hobby_id)
        )
        """);
    jdbc.execute("CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name)");
    jdbc.execute("CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name)");
    jdbc.execute("CREATE INDEX IF NOT EXISTS idx_users_nationality ON users(nationality)");
    jdbc.execute("CREATE INDEX IF NOT EXISTS idx_users_age ON users(age)");
    jdbc.execute("CREATE INDEX IF NOT EXISTS idx_user_hobbies_hobby_id ON user_hobbies(hobby_id)");
    jdbc.execute("CREATE INDEX IF NOT EXISTS idx_user_hobbies_user_id ON user_hobbies(user_id)");
  }
}
