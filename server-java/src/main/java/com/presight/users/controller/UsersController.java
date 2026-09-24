package com.presight.users.controller;

import com.presight.users.dto.ListQuery;
import com.presight.users.dto.UsersResponse;
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
@Tag(name = "Users", description = "User directory listing")
public class UsersController {

  private static final Logger log = LoggerFactory.getLogger(UsersController.class);

  private final UserService userService;

  public UsersController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/users")
  @Operation(
      summary = "List users",
      description =
          "Paginated users with text search and filters. Hobbies use AND matching; nationalities use OR matching.")
  @ApiResponse(
      responseCode = "200",
      description = "Paginated user list",
      content = @Content(schema = @Schema(implementation = UsersResponse.class)))
  @ApiResponse(responseCode = "500", description = "Server error")
  public ResponseEntity<?> listUsers(
      @Parameter(description = "Case-insensitive search on first and last name")
          @RequestParam(required = false)
          String q,
      @Parameter(description = "Nationality filters (OR). Comma-separated or repeated query params.")
          @RequestParam(required = false)
          String[] nationalities,
      @Parameter(description = "Hobby filters (AND). Comma-separated or repeated query params.")
          @RequestParam(required = false)
          String[] hobbies,
      @Parameter(
              description = "Sort field",
              schema =
                  @Schema(
                      allowableValues = {"first_name", "last_name", "age", "nationality"},
                      defaultValue = "last_name"))
          @RequestParam(required = false)
          String sortBy,
      @Parameter(
              description = "Sort direction",
              schema = @Schema(allowableValues = {"asc", "desc"}, defaultValue = "asc"))
          @RequestParam(required = false)
          String sortDir,
      @Parameter(description = "1-based page number", schema = @Schema(defaultValue = "1"))
          @RequestParam(required = false)
          Integer page,
      @Parameter(description = "Page size (1–100)", schema = @Schema(defaultValue = "50"))
          @RequestParam(required = false)
          Integer pageSize) {
    try {
      // throw new RuntimeException("simulated failure"); // temporary for testing error logging
      ListQuery query =
          QueryParsers.parseListQuery(q, nationalities, hobbies, sortBy, sortDir, page, pageSize);
      UsersResponse result = userService.listUsers(query);
      return ResponseEntity.ok(result);
    } catch (Exception error) {
      log.error("GET /api/users failed:", error);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to fetch users"));
    }
  }
}
