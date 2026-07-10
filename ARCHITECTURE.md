# Especificación de Arquitectura de Red y Puertos (Entorno Local)

## Mapeo de Puertos
- **Frontend (React):** http://localhost:5173
- **Backend (Spring Boot):** http://localhost:8080
- **Base de Datos (PostgreSQL):** localhost:5455 (Contenedor Docker)

## Flujo de Conectividad
[React Navegador:5173] ──(Peticiones HTTP API)──> [Spring Boot:8080] ──(JDBC Driver)──> [PostgreSQL:5455]