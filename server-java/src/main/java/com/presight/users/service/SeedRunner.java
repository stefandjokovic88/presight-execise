package com.presight.users.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import net.datafaker.Faker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SeedRunner {

  private static final Logger log = LoggerFactory.getLogger(SeedRunner.class);
  public static final int USER_COUNT = 10_000;

  public static final List<String> HOBBIES =
      List.of(
          "Reading",
          "Hiking",
          "Cooking",
          "Photography",
          "Gaming",
          "Painting",
          "Swimming",
          "Cycling",
          "Running",
          "Yoga",
          "Chess",
          "Gardening",
          "Fishing",
          "Traveling",
          "Music",
          "Dancing",
          "Writing",
          "Knitting",
          "Camping",
          "Skiing",
          "Surfing",
          "Climbing",
          "Baking",
          "Filmmaking",
          "Astronomy",
          "Birdwatching",
          "Collecting",
          "DIY",
          "Meditation",
          "Volunteering",
          "Board games",
          "Pottery",
          "Calligraphy",
          "Martial arts",
          "Scuba diving",
          "Horse riding",
          "Archery",
          "Woodworking",
          "Sewing",
          "Podcasting");

  public static final List<String> NATIONALITIES =
      List.of(
          "American",
          "British",
          "Canadian",
          "Australian",
          "German",
          "French",
          "Italian",
          "Spanish",
          "Dutch",
          "Swedish",
          "Norwegian",
          "Danish",
          "Finnish",
          "Irish",
          "Portuguese",
          "Polish",
          "Czech",
          "Austrian",
          "Swiss",
          "Belgian",
          "Japanese",
          "Korean",
          "Chinese",
          "Indian",
          "Brazilian",
          "Mexican",
          "Argentinian",
          "South African",
          "New Zealander",
          "Singaporean");

  private final JdbcTemplate jdbc;
  private final SchemaInitializer schemaInitializer;

  public SeedRunner(JdbcTemplate jdbc, SchemaInitializer schemaInitializer) {
    this.jdbc = jdbc;
    this.schemaInitializer = schemaInitializer;
  }

  public long countUsers() {
    Long count = jdbc.queryForObject("SELECT COUNT(*) FROM users", Long.class);
    return count == null ? 0L : count;
  }

  /** Wipe tables and re-seed (used by CLI). Caller should delete DB files if a full reset is needed. */
  @Transactional
  public void seedFresh() {
    schemaInitializer.ensureSchema();
    jdbc.update("DELETE FROM user_hobbies");
    jdbc.update("DELETE FROM hobbies");
    jdbc.update("DELETE FROM users");
    populate();
  }

  /** Seed only when the users table is empty. */
  @Transactional
  public void ensureSeeded() {
    schemaInitializer.ensureSchema();
    long count = countUsers();
    if (count > 0) {
      log.info("SQLite ready ({} users)", String.format("%,d", count));
      return;
    }
    log.info("Empty database detected — seeding…");
    jdbc.update("DELETE FROM user_hobbies");
    jdbc.update("DELETE FROM hobbies");
    jdbc.update("DELETE FROM users");
    populate();
  }

  private void populate() {
    Faker faker = new Faker();
    long startedAt = System.currentTimeMillis();

    List<Long> hobbyIds = new ArrayList<>(HOBBIES.size());
    for (String name : HOBBIES) {
      jdbc.update("INSERT INTO hobbies (name) VALUES (?)", name);
      Long id = jdbc.queryForObject("SELECT id FROM hobbies WHERE name = ?", Long.class, name);
      hobbyIds.add(id);
    }

    for (int id = 1; id <= USER_COUNT; id++) {
      String nationality = NATIONALITIES.get(ThreadLocalRandom.current().nextInt(NATIONALITIES.size()));
      int age = ThreadLocalRandom.current().nextInt(18, 81);
      jdbc.update(
          """
          INSERT INTO users (id, avatar, first_name, last_name, age, nationality)
          VALUES (?, ?, ?, ?, ?, ?)
          """,
          id,
          "https://i.pravatar.cc/150?u=" + id,
          faker.name().firstName(),
          faker.name().lastName(),
          age,
          nationality);

      int hobbyCount = ThreadLocalRandom.current().nextInt(0, 11);
      List<Long> selected = pickRandom(hobbyIds, hobbyCount);
      for (Long hobbyId : selected) {
        jdbc.update("INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)", id, hobbyId);
      }
    }

    long elapsedMs = System.currentTimeMillis() - startedAt;
    Long userCount = jdbc.queryForObject("SELECT COUNT(*) FROM users", Long.class);
    Long hobbyCount = jdbc.queryForObject("SELECT COUNT(*) FROM hobbies", Long.class);
    Long linkCount = jdbc.queryForObject("SELECT COUNT(*) FROM user_hobbies", Long.class);

    log.info("Done in {}s", String.format("%.2f", elapsedMs / 1000.0));
    log.info("  users:          {}", String.format("%,d", userCount));
    log.info("  hobbies:        {}", String.format("%,d", hobbyCount));
    log.info("  user_hobbies:   {}", String.format("%,d", linkCount));
  }

  private static List<Long> pickRandom(List<Long> source, int count) {
    if (count <= 0) {
      return List.of();
    }
    List<Long> copy = new ArrayList<>(source);
    Collections.shuffle(copy);
    return copy.subList(0, Math.min(count, copy.size()));
  }
}
