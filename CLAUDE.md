# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Note:** `README.md` in this repo describes an older `src/contexts/` + JavaScript architecture. That structure was migrated to `src/modules/` + TypeScript; the README was not updated to match. Trust the codebase (and this file) over the README.

## Commands

```bash
npm install              # install dependencies
npm run dev               # Vite dev server on port 3000
npm run build              # type-check (vue-tsc) + production build to dist/
npm run preview            # serve the production build locally
npm run type-check          # vue-tsc --noEmit
npm run format               # prettier --write .
npm run format:check          # prettier --check .
npm test                     # vitest
```

There are currently no test files in the repo despite `vitest` being configured — `npm test` will report no tests found until some are added.

### Environment

Requires a `.env` file at the project root (Vite reads it at server start, so restart `npm run dev` after changes):

```env
VITE_API_URL=http://127.0.0.1:8000/api        # axios baseURL for all backend calls
VITE_BACKEND_BASE=http://127.0.0.1:8000        # base for public assets (e.g. /storage images), used directly in several views
VITE_GOOGLE_MAPS_EMBED_API_KEY=...             # used by user/composables/useAddressMapThumbnails.ts
```

`.env.example` in the repo is stale (references old `VITE_API_BASE` naming) — use the variable names above, which match what the code actually reads.

## Architecture

Vue 3 (Composition API, `<script setup lang="ts">`) + Vite + Vue Router + Pinia + Axios + Tailwind + PrimeVue, organized as **Screaming Architecture**: business domains live under `src/modules/<domain>/`, not generic technical folders.

```
src/
  main.ts                 # app bootstrap: pinia, router, PrimeVue (custom theme), ToastService, reveal-on-scroll directive
  App.vue                 # root layout: Navbar + RouterView + Footer + global Toast
  theme/smileyPreset.ts    # PrimeVue theme preset
  router/
    index.ts               # composes all route modules; global beforeEach guard
    guards/                 # requireAuth, requireAdmin, requireDriver, requireGuest
    modules/                 # one *.routes.ts file per domain, spread into router/index.ts
  modules/
    core/                   # cross-cutting: api client, auth store, Navbar/Footer, shared composables/utils
    marketing/               # public pages (home, 404)
    auth/                     # login
    registration/              # signup application flow (request -> admin review -> account creation)
    catalog/                    # public product browsing
    admin-products/               # admin CRUD for products/lenses/frames/equipment
    inventory/                     # admin per-branch stock management
    orders/                          # cart checkout, order lifecycle, admin/driver order views
    user/                             # customer profile, addresses, cart
```

### Domain boundaries

- Business/API logic belongs in each module's `services/` and `composables/`; `views`/`pages` (and top-level components) should stay focused on rendering and wiring.
- Cross-module imports are the exception, not the rule (e.g. most modules import `core/stores/auth` and `core/api/smileyApi`, but modules generally shouldn't reach into each other's internals).
- Routes for a domain live in `router/modules/<domain>.routes.ts` and are spread into `router/index.ts`.

### Routing & auth guards

- `router/index.ts` has one global `beforeEach`: any route whose `name` starts with `"admin"` automatically requires auth + admin role — no need to attach `requireAuth`/`requireAdmin` per-route for those. **Keep the `admin-` name prefix on any new admin route** or it silently loses protection.
- `requireGuest` is opt-in via `meta.requireGuest` on the route (used for login-only pages).
- `requireDriver` must be attached explicitly per-route (`beforeEnter`), since driver routes don't share a name-prefix convention like admin routes do.
- Roles come from `useAuthStore().user.role_id`: `1 = Admin`, `2 = Buyer`, `3 = Driver` (see `modules/user/enums/UserRole.ts` and `modules/core/stores/auth.ts`).

### API layer

- `modules/core/api/smileyApi.ts` is the single Axios instance used everywhere. It attaches `Authorization: Bearer <token>` from the Pinia auth store, and on a `401` response clears the session and redirects to `/login`.
- Backend errors follow **RFC 7807 Problem Details** (`modules/core/api/apiProblem.ts`): `toApiProblem(error)` normalizes any axios error into `{ type, status, title, detail, instance, errors? }`, and `firstProblemMessage(problem)` picks the first field-validation message (falling back to `detail`/`title`) for display in toasts.
- Auth/session state persists to `localStorage` (`token`, `user` keys) via `modules/core/stores/auth.ts`.

### Forms

- Validation schemas are defined with `zod` per-module under `schemas/` (e.g. `modules/admin-products/schemas/productBaseSchema.ts`), and forms are built with `@primevue/forms`.
- **Gotcha:** every field participating in validation must be wrapped in a `<FormField>` (or otherwise registered), even if visually simple — an unregistered required field silently breaks `event.valid`/`event.values` on submit.

### Path alias

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`). PrimeVue components are auto-imported via `unplugin-vue-components` + `@primevue/auto-import-resolver` — no manual PrimeVue component imports needed in templates.

### Code style

Prettier is authoritative (not ESLint — there is no ESLint config in this repo): no semicolons, single quotes, 100-char width, trailing commas, imports auto-sorted into third-party / `@/*` / relative groups (`@trivago/prettier-plugin-sort-imports`). Run `npm run format` rather than hand-formatting.
