# Componentes Globales (`src/components/`)

Este directorio contiene componentes de interfaz de usuario de presentación, que son **reutilizables a nivel global** en diferentes vistas y características del sistema.

## Componentes Disponibles

*   **`Navbar.jsx`**: Barra de navegación global. Contiene el branding del sistema ("LogiTrack ERP"), enlaces de navegación (`/`, `/login`, `/register`) y un botón interactivo para disparar la creación de un nuevo producto desde cualquier página de manera global.

## Buenas Prácticas
*   Solo coloca aquí componentes que sean verdaderamente genéricos y compartidos (como botones estándar, modales base, barras de navegación, spinners de carga, etc.).
*   Si un componente pertenece o se usa exclusivamente dentro de una característica del negocio (como un formulario de inventario), debe ubicarse en su respectiva subcarpeta dentro de `src/features/<nombre-feature>/components/`.
