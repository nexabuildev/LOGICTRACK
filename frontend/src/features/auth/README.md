# Módulo de Autenticación (`src/features/auth/`)

Este módulo maneja toda la lógica y vistas relacionadas con la gestión de usuarios, el inicio de sesión y el registro en LogiTrack ERP.

## Vistas Disponibles (`pages/`)

*   **`LoginPage.jsx`**: Formulario interactivo para que los usuarios registrados inicien sesión mediante su correo y contraseña. Conecta con el backend en la ruta `POST /api/auth/login`.
*   **`RegisterPage.jsx`**: Formulario interactivo para la creación de nuevas cuentas de usuario (nombre, email, teléfono, contraseña). Conecta con el backend en la ruta `POST /api/auth/register`.

## Qué debe incluirse aquí
*   Páginas y flujos de login, registro, restablecimiento de contraseña, verificación de correo.
*   Hooks personalizados de autenticación (ej: `useAuth`) para controlar la sesión y tokens JWT.
*   Componentes específicos de autenticación (ej: layouts de login o inputs especializados).
