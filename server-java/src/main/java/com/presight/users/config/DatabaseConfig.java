package com.presight.users.config;

import java.nio.file.Files;
import java.nio.file.Path;
import javax.sql.DataSource;
import org.sqlite.SQLiteConfig;
import org.sqlite.SQLiteDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;

@Configuration
public class DatabaseConfig {

  @Bean
  public DataSource dataSource(@Value("${app.db-path}") String dbPath) throws Exception {
    Path path = Path.of(dbPath).toAbsolutePath().normalize();
    Files.createDirectories(path.getParent());

    SQLiteConfig sqliteConfig = new SQLiteConfig();
    sqliteConfig.enforceForeignKeys(true);
    sqliteConfig.setJournalMode(SQLiteConfig.JournalMode.WAL);

    SQLiteDataSource dataSource = new SQLiteDataSource(sqliteConfig);
    dataSource.setUrl("jdbc:sqlite:" + path);
    return dataSource;
  }

  @Bean
  public NamedParameterJdbcTemplate namedParameterJdbcTemplate(DataSource dataSource) {
    return new NamedParameterJdbcTemplate(dataSource);
  }
}
