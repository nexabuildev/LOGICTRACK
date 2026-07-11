package com.logictrack.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration le dice a Spring que lea esto al arrancar el servidor
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**") // Aplicar a todos nuestros endpoints
                        .allowedOrigins("http://localhost:5173", "http://localhost:3000") // Puertos típicos de React/Vite
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Verbos HTTP permitidos
                        .allowedHeaders("*") // Permitir cualquier cabecera (como tokens de seguridad futuros)
                        .allowCredentials(true); // Permitir el envío de cookies o credenciales de sesión
            }
        };
    }
}