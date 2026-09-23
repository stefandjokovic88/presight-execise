package com.presight.users.controller;

import com.presight.users.dto.DirectoryFacetsResponse;
import com.presight.users.dto.UserFilters;
import com.presight.users.service.UserService;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class FacetsController {

  private static final Logger log = LoggerFactory.getLogger(FacetsController.class);

  private final UserService userService;

  public FacetsController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/facets")
  public ResponseEntity<?> facets(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String[] nationalities,
      @RequestParam(required = false) String[] hobbies) {
    try {
      UserFilters filters = QueryParsers.parseUserFilters(q, nationalities, hobbies);
      DirectoryFacetsResponse result = userService.getFacets(filters);
      return ResponseEntity.ok(result);
    } catch (Exception error) {
      log.error("GET /api/facets failed:", error);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to fetch facets"));
    }
  }
}
