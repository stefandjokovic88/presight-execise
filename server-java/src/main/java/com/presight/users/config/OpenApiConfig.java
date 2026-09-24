package com.presight.users.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class OpenApiConfig implements WebMvcConfigurer {

  /**
   * springdoc maps {@code /api-docs} (no trailing slash) → Swagger UI.
   * Browsers often follow a cached redirect from the Node server ({@code /api-docs} →
   * {@code /api-docs/}), and Spring Boot 3 treats those as different paths — so the slash
   * variant must redirect explicitly.
   */
  @Override
  public void addViewControllers(ViewControllerRegistry registry) {
    registry.addRedirectViewController("/api-docs/", "/swagger-ui/index.html");
  }

  @Bean
  public OpenAPI presightOpenApi() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Presight Users API")
                .description(
                    "Searchable, filterable, paginated user directory API (Java/Spring Boot).")
                .version("1.0.0"))
        .servers(
            List.of(
                new Server().url("http://localhost:3001").description("Local development"),
                new Server().url("http://localhost:8080").description("Production-style / Docker")));
  }
}
