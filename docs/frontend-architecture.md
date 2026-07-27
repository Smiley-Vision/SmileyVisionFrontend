# Arquitectura frontend — Smiley Vision

> Documento de trabajo, no necesariamente versionado. Objetivo: tener una referencia clara de los
> patrones ya establecidos en el código para poder añadir módulos nuevos (o extender los
> existentes) de forma consistente, sin tener que releer todo el repo cada vez.

## 1. Capas

```
views/pages (.vue)          ← render + wiring. Sin lógica de negocio ni llamadas HTTP directas.
  ↓ usa
composables / stores        ← estado reactivo, orquestación, manejo de loading/error, notificaciones.
  ↓ llama
services (*Service.ts)       ← funciones async puras que envuelven smileyApi. Sin estado.
  ↓ usa
smileyApi + apiProblem       ← instancia Axios única + normalización de errores (RFC 7807).
```

Cada módulo (`src/modules/<dominio>/`) repite esta misma subestructura: `views/` (o `pages/`),
`components/`, `composables/`, `services/`, `schemas/`, `interfaces/`, `utils/`. No todos los
módulos tienen las siete carpetas — solo las que necesitan.

La regla dura es la dirección de la flecha: una vista nunca llama a `smileyApi` directamente, y un
service nunca importa `ref`/`computed` ni conoce PrimeVue. Si una vista empieza a acumular `try/catch`
o estado (`ref`) propio de negocio, esa lógica se extrae a un composable.

## 2. Capa de servicios

Un service es una colección de funciones exportadas, una por endpoint, sin estado ni clases.
Patrón (`modules/*/services/*.ts`):

```ts
export async function getProductService(productId: number) {
  return (await smileyApi.get<ShowProductResponse>(`/products/${productId}`)).data
}
```

- Tipan la forma de la respuesta con una interfaz local (`interface ShowProductResponse { data: Product }`)
  y devuelven `response.data` ya destructurado — el composable que lo llama nunca toca `.data.data`.
- No atrapan errores: el error (ya normalizado a `ApiProblemDetails` por el interceptor de
  `smileyApi`) se propaga tal cual al composable, que decide qué hacer con él.
- Uploads con archivos usan `FormData` construido por el composable/el componente, no por el
  service (ver `useCreateProductSubmit.ts`, `buildBaseFormData`).
- Casos especiales (descarga de blobs, ej. `downloadOrderReportService` en `orderService.ts`)
  también viven aquí, no en la vista.

## 3. Composables

Dos tipos conviven en el código, y vale la pena distinguirlos al crear uno nuevo:

### 3.1 Composables de datos ("cargar y mantener sincronizado")

Ejemplo: `useProductCatalog.ts`. Encapsulan:

- Estado: listas (`ref<T[]>([])`), `isLoading`, `hasError`.
- Derivados de la URL vía `computed` sobre `route.params`/`route.query` (la URL es la fuente de
  verdad para filtros/paginación — así son compartibles y respetan back/forward del navegador).
- Funciones `loadX()` con el patrón fijo:
  ```ts
  isLoading.value = true
  hasError.value = false
  try {
    /* fetch */
  } catch {
    /* reset a estado vacío */ hasError.value = true
  } finally {
    isLoading.value = false
  }
  ```
- `onMounted` para la carga inicial + `watch` sobre las fuentes derivadas de la URL para
  recargar cuando cambian.
- Navegación propia (`selectCategory`, `setPage`, etc.) que hace `router.push` con los query
  params recalculados, en vez de mutar refs locales — de nuevo, la URL manda.

### 3.2 Composables de acción ("ejecutar una operación y reportar el resultado")

Ejemplo: `useCheckout.ts`, `useCreateProductSubmit.ts`, `useModifyProductForm.ts`,
`useOrderStatusTransition.ts`. Encapsulan una o varias funciones async que:

- Exponen `isSubmitting` / `isDeleting` (nunca un `isLoading` genérico compartido con carga de
  datos — cada operación tiene su propio flag).
- Hacen guard de reentrada al inicio: `if (isSubmitting.value) return`.
- Llaman al service, y en el `catch` castean el error a `ApiProblemDetails` y usan
  `firstProblemMessage()` para el toast:
  ```ts
  } catch (error) {
    notify('error', 'No se pudo crear el pedido', firstProblemMessage(error as ApiProblemDetails))
  }
  ```
- Devuelven `boolean`/`null` como señal de éxito para que la vista decida el siguiente paso
  (navegar, resetear un formulario), en vez de navegar ellos mismos (excepción: `useCheckout`,
  que sí navega porque el checkout es una operación de una sola vista).
- No conocen PrimeVue Forms — reciben valores ya validados como parámetros tipados.

### 3.3 Stores de Pinia — solo para estado verdaderamente compartido

`core/stores/auth.ts` y `user/stores/cart.ts` son los únicos stores. Ambos son **setup stores**
(`defineStore('x', () => {...})`, no la sintaxis de opciones). Se usa un store en vez de un
composable cuando el estado debe sobrevivir a través de múltiples vistas no relacionadas
(sesión, carrito) y persistir en `localStorage`. Todo lo demás (estado de una vista o de un flujo
concreto) es un composable normal — no todo necesita ser un store.

El store de cart es el ejemplo más completo de patrones combinados: `computed` derivados
(`itemCount`, `subtotal`, `canUseCart`), funciones guard (`assertCartUsable` que lanza si el rol no
aplica), un flag `isSyncing` para operaciones remotas, y sincronización local/remota por usuario
(`initializedUserId`, `hasLoadedRemoteForUser`) para no repetir fetch al cambiar de sesión.

## 4. Formularios

Stack: **zod** (schema) + **`@primevue/forms`** (`<Form>` + `<FormField>` + `zodResolver`).

### 4.1 Schema

Un archivo por formulario en `modules/<dominio>/schemas/`, exportando el schema y su tipo inferido:

```ts
export const productBaseSchema = z.object({
  name: z.string().trim().min(4, { error: '...' }).max(25, { error: '...' }),
  // ...
})
export type ProductBaseFormValues = z.infer<typeof productBaseSchema>
```

Cuando un formulario cambia de forma según una selección del usuario (ej. crear producto:
equipo/armazón/mica tienen campos distintos), el schema final es un `computed` que hace
`.extend()` sobre el schema base:

```ts
const currentSchema = computed(() => {
  if (selectedTypeSlug.value === 'equipos') return productBaseSchema.extend(equipmentItemSchema.shape)
  // ...
})
const resolver = computed(() => zodResolver(currentSchema.value as z.ZodType))
```

`initial-values` del `<Form>` también es un `computed` que cambia junto con el schema —
`<Form>` lleva un `:key="selectedTypeSlug"` para forzar remount cuando cambia el tipo, evitando
arrastrar estado de un schema al otro.

### 4.2 `<FormField>`

- **Todo** campo que participa en la validación debe estar envuelto en `<FormField name="...">`,
  incluso si visualmente es simple. Un campo sin `<FormField>` rompe silenciosamente
  `event.valid`/`event.values` al enviar — es el bug más fácil de introducir en este stack.
- Patrón estándar (inputs nativos de PrimeVue, ya bindeados por `<FormField>` vía slot implícito):
  ```html
  <FormField v-slot="$field" name="name" class="flex flex-col gap-1">
    <label for="name">Nombre</label>
    <InputText id="name" fluid />
    <Message v-if="$field.invalid" severity="error" size="small">{{ $field.error?.message }}</Message>
  </FormField>
  ```
- Para inputs custom que no calzan con el binding automático (selector de imagen, campos
  compuestos), se usa `as-child` y se maneja el valor a mano vía `inject<PrimeVueFormInstance>('$pcForm')`
  y `pcForm.setFieldValue(name, value)` (ver `CreateProductBaseFields.vue`, campo `image`).
- Para setear un valor por defecto reactivo después del mount (ej. auto-seleccionar el primer
  proveedor disponible), se usa el mismo `$pcForm.setFieldValue` dentro de un `watch`, no se
  reasigna `initial-values`.

### 4.3 Separación de responsabilidades en el submit

El componente de formulario (`CreateProductForm.vue`) solo:

1. Valida (`event.valid`) y arma un objeto de parámetros tipado a partir de `event.values`.
2. Corre validaciones adicionales que zod no puede expresar bien (filas dinámicas de variantes,
   series de mica) y aborta con un toast si fallan.
3. Delega la llamada real a un composable de acción (`useCreateProductSubmit().submit(...)`).
4. Reacciona al `boolean` de resultado (limpiar selección, resetear sub-formularios).

Toda la lógica de "qué payload construir para cada categoría" y las llamadas HTTP viven en el
composable, no en el `.vue`. Esto es lo que hay que replicar para formularios nuevos: el `.vue`
no debería importar ningún `*Service`.

## 5. Manejo de errores y notificaciones

- `smileyApi.ts` normaliza cualquier error de Axios a través del interceptor de respuesta
  (`toApiProblem`), así que todo lo que llega a un `catch` en un composable ya tiene la forma
  `ApiProblemDetails` (RFC 7807): `{ type, status, title, detail, instance, errors? }`.
- `firstProblemMessage(problem)` es la función estándar para obtener un mensaje mostrable: prioriza
  el primer error de campo (`problem.errors`), cae a `detail`, luego a `title`.
- `useAppToast()` es el único wrapper de `useToast` de PrimeVue; firma fija
  `notify(severity, summary, message, life?)`. No se instancia `useToast()` directamente en vistas
  ni composables nuevos.
- Errores de validación por campo del backend (`problem.errors.cart`, por ejemplo en
  `useCheckout.ts`) se exponen como un ref aparte (`stockIssues`) para que la vista los pinte
  inline, además del toast genérico.

## 6. Checklist para agregar un módulo nuevo

1. `src/modules/<dominio>/interfaces/*.ts` — tipos de datos del dominio (forma de la respuesta
   del backend).
2. `src/modules/<dominio>/services/*Service.ts` — una función por endpoint, tipada, sin estado.
3. `src/modules/<dominio>/schemas/*.ts` (si hay formularios) — zod schema + tipo inferido.
4. `src/modules/<dominio>/composables/use*.ts` — un composable de datos si hay listados/estado
   sincronizado, y uno de acción por cada operación de escritura no trivial.
5. `src/modules/<dominio>/components/` y `views/` — solo render + wiring.
6. `src/router/modules/<dominio>.routes.ts` — rutas del módulo; si son admin, el nombre de ruta
   debe empezar con `admin-` para heredar el guard global (ver `CLAUDE.md`).
7. Spread de las rutas nuevas en `src/router/index.ts`.
8. Si aplica, link en la navegación (`modules/core/components/Navbar.vue` o sus subcomponentes).

No hay tests en el repo todavía (`vitest` configurado, cero archivos `.spec`/`.test`) — no hay un
patrón establecido que seguir ahí.

## 7. Próximos módulos

### 7.1 Pagos en línea en `orders`

Estado actual: `useCheckout.submit()` llama `createOrderService()` y el pedido nace directo en
`current_status: 'pendiente'` (ver `modules/orders/interfaces/Order.ts`); no hay ningún paso de
pago entre el carrito y la orden creada.

Encaja en la arquitectura existente así:

- **Service nuevo**, no mezclado en `orderService.ts`: `modules/orders/services/paymentService.ts`
  con funciones tipo `createPaymentIntentService(orderId)` / `confirmPaymentService(orderId, payload)`,
  siguiendo el mismo patrón de retorno (`response.data`).
- **Composable de acción nuevo**: `useOrderPayment.ts`, con la misma forma que `useCheckout` —
  `isSubmitting`, guard de reentrada, `catch` a `ApiProblemDetails`. Si el proveedor de pagos
  requiere SDK de cliente (ej. Stripe Elements/Checkout), el composable es el lugar natural para
  inicializar y limpiar esa instancia (`onUnmounted`), no la vista.
- **`current_status`** ya es un `OrderStatusName` de unión cerrada; probablemente valga la pena
  añadir un estado intermedio (`'pago_pendiente'` o similar) antes de `'procesando'`, y decidir si
  ese estado lo asigna el backend al confirmar el webhook del proveedor o el frontend de forma
  optimista tras `confirmPaymentService`. Esto es una decisión de backend/contrato, pero afecta
  directamente qué pinta `OrderStatusBadge.vue` y qué transición dispara
  `useOrderStatusTransition.ts`.
- **Vista**: si el pago requiere una redirección externa (checkout hospedado) o un paso de
  confirmación, probablemente se necesite una ruta nueva tipo `/orders/:id/payment` entre
  `order-confirmation` y el checkout actual, protegida igual que las demás con `requireAuth`
  (`router/modules/orders.routes.ts`).
- El `cart.clearLocalCart()` que hoy corre inmediatamente después de crear el pedido
  (`useCheckout.ts:26`) probablemente deba moverse a después de la confirmación de pago, no al
  crear la orden — a revisar cuando se defina el flujo exacto.

### 7.2 Opiniones de productos (reviews)

No hay nada de esto en el código todavía. Como es un dominio propio (no una extensión de
`catalog` ni de `orders`), lo más consistente con Screaming Architecture es un módulo nuevo:

```
modules/reviews/
  interfaces/Review.ts        # { id, product_id, user_id, user_name, rating, comment, created_at }
  services/reviewService.ts    # getProductReviewsService(productId, page?), createReviewService(...)
  schemas/reviewSchema.ts        # rating (1-5) + comment, con zod
  composables/useProductReviews.ts   # composable de datos: lista paginada + promedio
  composables/useSubmitReview.ts       # composable de acción: envío de una reseña
  components/ReviewList.vue
  components/ReviewForm.vue
  components/RatingStars.vue
```

Puntos a decidir antes de implementar (afectan el diseño, no solo el código):

- **Dónde se monta**: probablemente como sección dentro de `catalog/views/ProductView.vue`, vía
  import cruzado `catalog → reviews` (igual que hoy varios módulos importan `core`). Mantener el
  composable/servicio en `reviews`, no en `catalog`, para no mezclar el dominio de catálogo con el
  de opiniones.
- **Permisos**: ¿solo compradores que ya compraron el producto pueden opinar? Si sí, esa regla es
  responsabilidad del backend (el frontend solo refleja el resultado — ej. ocultar `ReviewForm` si
  el backend devuelve que el usuario no es elegible), siguiendo el mismo principio que ya se usa
  con roles (`auth.isBuyer`, guards).
- **Agregados**: si se muestra un promedio/histograma de rating en `ProductCard`/`ProductView`,
  decidir si lo calcula el backend (campo `average_rating` en el producto) o el frontend a partir
  de la lista — más barato y consistente que lo calcule el backend.
- El formulario de reseña sigue el mismo patrón de la sección 4: schema zod (`rating` con
  `z.number().min(1).max(5)`, `comment` con límites de longitud) + `<Form>`/`<FormField>` +
  composable de acción que llama `createReviewService` y notifica con `useAppToast`.
