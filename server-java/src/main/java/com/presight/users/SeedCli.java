package com.presight.users;

import com.presight.users.service.SeedRunner;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;

/** Wipe and re-seed SQLite — mirrors Node {@code yarn seed}. */
public final class SeedCli {

  private SeedCli() {}

  public static void main(String[] args) throws Exception {
    String dbPathProp = System.getenv().getOrDefault("DB_PATH", "./data/users.db");
    Path dbPath = Path.of(dbPathProp).toAbsolutePath().normalize();
    Files.createDirectories(dbPath.getParent());

    for (String suffix : new String[] {"", "-wal", "-shm"}) {
      Files.deleteIfExists(Path.of(dbPath + suffix));
    }

    System.setProperty("app.db-path", dbPath.toString());
    System.setProperty("app.seed-on-empty", "false");

    ConfigurableApplicationContext context =
        new SpringApplicationBuilder(UsersApplication.class)
            .web(WebApplicationType.NONE)
            .run(args);

    try {
      System.out.printf("Seeding %,d users into %s%n", SeedRunner.USER_COUNT, dbPath);
      context.getBean(SeedRunner.class).seedFresh();
    } finally {
      int code = SpringApplication.exit(context, () -> 0);
      System.exit(code);
    }
  }
}
