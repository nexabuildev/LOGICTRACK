# Directorio de Código Fuente (`src/`)

Este directorio contiene el código principal de la aplicación React.

## Archivos y Subdirectorios

*   **`main.jsx`**: Punto de entrada de la aplicación. Configura e inicializa React y monta el componente `AppRouter` en el DOM de la página.
*   **`App.jsx`**: Actúa como el Dashboard de Inventario principal. Organiza la cabecera, la visualización de la lista de productos y los modales para añadir productos.
*   **`App.css`**: Estilos globales y específicos del Dashboard de la aplicación.
*   **`index.css`**: Archivo CSS que inicializa Tailwind CSS.
*   **`api/`**: Contiene la configuración base de las llamadas HTTP al backend.
*   **`assets/`**: Almacena recursos multimedia estáticos (imágenes, SVGs).
*   **`components/`**: Aloja componentes reutilizables a nivel global (no atados a una característica específica).
*   **`features/`**: Contiene los módulos funcionales de la aplicación, agrupados por su dominio de negocio (`auth`, `inventory`, etc.).
*   **`routes/`**: Define la configuración de rutas y navegación de la aplicación web.
