# Implementacion de carrito - Smiley Vision Frontend

## Archivos creados

### `src/contexts/catalog/services/cartService.js`
**Responsabilidad:**
- Encapsular llamadas HTTP al backend para carrito:
  - `GET /api/cart-items`
  - `POST /api/cart-items`
  - `DELETE /api/cart-items/{cartId}/{itemId}`

### `src/contexts/catalog/stores/cart.js`
**Responsabilidad:**
- Manejo global del estado de carrito con Pinia.
- Persistencia de estado de carrito por usuario en frontend.
- Sincronizacion con endpoints reales de carrito (`add/remove`).
- Manejo de cantidades con comportamiento compatible con backend (`updateOrCreate` por `quantity`).
- Exponer `itemCount`, `subtotal`, `hasItems`, `addProduct`, `setItemQuantity`, `removeItem`.

### `src/contexts/catalog/pages/CartView.vue`
**Responsabilidad:**
- Vista principal de carrito:
  - Lista de productos con imagen, nombre, descripcion y precio.
  - Control de cantidad (+/-) y eliminar.
  - Resumen de orden (productos, envio, total).
  - Direccion de entrega principal usando datos reales de direcciones del usuario.
  - Estados de carga y carrito vacio.

## Archivos modificados

### `src/contexts/catalog/pages/ProductView.vue`
**Por que fue modificado:**
- Integrar boton `Agregar al carrito`.
- Conectar con `cart` store para alta de producto.
- Manejar estados de autenticacion, carga y errores al agregar.

### `src/shared/ui/layout/Navbar.vue`
**Por que fue modificado:**
- Agregar acceso al carrito junto al perfil en navbar autenticado.
- Mostrar contador de items en carrito.
- Agregar acceso a carrito en menu movil autenticado.

### `src/app/router/modules/catalog.routes.js`
**Por que fue modificado:**
- Registrar ruta de carrito (`/shop/cart`, `name: cart`).
- Proteger ruta con `requireAuth`.

### `src/shared/utils/productApiAdapters.js`
**Por que fue modificado:**
- Incluir `product_item_id` en producto enriquecido (`enrichProduct`) para poder enviar payload valido a `POST /api/cart-items`.

## Notas tecnicas

- No se modifico backend.
- No se modifico base de datos.
- No se crearon endpoints nuevos.
- La implementacion usa exclusivamente endpoints existentes para operaciones de carrito y direcciones.

## Acoplacion con backend (actualizada)

### Contratos consumidos

- `GET /api/cart-items`
  - Respuesta esperada: arreglo de filas con `cart_id`, `product_item_id`, `quantity`.
  - Este endpoint ahora es la fuente principal para leer el carrito.

- `POST /api/cart-items`
  - Payload usado:
    - `cart_id` (int)
    - `product_item_id` (int)
    - `quantity` (int >= 1)
  - Respuesta usada:
    - objeto `'shopping cart item'` con `cart_id`, `product_item_id`, `quantity`.

- `DELETE /api/cart-items/{cartId}/{itemId}`
  - `itemId` corresponde a `product_item_id`.

- Endpoints de catalogo para enriquecer la vista:
  - `GET /api/product-items`
  - `GET /api/products`
  - Se usan para resolver nombre, descripcion, imagen y precio de cada item del carrito.

### Regla de sincronizacion frontend

1. Leer carrito real desde `GET /api/cart-items`.
2. Enriquecer filas de carrito con `product-items` y `products`.
3. Refrescar estado despues de cada `POST` o `DELETE`.

### Consideracion importante de acoplamiento

- Aunque ya existe `GET /api/cart-items`, cuando el carrito viene vacio no retorna explicitamente un `cart_id`.
- Por eso el frontend conserva una estrategia de resolucion de `cart_id` compatible (cache y candidatos) para poder ejecutar `POST /api/cart-items` incluso en escenarios donde el `cart_id` no viene en la lectura inicial.
