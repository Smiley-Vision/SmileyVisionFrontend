# Smiley Vision Frontend

Frontend web de Smiley Vision, construido con Vue 3 + Vite.

Smiley Vision es una empresa de distribución de productos para óptica, con sucursales en Ciudad de México, Mérida y Campeche. Únicamente vende a ópticos (profesionales de la salud visual).

> Para la arquitectura del proyecto (estructura de módulos, routing, capa de API, forms, etc.) consulta `CLAUDE.md`. Un documento de arquitectura frontend dedicado llegará más adelante.

## Stack tecnológico

- Vue 3 (Composition API) + TypeScript
- Vite
- Vue Router
- Pinia
- Axios
- Tailwind CSS
- PrimeVue + PrimeIcons

## Requisitos previos

- Node.js 20+ (recomendado LTS)
- npm 10+
- Backend disponible (por defecto en `http://127.0.0.1:8000`)

Verificación rápida:

```bash
node -v
npm -v
```

## Instalación y puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Copia `.env.example` a `.env` y ajusta los valores si es necesario:

```bash
cp .env.example .env
```

3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

4. Abre `http://localhost:3000`.

## Variables de entorno (.env)

Vite lee `.env` al iniciar el servidor, así que reinicia `npm run dev` después de cualquier cambio.

| Variable                          | Descripción                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `VITE_API_URL`                      | Base URL usada por Axios para todas las llamadas al backend (`/api/...`).      |
| `VITE_BACKEND_BASE`                  | Base del backend para recursos públicos (ej. imágenes servidas en `/storage`). |
| `VITE_GOOGLE_MAPS_EMBED_API_KEY`      | API key para los mapas embebidos de direcciones (módulo `user`).               |

## Scripts disponibles

- `npm run dev` — arranca Vite en modo desarrollo (puerto 3000).
- `npm run build` — type-check (`vue-tsc`) + build de producción en `dist/`.
- `npm run preview` — sirve localmente el build generado.
- `npm run type-check` — `vue-tsc --noEmit`.
- `npm run format` / `npm run format:check` — Prettier.
- `npm test` — Vitest (aún sin archivos de prueba en el repo).
