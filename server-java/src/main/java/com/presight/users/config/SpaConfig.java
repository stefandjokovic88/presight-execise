package com.presight.users.config;

import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
public class SpaConfig implements WebMvcConfigurer {

  private final Path clientDist;

  public SpaConfig(@Value("${app.client-dist:}") String clientDist) {
    this.clientDist =
        StringUtils.hasText(clientDist)
            ? Path.of(clientDist).toAbsolutePath().normalize()
            : null;
  }

  boolean clientDistAvailable() {
    return clientDist != null && Files.isDirectory(clientDist) && Files.exists(clientDist.resolve("index.html"));
  }

  Path clientDist() {
    return clientDist;
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    if (!clientDistAvailable()) {
      return;
    }
    String location = clientDist.toUri().toString();
    if (!location.endsWith("/")) {
      location = location + "/";
    }
    registry
        .addResourceHandler("/**")
        .addResourceLocations(location)
        .resourceChain(true)
        .addResolver(
            new PathResourceResolver() {
              @Override
              protected org.springframework.core.io.Resource getResource(
                  String resourcePath, org.springframework.core.io.Resource location)
                  throws java.io.IOException {
                if (resourcePath.startsWith("api/") || "health".equals(resourcePath)) {
                  return null;
                }
                org.springframework.core.io.Resource requested =
                    location.createRelative(resourcePath);
                if (requested.exists() && requested.isReadable()) {
                  return requested;
                }
                // SPA fallback for client-side routes
                return new FileSystemResource(clientDist.resolve("index.html"));
              }
            });
  }
}
