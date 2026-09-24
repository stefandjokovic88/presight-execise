package com.presight.users.controller;

import com.presight.users.dto.DirectoryFacetsResponse;
import com.presight.users.dto.UserFilters;
import com.presight.users.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Facets", description = "Filter facet counts")
public class FacetsController {

  private static final Logger log = LoggerFactory.getLogger(FacetsController.class);

  private final UserService userService;

  public FacetsController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/facets")
  @Operation(
      summary = "Directory facets",
      description =
          "Top 20 hobbies and nationalities for the current filters. Counts intentionally ignore the same-dimension filter so multi-select stays usable.")
  @ApiResponse(
      responseCode = "200",
      description = "Facet counts",
      content = @Content(schema = @Schema(implementation = DirectoryFacetsResponse.class)))
  @ApiResponse(responseCode = "500", description = "Server error")
  public ResponseEntity<?> facets(
      @Parameter(description = "Case-insensitive search on first and last name")
          @RequestParam(required = false)
          String q,
      @Parameter(description = "Nationality filters (OR). Comma-separated or repeated query params.")
          @RequestParam(required = false)
          String[] nationalities,
      @Parameter(description = "Hobby filters (AND). Comma-separated or repeated query params.")
          @RequestParam(required = false)
          String[] hobbies) {
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
