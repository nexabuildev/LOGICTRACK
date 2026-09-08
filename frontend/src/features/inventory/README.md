# Módulo de Inventario (`src/features/inventory/`)

Este módulo implementa la lógica de negocio, los hooks y los componentes necesarios para visualizar y gestionar el inventario de productos de LogiTrack ERP.

## Componentes (`components/`)

*   **`ProductCard.jsx`**: Componente visual que renderiza una tarjeta con la información básica (SKU, nombre, descripción) de un producto.
*   **`ProductModal.jsx`**: Un contenedor modal con fondo translúcido que envuelve el formulario de creación.
*   **`ProductForm.jsx`**: Formulario interactivo que recopila los campos de SKU, Nombre, Precio y Stock para guardar un producto.

## Hooks de React (`hooks/`)

*   **`useProducts.js`**: Hook personalizado encargado de realizar la petición HTTP de obtención de productos (`GET /api/products`), manejar posibles errores y exponer funciones de actualización (`refreshProducts`).

## Qué debe incluirse aquí
*   Componentes visuales y de entrada específicos del inventario.
*   Lógica y hooks para llamadas a la API de productos (creación, edición, borrado, listado).
*   Estado local o de contexto relacionado únicamente con la visualización de existencias.
