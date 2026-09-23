package com.presight.users.controller;

import com.presight.users.dto.ListQuery;
import com.presight.users.dto.UsersResponse;
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
public class UsersController {

  private static final Logger log = LoggerFactory.getLogger(UsersController.class);

  private final UserService userService;

  public UsersController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping("/users")
  public ResponseEntity<?> listUsers(
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String[] nationalities,
      @RequestParam(required = false) String[] hobbies,
      @RequestParam(required = false) String sortBy,
      @RequestParam(required = false) String sortDir,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer pageSize) {
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
