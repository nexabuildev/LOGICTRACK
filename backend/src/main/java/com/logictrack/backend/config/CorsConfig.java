package com.logictrack.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration le dice a Spring que lea esto al arrancar el servidor
@Configuration
public class CorsConfig {

    // Lista separada por comas configurable vía env var CORS_ALLOWED_ORIGINS
    // (ej. https://mi-frontend.pages.dev). Localhost queda de default para dev.
    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000,http://localhost,http://127.0.0.1}")
    private String[] allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Aplicar a todos nuestros endpoints
                        .allowedOrigins(allowedOrigins)
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS") // Verbos HTTP permitidos
                        .allowedHeaders("*") // Permitir cualquier cabecera
                        .exposedHeaders("X-User-Email", "X-User-Role")
                        .allowCredentials(true); // Permitir el envío de cookies o credenciales de sesión
            }
        };
    }
}