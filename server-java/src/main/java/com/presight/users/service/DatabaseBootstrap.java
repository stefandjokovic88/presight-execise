package com.presight.users.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DatabaseBootstrap {

  private final SchemaInitializer schemaInitializer;
  private final SeedRunner seedRunner;
  private final boolean seedOnEmpty;

  public DatabaseBootstrap(
      SchemaInitializer schemaInitializer,
      SeedRunner seedRunner,
      @Value("${app.seed-on-empty:true}") boolean seedOnEmpty) {
    this.schemaInitializer = schemaInitializer;
    this.seedRunner = seedRunner;
    this.seedOnEmpty = seedOnEmpty;
  }

  @PostConstruct
  public void init() {
    schemaInitializer.ensureSchema();
    if (seedOnEmpty) {
      seedRunner.ensureSeeded();
    }
  }
}
