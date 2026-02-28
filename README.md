# Smiley Vision Frontend

Frontend web de Smiley Vision construido con Vue 3 + Vite, organizado con **Screaming Architecture** (la estructura de carpetas “grita” el dominio del negocio: marketing, identidad, catálogo, registro, inventario, administración de productos).

# ¿Qué es Smiley Vision?
Smiley Vision es una empresa de distribución de productos para óptica que actualmente tiene sucursales en Ciudad de México, Mérida y Campeche. La empresa únicamente puede vender productos a ópticos; es decir, profesionales de la salud visual.

![Smiley Vision presentación](https://media-cdn.atlassian.com/us-east-1/v2/cdn/client/a3a9e008-34e8-48ed-824a-f2c0eef1b8c1/file/139b1493-10d8-4d9e-8dd9-53e86cffc9a4/image?allowAnimated=true&collection=contentId-950283&height=0&max-age=2592000&mode=full-fit&source=mediaCard&upscale=false&width=1920&token=eyJhbGciOiJSUzI1NiIsImtpZCI6ImdlbmVyaWMta2V5cGFpci9kdC1hcGktZmlsZXN0b3JlL2Nkbi1hdXRoLS1xa2NqdjlqazVnbTg1anZrIn0.eyJzdWIiOiJhM2E5ZTAwOC0zNGU4LTQ4ZWQtODI0YS1mMmMwZWVmMWI4YzEiLCJjbGllbnRJZCI6ImEzYTllMDA4LTM0ZTgtNDhlZC04MjRhLWYyYzBlZWYxYjhjMSIsImV4dElkIjoiMDUxNWJhYzUtNjYzMi00MDM3LWJmZDctZTJjNTg2OTU1ZGMwIiwiaW50SWQiOiIwNTE1YmFjNS02NjMyLTQwMzctYmZkNy1lMmM1ODY5NTVkYzAiLCJpc29sYXRlZCI6ZmFsc2UsInJlc291cmNlVHlwZSI6MywiaXBhIjpmYWxzZSwiZmIiOiJ0ZHAtb25seSIsImZtIjoidGRwLW9ubHkiLCJjbiI6InRkcC1vbmx5IiwicnMiOiJ0ZHAtb25seSIsImlzcyI6ImdlbmVyaWMta2V5cGFpci9kdC1hcGktZmlsZXN0b3JlIiwiYXVkIjoibWVkaWEiLCJpYXQiOjE3NzExMTc0MjgsIm5iZiI6MTc3MTExNzQyOCwiZXhwIjoxNzcxMTIwMzA2LCJqdGkiOiIzN2FiZDVkNzZjODI1ZWZlOTJiMTM2ZDc2ODdjOGI4ODA5NTVkZjM4In0.pkcuTmD9uHkX9h5UxCznzQ8E6d_9P1wxp_7Gqwg3JapsdbVSiKlXejCLC5Gbqx1dQ0V9penzPQT_VxOXWtLYQmq5tTi2J_3MB0AY34bTf94-7-fWubuDmxdVeSRj_yOYgWv03VEhL0UM6C_VqpERpnZ2nShC7KhRZUOs21kz3rNeN8KISA7c3FAVNW887cQOIUIIFdB-LVM3PJJkL7O1MC83bd5Rnm6tI8sQe2RwIT4E7-s-PseHpYBSGZSzCL9Ko0BCxpquVt6tuJTHH82PdlwrLgPe3BHvO0YAGBcvRZDbzOb_g2bc-kjGUOk77C5s7TKClfpiUhIzKdN6DMnejg&accept=image%2Fwebp&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9tZWRpYS1jZG4uYXRsYXNzaWFuLmNvbS91cy1lYXN0LTEvdjIvY2RuL2NsaWVudC9hM2E5ZTAwOC0zNGU4LTQ4ZWQtODI0YS1mMmMwZWVmMWI4YzEvZmlsZS8xMzliMTQ5My0xMGQ4LTRkOWUtOGRkOS01M2U4NmNmZmM5YTQvaW1hZ2U~KiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc3MTEyMDMwNn19fV19&Key-Pair-Id=K3CEQBLVYJW0FT&Signature=5LH8APzluKGiF3Xvum2Y5oi-KdJoI00fkXi1E8FyR5xPASzDkEArfvsRb9gfXaFf1i~EgnJXPKW4YhtCujggiKnl6aYtnKBfJfmcW-gwUR0TA7GgGqG2FovDVa448tXO-pdrFsyfQwXKZqjCLuRiPuU5r1-76Gz8hP~aAB875CxvAssUmiE3IA~Gf~mq96SasoXP2VCT9L9ucwmKrk7jP3px6NU4HMtYqsY9v8jXOlFI-k8GBVPGNS~1vsY6Tl19El2WgmVX3kiIbb7xFBxNJdmbPmxfpHQOPfOYRUK9CweLxNLH~RVxg9brS0~Aq5FQoPtla9ijXC-m2tyDZhJdNg__)

## Tabla de contenido

1. [Objetivo del proyecto](#objetivo-del-proyecto)
2. [Stack tecnológico](#stack-tecnológico)
3. [Requisitos previos](#requisitos-previos)
4. [Instalación y puesta en marcha](#instalación-y-puesta-en-marcha)
5. [Variables de entorno (.env)](#variables-de-entorno-env)
6. [Scripts disponibles](#scripts-disponibles)
7. [Arquitectura del proyecto (Screaming Architecture)](#arquitectura-del-proyecto-screaming-architecture)
8. [Flujo general de ejecución](#flujo-general-de-ejecución)
9. [Mapa de rutas](#mapa-de-rutas)
10. [Endpoints consumidos por el frontend](#endpoints-consumidos-por-el-frontend)
11. [Guía para modificar el código](#guía-para-modificar-el-código)
12. [Documentación por archivo](#documentación-por-archivo)
13. [Convenciones y recomendaciones](#convenciones-y-recomendaciones)
14. [Troubleshooting](#troubleshooting)

---

## Objetivo del proyecto

Este frontend resuelve 6 dominios principales:

1. `marketing`: vistas públicas de marca (home, about, contact, 404).
2. `identity`: autenticación y sesión.
3. `registration`: solicitud de alta y registro con token.
4. `catalog`: exploración y búsqueda de productos.
5. `admin-products`: alta/edición/eliminación de productos.
6. `inventory`: gestión de stock por sucursal.

La arquitectura está orientada a mantener el crecimiento por dominio, evitando mezclar lógica de negocio en carpetas genéricas.

---

## Stack tecnológico

- `Vue 3` (Composition API)
- `Vite`
- `Vue Router`
- `Pinia`
- `Axios`
- `Tailwind CSS`
- `PrimeVue` + `PrimeIcons`

---

## Requisitos previos

- Node.js 20+ (recomendado LTS)
- npm 10+
- Backend Laravel/API disponible en `http://127.0.0.1:8000`

Verificación rápida:

```bash
node -v
npm -v
```

---

## Instalación y puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Crea el archivo `.env` en la raíz del proyecto (ver sección de variables).

3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

4. Abre en navegador:

```txt
http://localhost:3000
```

---

## Variables de entorno (.env)

Crea un archivo `.env` en la raíz del proyecto con **estas variables obligatorias**:

```env
VITE_API_BASE=http://127.0.0.1:8000/api
VITE_BACKEND_BASE=http://127.0.0.1:8000/
```

### Significado de cada variable

- `VITE_API_BASE`: base para llamadas REST (`/api/...`).
- `VITE_BACKEND_BASE`: base del backend para recursos públicos (ej. imágenes en `/storage`).

---

## Scripts disponibles

- `npm run dev`: arranca Vite en modo desarrollo (puerto 3000).
- `npm run build`: genera build de producción en `dist/`.
- `npm run preview`: sirve localmente el build generado.

---

## Arquitectura del proyecto (Screaming Architecture)

```txt
src/
  app/
    main.js
    App.vue
    router/
      guards/
      modules/
      index.js

  contexts/
    marketing/
    identity/
    registration/
    catalog/
    admin-products/
    inventory/

  shared/
    ui/
    infrastructure/
    config/
    utils/

  assets/
```

### Principios aplicados

1. **Orientación al dominio**: cada carpeta de `contexts/` representa una capacidad de negocio.
2. **UI compartida separada**: componentes globales viven en `shared/ui`.
3. **Infraestructura centralizada**: HTTP se concentra en `shared/infrastructure/http/api.js`.
4. **Ruteo modular**: rutas por dominio en `app/router/modules`.
5. **Protección transversal**: guards en `app/router/guards`.

---

## Flujo general de ejecución

1. `index.html` monta Vue con `src/app/main.js`.
2. `main.js` registra router, pinia y PrimeVue.
3. `App.vue` renderiza layout global (`Navbar`, contenido de ruta y `Footer`).
4. `Vue Router` resuelve ruta y aplica guards para rutas admin.
5. Las vistas llaman `api` (instancia Axios) o `services` para comunicarse con backend.
6. La instancia Axios añade token Bearer cuando existe sesión.

---

## Mapa de rutas

| Path | Name | Módulo | Protección |
|---|---|---|---|
| `/` | `home` | `marketing.routes.js` | Pública |
| `/about` | `about` | `marketing.routes.js` | Pública |
| `/contact` | `contact` | `marketing.routes.js` | Pública |
| `/login` | `login` | `identity.routes.js` | Pública |
| `/register` | `register` | `registration.routes.js` | Pública |
| `/admin/register` | `admin-register` | `registration.routes.js` | Auth + Admin |
| `/shop` | `shop` | `catalog.routes.js` | Pública |
| `/shop/micas` | `shop-Micas` | `catalog.routes.js` | Pública |
| `/shop/micas/search` | `shop-search-Micas` | `catalog.routes.js` | Pública |
| `/shop/armazones` | `shop-Armazones` | `catalog.routes.js` | Pública |
| `/shop/armazones/search` | `shop-search-Armazones` | `catalog.routes.js` | Pública |
| `/shop/equipos` | `shop-Equipos` | `catalog.routes.js` | Pública |
| `/shop/equipos/search` | `shop-search-Equipos` | `catalog.routes.js` | Pública |
| `/shop/products/:code` | `product` | `catalog.routes.js` | Pública |
| `/admin/products` | `admin-products` | `adminProducts.routes.js` | Auth + Admin |
| `/admin/products/create` | `admin-products-create` | `adminProducts.routes.js` | Auth + Admin |
| `/admin/products/modify` | `admin-products-modify` | `adminProducts.routes.js` | Auth + Admin |
| `/admin/products/modify/:code` | `admin-products-modify-form` | `adminProducts.routes.js` | Auth + Admin |
| `/admin/products/availability` | `admin-products-availability` | `inventory.routes.js` | Auth + Admin |
| `/admin/products/availability/:code` | `admin-products-availability-form` | `inventory.routes.js` | Auth + Admin |
| `/:catchAll(.*)` | `not-found` | `router/index.js` | Pública |

---

## Endpoints consumidos por el frontend

### Identity

- `POST /login`
- `POST /logout`
- `GET /check-register-token?token=...`

### Registration

- `POST /register-requests`
- `GET /register-requests`
- `GET /register-requests/:id`
- `DELETE /register-requests/:id`
- `POST /send-register-mail`
- `GET /stores`
- `POST /register`
- `POST /mark-register-token`

### Catalog

- `GET /product-types`
- `GET /micas`
- `GET /armazones`
- `GET /equipos`
- `GET /products/query/:query/:typeId`
- `GET /products/:code`
- `GET /product-existence/:productId`
- `GET /product-existence/:productId/:officeId`

### Admin Products

- `POST /products` (FormData)
- `PATCH /products/:code`
- `DELETE /products/:code`

### Inventory

- `GET /offices`
- `POST /product-existence`

---

## Guía para modificar el código

## 1) Si quieres agregar una nueva página pública

1. Crea la vista en `src/contexts/marketing/pages/`.
2. Registra la ruta en `src/app/router/modules/marketing.routes.js`.
3. Si debe salir en menú, agrega link en `src/shared/ui/layout/Navbar.vue`.

## 2) Si quieres agregar una nueva funcionalidad de catálogo

1. Crea la vista/componente en `src/contexts/catalog/pages` o `components`.
2. Agrega llamadas HTTP en `src/contexts/catalog/services/catalogService.js`.
3. Si aplica, crea composable en `src/contexts/catalog/composables`.
4. Añade ruta en `src/app/router/modules/catalog.routes.js`.

## 3) Si quieres agregar reglas de acceso

1. Agrega guard en `src/app/router/guards/`.
2. Encadena guard en `src/app/router/index.js`.

## 4) Si quieres cambiar API base o backend base

1. Edita `.env`.
2. Reinicia `npm run dev` (Vite lee env al iniciar).

## 5) Si quieres extraer lógica de una página a composable

1. Crear composable en el contexto correspondiente.
2. Mover estado (`ref`, `reactive`), métodos y efectos (`onMounted`).
3. Dejar en la vista sólo render y wiring.

---

## Documentación por archivo

A continuación, se describe cada archivo de `src/` y para qué modificarlo.

### `src/app`

- `src/app/main.js`
  - Inicializa la app, registra router, pinia, PrimeVue y ToastService.
  - Modifica aquí integraciones globales de framework (plugins, temas, providers).

- `src/app/App.vue`
  - Layout raíz: `Navbar` + `RouterView` + `Footer`.
  - Controla overlay del menú móvil mediante evento emitido por `Navbar`.

#### Router

- `src/app/router/index.js`
  - Compone todas las rutas de módulos.
  - Aplica guard global: toda ruta cuyo `name` inicia con `admin` requiere auth + admin.

- `src/app/router/guards/requireAuth.js`
  - Redirige a `login` si no hay sesión (`auth.isAuthenticated`).

- `src/app/router/guards/requireAdmin.js`
  - Redirige a `login` si usuario autenticado no tiene rol admin (`auth.isAdmin`).

- `src/app/router/modules/marketing.routes.js`
  - Rutas públicas de marketing.

- `src/app/router/modules/identity.routes.js`
  - Ruta de login.

- `src/app/router/modules/registration.routes.js`
  - Ruta de flujo de registro y bandeja admin de solicitudes.

- `src/app/router/modules/catalog.routes.js`
  - Rutas de catálogo, búsquedas y detalle de producto.

- `src/app/router/modules/adminProducts.routes.js`
  - Rutas admin para gestionar catálogo (crear/editar/eliminar).

- `src/app/router/modules/inventory.routes.js`
  - Rutas admin para stock por sucursal.

### `src/assets`

- `src/assets/main.css`
  - Carga fuente, `primeicons` y capas Tailwind (`base/components/utilities`).

- `src/assets/images/smiley_logo.png`
  - Logo en navbar.

- `src/assets/images/home_image.jpeg`
  - Imagen hero en Home.

- `src/assets/images/admin/products/admin-products-create.png`
  - Imagen de acceso rápido en panel admin.

- `src/assets/images/admin/products/admin-products-modify.png`
  - Imagen de acceso rápido en panel admin.

- `src/assets/images/admin/products/admin-products-availability.png`
  - Imagen de acceso rápido en panel admin.

### `src/contexts/marketing`

- `src/contexts/marketing/pages/HomeView.vue`
  - Landing principal y toasts de bienvenida/solicitud enviada.
  - Si cambias CTAs, actualiza rutas de `Button`.

- `src/contexts/marketing/pages/AboutView.vue`
  - Vista de about (actualmente placeholder).
  - Lugar correcto para contenido institucional.

- `src/contexts/marketing/pages/ContactView.vue`
  - Tarjetas de contacto (teléfono/whatsapp/correo).
  - Si cambias canales reales, actualiza props `to` de `Button`.

- `src/contexts/marketing/pages/NotFoundView.vue`
  - Pantalla 404 para rutas no existentes.

### `src/contexts/identity`

- `src/contexts/identity/pages/LoginView.vue`
  - Formulario de login, invoca `auth.login` y redirige a home.
  - Muestra toast de registro exitoso cuando llega query `justRegistered=true`.

- `src/contexts/identity/stores/auth.js`
  - Store central de sesión.
  - Persiste token y usuario en `localStorage`.
  - Exposición: `isAuthenticated`, `isAdmin`, `login`, `logout`, `checkToken`.

- `src/contexts/identity/services/authService.js`
  - Capa de servicios HTTP de identity.
  - Actualmente no acoplada por completo desde las vistas, pero lista para migración limpia.

- `src/contexts/identity/composables/useLoginForm.js`
  - Composable para estado de formulario login.
  - Sirve como base para extraer la lógica de `LoginView.vue`.

### `src/contexts/registration`

#### Pages

- `src/contexts/registration/pages/UserRegisterView.vue`
  - Gateway de registro:
    - con token válido: muestra `RegisterUserView`;
    - sin token: muestra `RequestRegisterView`;
    - token inválido: muestra `InvalidTokenView`.

- `src/contexts/registration/pages/RequestRegisterView.vue`
  - Formulario de solicitud de registro (email + descripción).

- `src/contexts/registration/pages/RegisterUserView.vue`
  - Registro final de usuario usando token validado.
  - Carga tiendas, define rol y tienda asociada, registra usuario y marca token usado.

- `src/contexts/registration/pages/InvalidTokenView.vue`
  - Mensaje de token inválido/expirado/no autorizado.

- `src/contexts/registration/pages/RegisterView.vue`
  - Vista admin de solicitudes pendientes.
  - Permite aceptar (envía correo + elimina solicitud) o rechazar (elimina solicitud).

#### Services

- `src/contexts/registration/services/registrationService.js`
  - Capa de funciones API para registro.
  - Ideal para desacoplar completamente las páginas de llamadas Axios directas.

#### Composables (scaffold actual)

- `src/contexts/registration/composables/useRegistrationGateway.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** contener la lógica de selección de vista por token/admin.

- `src/contexts/registration/composables/useRegistrationRequest.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** manejar formulario de solicitud y envío.

- `src/contexts/registration/composables/useCompleteRegistration.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** encapsular validaciones/estado del formulario de alta final.

- `src/contexts/registration/composables/useRegistrationRequestsAdmin.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** administrar listado, aceptar/rechazar solicitudes en panel admin.

### `src/contexts/catalog`

#### Pages

- `src/contexts/catalog/pages/ShopView.vue`
  - Página raíz de tienda, obtiene tipos de producto y muestra tarjetas por categoría.

- `src/contexts/catalog/pages/MicasView.vue`
  - Catálogo de micas (`GET /micas`).

- `src/contexts/catalog/pages/ArmazonesView.vue`
  - Catálogo de armazones (`GET /armazones`).

- `src/contexts/catalog/pages/EquiposView.vue`
  - Catálogo de equipos (`GET /equipos`).

- `src/contexts/catalog/pages/SearchMicasView.vue`
  - Búsqueda para tipo `1`.

- `src/contexts/catalog/pages/SearchArmazonesView.vue`
  - Búsqueda para tipo `2`.

- `src/contexts/catalog/pages/SearchEquiposView.vue`
  - Búsqueda para tipo `3`.

- `src/contexts/catalog/pages/ProductView.vue`
  - Detalle de producto por `code`.
  - Muestra imagen, descripción, precio formateado, disponibilidad y selector de cantidad.

#### Services

- `src/contexts/catalog/services/catalogService.js`
  - API del contexto catálogo (tipos, listas, búsqueda, detalle, existencia).

#### Components (scaffold actual)

- `src/contexts/catalog/components/ProductCard.vue`
  - **Estado actual:** wrapper con `<slot />`.
  - **Propósito esperado:** tarjeta reutilizable de producto (imagen, nombre, código, acciones).

- `src/contexts/catalog/components/ProductGrid.vue`
  - **Estado actual:** wrapper con `<slot />`.
  - **Propósito esperado:** layout reutilizable para grillas/listas de productos.

#### Composables (scaffold actual)

- `src/contexts/catalog/composables/useProductTypes.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** carga/estado de tipos de producto para `ShopView`.

- `src/contexts/catalog/composables/useCatalogByType.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** listas por categoría (micas/armazones/equipos).

- `src/contexts/catalog/composables/useCatalogSearch.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** estado de búsqueda, loading y resultados.

- `src/contexts/catalog/composables/useProductDetail.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** detalle, existencia y cantidad de `ProductView`.

### `src/contexts/admin-products`

#### Pages

- `src/contexts/admin-products/pages/ManageProductsView.vue`
  - Menú principal de acciones admin sobre productos (crear, editar, disponibilidad).

- `src/contexts/admin-products/pages/ModifyProductView.vue`
  - Buscador admin para localizar producto a editar.

- `src/contexts/admin-products/pages/CreateProductForm.vue`
  - Formulario para crear producto con imagen (`FormData`).

- `src/contexts/admin-products/pages/ModifyProductForm.vue`
  - Formulario para editar nombre, descripción y precio.
  - Incluye modal de confirmación de borrado.

#### Services

- `src/contexts/admin-products/services/adminProductsService.js`
  - API de administración de productos: tipos, búsqueda, crear, consultar estado, actualizar y eliminar.

#### Composables (scaffold actual)

- `src/contexts/admin-products/composables/useAdminProductSearch.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** encapsular búsqueda de productos en admin.

- `src/contexts/admin-products/composables/useCreateProductForm.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** lógica de validación/subida de producto.

- `src/contexts/admin-products/composables/useModifyProductForm.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** manejo de estado inicial, cambios y update/delete.

### `src/contexts/inventory`

#### Pages

- `src/contexts/inventory/pages/ManageProductAvailabilityView.vue`
  - Buscador admin para seleccionar producto a gestionar stock.

- `src/contexts/inventory/pages/ManageProductAvailabilityForm.vue`
  - Gestión de stock por sucursal:
    - carga producto,
    - carga sucursales,
    - consulta stock por sucursal,
    - actualiza stock,
    - muestra stock total.

#### Services

- `src/contexts/inventory/services/inventoryService.js`
  - API para tipos, búsqueda, sucursales y stock.

#### Composables (scaffold actual)

- `src/contexts/inventory/composables/useInventorySearch.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** estado de búsqueda de inventario.

- `src/contexts/inventory/composables/useProductAvailabilityForm.js`
  - **Estado actual:** retorna `{}`.
  - **Propósito esperado:** encapsular estado y acciones del formulario de disponibilidad.

### `src/shared`

#### Infrastructure

- `src/shared/infrastructure/http/api.js`
  - Instancia central de Axios.
  - Adjunta `Authorization: Bearer <token>` si hay sesión.
  - Soporta JSON y `FormData`.
  - Normaliza errores para exponer `error.response.data` cuando aplica.

#### Config

- `src/shared/config/env.js`
  - Objeto de variables de entorno para consumo centralizado.
  - Actualmente lee `VITE_API_BASE`, `VITE_BACKEND_BASE`, `BASE_URL`.

#### UI

- `src/shared/ui/layout/Navbar.vue`
  - Navegación completa desktop/mobile.
  - Cambia links por estado de autenticación/rol.
  - Implementa cierre de sesión y click-outside en menú móvil.

- `src/shared/ui/layout/Footer.vue`
  - Footer global del sitio.

- `src/shared/ui/components/Button.vue`
  - Componente reutilizable para botón enlazable.
  - Si `to` es URL externa usa `<a>`, si no usa `RouterLink`.

- `src/shared/ui/feedback/AppLoader.vue`
  - Loader visual reutilizable para estados de carga.

- `src/shared/ui/feedback/useAppToast.js`
  - Wrapper de `useToast` (PrimeVue) para estandarizar feedback.

#### Utils

- `src/shared/utils/formatPrice.js`
  - Formateador de precio con separador de miles.
  - Útil para centralizar formato en vistas de catálogo.

- `src/shared/utils/normalizeApiError.js`
  - Normaliza estructura de errores backend (`error.errors`) y devuelve primer mensaje.

---

## Convenciones y recomendaciones

1. Mantener lógica de negocio en `contexts/<domain>/services` y `composables`.
2. Mantener vistas (`pages`) enfocadas en render y orquestación.
3. Reutilizemos `shared/infrastructure/http/api.js` para todas las llamadas HTTP.
4. Usa `shared/ui/feedback` para loaders y toasts comunes.
5. Evite referencias cruzadas entre contextos salvo en casos necesarios (ej: store auth).
6. Para rutas admin, conserva prefijo de nombre `admin-` para que el guard global siga funcionando.

---
> Documentación y refactorización hecha por: Jose Manuel Castillo Queh (14/02/2026)
