# Características y Módulos de Dominio (`src/features/`)

Este directorio implementa un diseño modular orientado a características (**feature-based architecture**). Cada carpeta dentro de `features` representa un dominio de negocio independiente con sus propias vistas, componentes, hooks, utilidades y estado.

## Características Actuales

1.  **`auth/`**: Gestión de autenticación de usuarios (registro, inicio de sesión, recuperación de contraseña).
2.  **`inventory/`**: Gestión de existencias y productos (listado, creación, edición, stock, precios).

## Ventajas de esta estructura
*   **Aislamiento y Escalabilidad:** Es fácil añadir una nueva funcionalidad (por ejemplo, `billing` o `suppliers`) creando una nueva carpeta de feature sin alterar otras partes del sistema.
*   **Fácil localización de código:** Todo lo relacionado con el inventario reside dentro de la carpeta `inventory/`, evitando tener carpetas gigantescas y desorganizadas de componentes a nivel raíz.
