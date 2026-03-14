# Reporte de bug backend - cantidades de carrito

## Resumen

Se detecto un bug en backend donde, al actualizar la cantidad de un item del carrito, la cantidad termina aplicandose a otros items del mismo carrito.

Ejemplo observado:
- Item A en cantidad `1`
- Item B en cantidad `1`
- Se actualiza Item A a `6`
- Resultado en `GET /api/cart-items`: Item A = `6`, Item B = `6` (incorrecto)

## Donde esta el problema (solo lectura)

### 1) Controlador que ejecuta la actualizacion

Archivo:
- `SmileyVisionBackend/app/Http/Controllers/ShoppingCartController.php`

Seccion:
- Metodo `addProductToCart()`
- Lineas aproximadas: 34-42

Codigo relevante:
- `ShoppingCartItem::updateOrCreate([...cart_id, product_item_id...], ['quantity' => ...])`

### 2) Modelo con clave primaria no soportada por Eloquent

Archivo:
- `SmileyVisionBackend/app/Models/ShoppingCartItem.php`

Seccion:
- Lineas aproximadas: 10-13

Codigo relevante:
- `public $incrementing = false;`
- `protected $primaryKey = null;`

### 3) Migracion con llave primaria compuesta

Archivo:
- `SmileyVisionBackend/database/migrations/2026_02_19_180615_create_shopping_cart_items_table.php`

Seccion:
- Linea aproximada: 25

Codigo relevante:
- `primary(['cart_id', 'product_item_id'])`

## Causa tecnica

Laravel Eloquent no maneja claves primarias compuestas de forma nativa.  
El flujo `updateOrCreate + save()` sobre un modelo con `primaryKey = null` y PK compuesta puede generar actualizaciones no acotadas al registro esperado.

Eso explica por que al cambiar `quantity` de un item, se refleja en mas filas de ese carrito.

## Endpoint afectado

- `POST /api/cart-items`

## Alcance

- Es un bug de logica/persistencia en backend.
- No se corrige de forma definitiva desde frontend sin cambiar backend.

## Estado del frontend

- Frontend se dejo como estaba antes del workaround anterior solicitado.
- No se realizo ninguna modificacion en backend.
