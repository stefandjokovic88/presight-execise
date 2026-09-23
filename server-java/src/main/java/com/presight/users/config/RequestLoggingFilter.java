package com.presight.users.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Logs API/health requests with status + duration so Docker logs are useful for debugging.
 * Static SPA assets are skipped to keep noise down.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RequestLoggingFilter extends OncePerRequestFilter {

  private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getRequestURI();
    if (path == null) {
      return true;
    }
    // Keep logs focused on API traffic (and health)
    return !(path.startsWith("/api") || path.equals("/health") || path.equals("/error"));
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    long started = System.currentTimeMillis();
    try {
      filterChain.doFilter(request, response);
    } finally {
      long ms = System.currentTimeMillis() - started;
      int status = response.getStatus();
      String query = request.getQueryString();
      String uri = query == null ? request.getRequestURI() : request.getRequestURI() + "?" + query;
      if (status >= 500) {
        log.error("{} {} -> {} ({} ms)", request.getMethod(), uri, status, ms);
      } else if (status >= 400) {
        log.warn("{} {} -> {} ({} ms)", request.getMethod(), uri, status, ms);
      } else {
        log.info("{} {} -> {} ({} ms)", request.getMethod(), uri, status, ms);
      }
    }
  }
}
