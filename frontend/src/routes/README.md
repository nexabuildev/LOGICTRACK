# Sistema de Rutas (`src/routes/`)

Este directorio contiene la configuración de enrutamiento del lado del cliente (Client-Side Routing) para la aplicación.

## Archivos

*   **`AppRouter.jsx`**: Define el componente del enrutador principal utilizando `react-router-dom`. Configura las siguientes rutas públicas:
    *   `/` -> Muestra el Dashboard principal de la aplicación (`App.jsx`).
    *   `/login` -> Muestra la vista de inicio de sesión (`LoginPage.jsx`).
    *   `/register` -> Muestra la vista de registro (`RegisterPage.jsx`).

## Qué debe incluirse aquí
*   Definiciones de enrutamiento y wrappers de rutas protegidas (ej. `ProtectedRoute.jsx` para verificar si un usuario está autenticado antes de ingresar al Dashboard).
*   Configuraciones de menús o layouts de rutas anidadas.
