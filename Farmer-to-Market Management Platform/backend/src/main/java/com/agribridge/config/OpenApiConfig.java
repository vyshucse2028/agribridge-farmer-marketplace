package com.agribridge.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger configuration.
 * Visit: http://localhost:8080/swagger-ui.html
 */
@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "AgriBridge API",
        version = "1.0",
        description = "Farmer-to-Market Management Platform REST API",
        contact = @Contact(name = "AgriBridge Team", email = "support@agribridge.com")
    )
)
@SecurityScheme(
    name = "bearerAuth",
    description = "JWT Bearer token authentication",
    scheme = "bearer",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
