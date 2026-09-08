# LogicTrack ERP - Frontend

Este directorio contiene el frontend de **LogicTrack**, una aplicación web para la gestión de inventario y ERP desarrollada con React, Vite y Tailwind CSS.

## Tecnologías Utilizadas

*   **React** (v18+)
*   **Vite** (para la compilación y el servidor de desarrollo rápido)
*   **Tailwind CSS** (para los estilos)
*   **React Router DOM** (para la navegación y enrutamiento)

## Scripts Disponibles

En el directorio `frontend`, puedes ejecutar:

*   `npm run dev`: Inicia el servidor de desarrollo local.
*   `npm run build`: Compila la aplicación para producción en la carpeta `dist`.
*   `npm run lint`: Ejecuta el linter (ESLint) para buscar errores de código.
*   `npm run preview`: Previsualiza localmente la compilación de producción.

## Estructura de Directorios

La estructura bajo `src/` sigue un enfoque modular basado en características (features) y componentes globales:

*   `src/api/`: Configuración global de la API.
*   `src/assets/`: Archivos estáticos como imágenes y logotipos.
*   `src/components/`: Componentes globales y compartidos (ej. `Navbar`).
*   `src/features/`: Módulos de funcionalidad independientes (ej. `auth` e `inventory`).
*   `src/routes/`: Configuración del enrutamiento de la aplicación (`AppRouter.jsx`).
