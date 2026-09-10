# LogiTrack ERP

ERP full-stack para gestión de inventario multi-tienda, punto de venta y tienda online, construido con Spring Boot y React.

LogiTrack simula el sistema interno de una cadena de tiendas de hardware informático: varias tiendas físicas, un catálogo compartido, un TPV en cada local y una tienda online abierta al público. Todo corre sobre un único inventario, con trazabilidad completa de cada movimiento de stock.

## Por qué lo hice

Quería construir algo más ambicioso que un CRUD con login. Buscando un dominio con problemas de datos reales, llegué al inventario: en una tienda que vende hardware (componentes, equipos nuevos y de segunda mano), el mismo producto puede salir por tres sitios distintos a la vez — el TPV de una tienda física, un traspaso interno hacia otra tienda, o una compra online desde el marketplace. Si cada canal llevara su propio contador de stock, en algún momento se desincronizan y alguien vende algo que ya no existe.

Ese fue el reto que quise resolver: un único `Product` como fuente de verdad del stock, y cada cambio (alta, venta, ajuste, traspaso, devolución) registrado como un movimiento en una tabla independiente, al estilo de un kardex contable. Así el número de stock nunca es "mágico": siempre se puede reconstruir a partir de su historial, y queda constancia de quién hizo qué y por qué.

A partir de ahí el proyecto creció de forma natural hacia un ERP más completo, porque un inventario real no vive solo: necesita caja, proveedores, devoluciones, roles distintos por empleado y alguien avisando cuando algo se queda sin stock.

## Qué hace

- **Catálogo e inventario**: productos con SKU, precio, condición (nuevo/usado), número de serie y stock por tienda.
- **Kardex de movimientos**: cada entrada, salida, ajuste o traspaso de stock queda registrado con usuario, motivo y fecha.
- **Multi-tienda**: cada producto pertenece a una tienda; los traspasos entre tiendas se crean y se confirman como un flujo con dos pasos.
- **TPV (punto de venta)**: carrito, pago en efectivo/tarjeta/mixto o a deuda, clientes con puntos de fidelidad y crédito en tienda, cierre de caja diario.
- **Tienda online (marketplace)**: catálogo público donde un cliente registrado puede comprar directamente, descontando el mismo stock que ve el TPV.
- **Compras a proveedores**: pedidos, recepción de mercancía y control de pendientes.
- **Devoluciones de venta** y **papelera de reciclaje** para productos eliminados (borrado lógico, no destructivo).
- **Roles y permisos** (USER, TÉCNICO, ADMIN) con matriz de permisos y gestión de usuarios.
- **Registro de auditoría** de acciones críticas: login, cambios de rol, alta/edición/borrado de productos.
- **Autenticación con JWT** y verificación en dos pasos por código (simulada por consola en desarrollo), más recuperación de contraseña.
- **Alertas automáticas de stock bajo**: una tarea programada revisa el inventario y envía por correo un informe en PDF a los administradores cuando un producto baja de su mínimo.
- **Exportación/importación**: catálogo en CSV, facturas y reportes en PDF.
- **Extras de gestión**: CRM básico de clientes, control horario de empleados, promociones y analítica por tienda.

## Decisiones técnicas

- **Spring Boot + PostgreSQL en vez de algo más ligero**: una venta en el TPV descuenta stock, suma puntos, aplica crédito y dispara el envío de una factura, todo en la misma operación. Necesitaba transacciones ACID de verdad (`@Transactional`), no una API que confirme mitad de la operación si algo falla a medio camino.
- **Una tabla de movimientos en vez de solo un campo `stock`**: podría haber actualizado directamente `stockQuantity` y ya está, pero entonces el histórico se pierde. Con `StockTransaction` como kardex, el stock actual es siempre reconstruible y auditable, y cada canal de venta escribe ahí en lugar de "confiar" en el número que ve.
- **Un único inventario para TPV y marketplace**: en vez de mantener un stock separado para la tienda online (que luego habría que sincronizar), ambos canales leen y escriben sobre el mismo `Product`. Es la decisión que obliga a que todo lo demás (transacciones, kardex) esté bien resuelto.
- **Permisos verificados en el backend, no solo ocultos en el frontend**: un USER solo puede editar sus propios productos, un TÉCNICO puede ajustar stock de cualquiera, un ADMIN lo ve todo. Esas reglas están en el servicio de Spring, no solo en qué botones se muestran en React.
- **Docker Compose con Postgres, MailHog y las dos apps**: para que cualquiera pueda levantar el proyecto entero (base de datos, correo simulado, backend y frontend) sin instalar nada más que Docker, y el correo de recuperación de contraseña o de alerta de stock se pueda ver en una bandeja de entrada real sin usar un servidor de correo de verdad.

## Estructura del repo

Monorepo con dos carpetas independientes que se comunican por API REST:

```
SaaS-LogicTrack/
├── backend/    # Spring Boot: entidades, controllers, servicios, tests
└── frontend/   # React + Vite: páginas por feature (auth, inventory)
```

El backend tiene tests unitarios sobre la capa de servicio (por ejemplo `ProductServiceTest`, con Mockito) para cubrir las reglas de negocio del catálogo sin depender de una base de datos real.

## Stack

**Frontend**: React 19 + Vite, React Router, Tailwind CSS, Recharts (gráficas), jsPDF.

**Backend**: Java 25 + Spring Boot, Spring Security, Spring Data JPA / Hibernate, JWT (jjwt), OpenPDF para generación de informes.

**Base de datos**: PostgreSQL.

**Infraestructura**: Docker y Docker Compose (Postgres, MailHog, backend y frontend en contenedores).

## Cómo ejecutarlo en local

Requisitos: Docker y Docker Compose.

```bash
git clone https://github.com/nexabuildev/SaaS-LogicTrack.git
cd SaaS-LogicTrack
docker compose up --build
```

Esto levanta cuatro contenedores:

- Frontend en `http://localhost` (puerto 80)
- Backend (API) en `http://localhost:8080`
- PostgreSQL en `localhost:5455`
- MailHog (bandeja de correo de pruebas) en `http://localhost:8025`

Si prefieres trabajar con el backend y el frontend fuera de Docker (por ejemplo, para tener hot-reload), levanta solo la base de datos y el correo:

```bash
docker compose up postgres-db mailhog-email
```

Y en dos terminales aparte:

```bash
cd backend
./mvnw spring-boot:run    # http://localhost:8080

cd frontend
npm install
npm run dev                # http://localhost:5173
```

La configuración de conexión a la base de datos y al correo tiene valores por defecto en `application.properties`, así que no hace falta tocar nada para que arranque contra el Postgres de Docker Compose.

---

Proyecto personal de Rubén Simón ([@nexabuildev](https://github.com/nexabuildev)). El detalle de arquitectura de red está en `ARCHITECTURE.md`.
