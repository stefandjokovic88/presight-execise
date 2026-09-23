package com.presight.users.config;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(NoResourceFoundException.class)
  public ResponseEntity<Map<String, String>> notFound(NoResourceFoundException ex) {
    log.warn("Not found: {}", ex.getResourcePath());
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(Map.of("error", "Not found", "path", String.valueOf(ex.getResourcePath())));
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException ex) {
    log.warn("Bad request: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("error", ex.getMessage() != null ? ex.getMessage() : "Bad request"));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, String>> unhandled(Exception ex) {
    log.error("Unhandled error:", ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(Map.of("error", "Internal server error"));
  }
}
