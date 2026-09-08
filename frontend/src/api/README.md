# Configuración de API (`src/api/`)

Este directorio está destinado a albergar la configuración global, clientes HTTP (como instancias de Axios o fetch envueltos) e interceptores para conectar el frontend con la API de LogiTrack.

## Contenido

*   **`config.js`**: Define la constante `API_URL` (`http://localhost:8080/api`) que sirve como URL base para realizar las peticiones HTTP al backend.

> [!TIP]
> **Integración Completada:** Los archivos `LoginPage.jsx`, `RegisterPage.jsx` y `useProducts.js` importan y consumen esta constante, lo que centraliza y facilita cualquier cambio futuro en la URL del backend.
