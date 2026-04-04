# Technology Stack

## Languages & Runtimes

| Layer | Language | Version |
|---|---|---|
| Backend | TypeScript | ^5.1.3 |
| Frontend | TypeScript | ^5.2.2 |
| Mobile | TypeScript (React Native) | — |
| Database | PostgreSQL | — |
| ORM schema | Prisma SDL | — |

## Backend Stack

| Technology | Version | Role |
|---|---|---|
| NestJS | ^10.0.0 | REST API framework |
| Prisma | ^7.6.0 | ORM + migrations |
| @prisma/adapter-pg | ^7.6.0 | PostgreSQL adapter |
| @nestjs/jwt | ^10.0.0 | JWT token generation |
| @nestjs/passport | ^10.0.0 | Auth strategy integration |
| passport-jwt | ^4.0.0 | JWT passport strategy |
| bcryptjs | ^2.4.3 | Password hashing |
| class-validator | ^0.14.0 | DTO validation |
| class-transformer | ^0.5.1 | DTO transformation |
| rxjs | ^7.8.1 | NestJS reactive primitives |

### Backend Dev Tools
| Tool | Version | Role |
|---|---|---|
| Jest | ^29.7.0 | Unit testing |
| ts-jest | ^29.4.9 | TypeScript Jest transformer |
| supertest | ^6.3.4 | HTTP integration testing |
| @nestjs/testing | ^10.4.22 | NestJS test utilities |
| ESLint + Prettier | ^8 / ^3 | Linting and formatting |

## Frontend Stack

| Technology | Version | Role |
|---|---|---|
| React | ^18.2.0 | UI framework |
| Vite | ^4.5.14 | Build tool and dev server |
| React Router DOM | ^6.8.0 | Client-side routing |
| Tailwind CSS | ^4.2.2 | Utility-first styling |
| Axios | ^1.4.0 | HTTP client |
| Leaflet + react-leaflet | ^1.9.4 / ^4.2.1 | Interactive maps |
| leaflet.heat | ^0.2.0 | Heatmap layer |
| lucide-react | ^1.7.0 | Icon library |
| react-hot-toast | ^2.6.0 | Toast notifications |

### Frontend Dev Tools
| Tool | Version | Role |
|---|---|---|
| Vitest | ^0.34.0 | Unit testing |
| Playwright | ^1.59.1 | E2E testing |
| @testing-library/react | ^14.0.0 | Component testing |
| @tailwindcss/forms | ^0.5.11 | Form styling plugin |
| postcss + autoprefixer | — | CSS processing |

## Mobile Stack

- React Native (Expo-compatible structure)
- Offline queue pattern for network-resilient operations
- Local storage for session persistence

## Database

- PostgreSQL (primary datastore)
- Prisma migrations for schema versioning
- Soft deletes via `deletedAt` timestamp on all major entities
- UUID primary keys (`@db.Uuid`)
- Timestamptz for all datetime fields

## Development Commands

### Backend
```bash
cd backend
npm run start:dev       # Start with hot reload (port 4000)
npm run build           # Compile TypeScript
npm run start:prod      # Run compiled output
npm run test            # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:cov        # Coverage report
npm run db:seed         # Seed database
npm run lint            # ESLint with auto-fix
npm run format          # Prettier format
```

### Frontend
```bash
cd frontend
npm run dev             # Vite dev server (port from VITE_APP_PORT or 5173)
npm run build           # tsc + vite build
npm run preview         # Preview production build
npm run test            # Vitest unit tests
npm run test:e2e        # Playwright E2E tests
npm run lint            # ESLint
```

## Environment Variables

### Backend (`.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
API_PORT=4000
FRONTEND_URL=http://localhost:5174
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:4000
VITE_APP_PORT=5173
```

## API Configuration

- Global prefix: `/api/v1`
- CORS: configured for `FRONTEND_URL` with credentials
- Global `ValidationPipe`: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- Vite dev proxy: `/api/*` → backend (strips `/api` prefix, forwards to backend's `/api/v1/*`)
- Path alias: `@shared` → `../shared` (shared types/services)
