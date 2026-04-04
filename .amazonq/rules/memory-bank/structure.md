# Project Structure

## Monorepo Layout

```
d:\Code\Muni\
├── backend/          # NestJS REST API
├── frontend/         # React + Vite web admin panel
├── mobile/           # React Native mobile app for field crews
├── shared/           # Shared types and API client utilities
├── database/         # Initial SQL schema reference
└── prompts_antigravity/  # AI prompt history used to scaffold the project
```

## Backend (`backend/`)

NestJS application with feature-based module structure.

```
backend/
├── prisma/
│   ├── schema.prisma       # Single source of truth for DB schema
│   ├── seed.ts             # Database seeding script
│   └── migrations/         # Prisma migration history
├── src/
│   ├── main.ts             # Bootstrap: global prefix api/v1, ValidationPipe, CORS
│   ├── app.module.ts       # Root module importing all feature modules
│   ├── prisma/             # PrismaService (global singleton)
│   ├── common/             # Shared enums (ActivoEstado, etc.)
│   ├── auth/               # JWT auth, guards, decorators
│   └── [feature]/          # One folder per domain entity:
│       ├── [feature].module.ts
│       ├── [feature].controller.ts
│       ├── [feature].service.ts
│       └── dto/            # CreateDto, UpdateDto (PartialType pattern)
```

### Backend Feature Modules
| Module | Domain |
|---|---|
| auth | JWT login, guards, user decorator |
| usuarios | User management |
| municipios | Municipality management |
| areas | Municipal departments |
| incidentes | Incident lifecycle |
| ordenes-trabajo | Work order management |
| cuadrillas | Field crew management |
| personas | Person/contact records |
| activos | Municipal asset inventory |
| tipos-activo | Asset type catalog |
| riesgos | Risk catalog |
| categorias | Hierarchical risk categories |
| inspecciones | Field inspections |
| evidencias | Photo/file evidence |
| inventario | Stock/materials |
| ubicaciones | Geolocation records |
| dashboard | Aggregated KPI queries |
| auditoria | Audit event log |

## Frontend (`frontend/`)

React SPA with Vite, TypeScript, Tailwind CSS.

```
frontend/
├── src/
│   ├── main.tsx            # App entry point
│   ├── App.tsx             # Root component with AuthContext provider
│   ├── router.tsx          # React Router v6 route definitions
│   ├── pages/              # One page component per route
│   │   └── iconMap.tsx     # Lucide icon registry for dynamic icon rendering
│   ├── components/
│   │   ├── auth/           # ProtectedRoute component
│   │   ├── layout/         # Sidebar, Topbar, Layout shell
│   │   ├── map/            # Leaflet map components
│   │   └── ui/             # Reusable UI primitives
│   ├── context/
│   │   └── AuthContext.tsx # Global auth state (user, token, login/logout)
│   ├── services/
│   │   ├── apiFetch.ts     # Axios-based API client with auth header injection
│   │   ├── auth.service.ts # Login/logout API calls
│   │   └── geocoding.ts    # Address-to-coordinates resolution
│   └── types/
│       └── incident.ts     # Frontend TypeScript types
├── e2e/                    # Playwright end-to-end tests
├── tailwind.config.js      # Tailwind v4 config
├── vite.config.ts          # Vite build config
├── vitest.config.ts        # Unit test config
└── playwright.config.ts    # E2E test config
```

## Mobile (`mobile/`)

React Native app for field crew workers.

```
mobile/
├── App.tsx                 # Root with navigation stack
├── screens/
│   ├── LoginScreen.tsx
│   ├── OrdenesAsignadasScreen.tsx
│   ├── OrdenDetalleScreen.tsx
│   ├── CapturaEvidenciaScreen.tsx
│   └── PerfilScreen.tsx
├── components/
│   ├── OrderCard.tsx
│   ├── PhotoUploader.tsx
│   ├── StatusChip.tsx
│   └── OfflineBanner.tsx
└── services/
    ├── api.ts              # API calls
    ├── localStorage.ts     # Local persistence
    └── offlineQueue.ts     # Offline action queue
```

## Shared (`shared/`)

Cross-platform types and API client used by both frontend and mobile.

```
shared/
├── types/index.ts          # Shared TypeScript interfaces
└── services/
    ├── apiClient.ts        # Base Axios client
    ├── incidentes.api.ts
    ├── ordenes.api.ts
    ├── activos.api.ts
    ├── cuadrillas.api.ts
    └── dashboard.api.ts
```

## Architectural Patterns

- **Feature module pattern**: each domain entity has its own NestJS module (controller + service + DTOs)
- **Prisma as ORM**: schema-first approach, all DB access through PrismaService
- **Soft deletes**: `deletedAt` timestamp on most entities instead of hard deletes
- **UUID primary keys**: all entities use `@default(uuid())` with `@db.Uuid`
- **Multi-tenancy via municipioId**: most entities carry a `municipioId` foreign key
- **JWT authentication**: stateless auth with `JwtAuthGuard` applied per controller
- **Global API prefix**: all endpoints under `/api/v1`
- **React Context for auth**: `AuthContext` provides user/token state app-wide
- **Offline-first mobile**: `offlineQueue.ts` buffers actions when network is unavailable
