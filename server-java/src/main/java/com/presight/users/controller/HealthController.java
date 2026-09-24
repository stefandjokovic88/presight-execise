package com.presight.users.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Health", description = "Liveness checks")
public class HealthController {

  @GetMapping("/health")
  @Operation(summary = "Health check")
  public Map<String, Boolean> health() {
    return Map.of("ok", true);
  }
}
