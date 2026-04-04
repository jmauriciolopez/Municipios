# Development Guidelines

## Backend Patterns (NestJS)

### Module Structure
Every domain feature follows the same 4-file pattern:
```
[feature]/
├── [feature].module.ts       # imports PrismaModule + AuditoriaModule
├── [feature].controller.ts   # HTTP layer only, delegates to service
├── [feature].service.ts      # business logic + Prisma calls
└── dto/
    ├── create-[feature].dto.ts
    └── update-[feature].dto.ts  # extends PartialType(CreateDto)
```

### Controller Pattern
```typescript
@Controller('incidentes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentesController {
  constructor(private readonly incidentesService: IncidentesService) {}

  @Post()
  @Roles('inspector', 'admin')
  create(@Body() body: CreateIncidenteDto, @User() user: any) {
    return this.incidentesService.create(body, user?.id);
  }

  @Get()
  findAll(@Query() query: FindQueryDto) { ... }

  @Get(':id')
  findOne(@Param('id') id: string) { ... }

  @Patch(':id')
  @Roles('inspector', 'supervisor', 'admin')
  update(@Param('id') id: string, @Body() body: UpdateDto, @User() user: any) { ... }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) { ... }
}
```

- Always apply `@UseGuards(JwtAuthGuard, RolesGuard)` at class level
- Use `@Roles(...)` decorator on mutating endpoints (POST, PATCH, DELETE)
- Inject `@User()` to capture `user.id` for audit logging
- GET endpoints typically don't require role restriction

### Service Pattern
```typescript
const INCLUDE = { area: true, activo: true, riesgo: true }; // top-level constant

@Injectable()
export class FeatureService {
  constructor(
    private prisma: PrismaService,
    private auditoria: AuditoriaService,
  ) {}

  async create(data: CreateDto, userId?: string) {
    const entity = await this.prisma.model.create({ data: {...}, include: INCLUDE });
    if (userId) await this.auditoria.logEvent('entity', entity.id, 'CREATE', userId, data);
    return entity;
  }

  async findAll(query: FindQueryDto) {
    const where: any = { deletedAt: null };  // always filter soft-deleted
    if (query.field) where.field = query.field;
    return this.prisma.model.findMany({ where, include: INCLUDE });
  }

  async findOne(id: string) {
    const entity = await this.prisma.model.findUnique({ where: { id, deletedAt: null }, include: INCLUDE });
    if (!entity) throw new NotFoundException('Entity no encontrado');
    return entity;
  }

  async remove(id: string, userId?: string) {
    await this.findOne(id);  // validate existence first
    await this.prisma.model.update({ where: { id }, data: { deletedAt: new Date() } });
    if (userId) await this.auditoria.logEvent('entity', id, 'DELETE', userId);
    return { deleted: true, id };
  }
}
```

Key service conventions:
- Define `INCLUDE` as a module-level constant for consistent relation loading
- Always filter `deletedAt: null` in `findAll` and `findOne`
- Call `findOne` before `update`/`remove` to validate existence
- Always log audit events when `userId` is present
- Use `this.prisma.$transaction(async (tx) => {...})` for multi-step operations
- Soft delete sets `deletedAt: new Date()` (never hard delete)
- Return `{ deleted: true, id }` from remove operations

### DTO Pattern
```typescript
import { IsUUID, IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateFeatureDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(SomeEnum)
  @IsOptional()
  estado?: SomeEnum;

  @IsUUID()
  area_id: string;           // snake_case in DTOs (matches API request body)

  @IsUUID()
  @IsOptional()
  optional_id?: string;
}
```

- DTO field names use `snake_case` (matching JSON API convention)
- Prisma model field names use `camelCase` (TypeScript convention)
- Map between them explicitly in service: `areaId: data.area_id`
- Always use `@IsOptional()` with `?` for optional fields
- Use `@IsEnum()` for all enum fields

### Enum Pattern
```typescript
// backend/src/common/enums/feature.enum.ts
export enum ActivoEstado {
  OPERATIVO = 'operativo',
  EN_MANTENIMIENTO = 'en_mantenimiento',
  FUERA_SERVICIO = 'fuera_servicio',
  DADO_DE_BAJA = 'dado_de_baja',
}
```
- Enum keys are SCREAMING_SNAKE_CASE
- Enum values are lowercase snake_case strings (matching Prisma schema)
- Domain-specific enums live in `[feature]/enums/`
- Shared enums live in `common/enums/`

### Prisma Schema Conventions
```prisma
model Entity {
  id          String    @id @default(uuid()) @db.Uuid
  municipioId String?   @map("municipio_id") @db.Uuid
  nombre      String    @db.VarChar(120)
  estado      SomeEnum  @default(value)
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime  @default(now()) @map("updated_at") @db.Timestamptz
  deletedAt   DateTime? @map("deleted_at") @db.Timestamptz

  @@map("table_name_plural")
}
```
- All PKs: `@id @default(uuid()) @db.Uuid`
- All timestamps: `@db.Timestamptz`
- DB column names: `snake_case` via `@map()`
- Table names: `snake_case` plural via `@@map()`
- TypeScript field names: `camelCase`
- Soft delete: `deletedAt DateTime? @map("deleted_at")`
- Multi-tenancy: `municipioId` on most entities

### Authentication
- `JwtAuthGuard` applied at controller class level
- `RolesGuard` paired with `@Roles()` decorator for role-based access
- `@User()` custom decorator extracts user from JWT payload
- JWT payload shape: `{ sub: userId, email, roles: string[] }`
- Passwords hashed with `bcryptjs`
- Login events logged to `AuditoriaEvento`

### Audit Logging
Always call `auditoria.logEvent()` after mutating operations:
```typescript
await this.auditoria.logEvent(
  'incidente',    // entidadTipo
  entity.id,      // entidadId
  'CREATE',       // accion: CREATE | UPDATE | DELETE | LOGIN | LOGOUT
  userId,         // usuarioId
  data,           // optional payload
);
```

---

## Frontend Patterns (React + TypeScript)

### Routing
- All routes wrapped in `<ProtectedRoute><AppLayout><Page /></AppLayout></ProtectedRoute>`
- `ProtectedRoute` redirects unauthenticated users to `/login`
- Catch-all `<Route path="*">` redirects to `/`
- Route paths use kebab-case: `/tipos-activo`, `/ordenes-trabajo`

### API Client
```typescript
// Use apiFetch for all API calls
import { apiFetch } from '../services/apiFetch';

const data = await apiFetch<ResponseType>('/api/v1/endpoint');
const created = await apiFetch<Entity>('/api/v1/endpoint', {
  method: 'POST',
  body: JSON.stringify(payload),
});
```
- Token auto-injected from `localStorage` key `municipio_token`
- Throws `Error('API {status}')` on non-OK responses
- Returns `null` for 204 No Content responses
- Base URL from `VITE_API_URL` env var

### Auth Context
```typescript
// Consume auth state
const { token, login, logout, isAuthenticated } = useAuth();

// Provide at app root
<AuthProvider>
  <App />
</AuthProvider>
```
- `useAuth()` throws if used outside `AuthProvider`
- Token persisted via `auth.service.ts` (localStorage)

### Icon Registry Pattern
```typescript
// iconMap.tsx — maps string keys to Lucide components
const iconMap = {
  INFRAESTRUCTURA: Building2,
  ELEC_LUMINARIA_APAGADA: LightbulbOff,
  // ...
};

// Usage in components
const Icon = iconMap[riesgo.icono] ?? HelpCircle;
return <Icon size={16} />;
```
- Icon keys use SCREAMING_SNAKE_CASE matching risk/category codes
- Always provide a fallback icon (`HelpCircle`)
- Grouped by category with section comments

### Styling Conventions
- Tailwind CSS utility classes throughout
- Custom design tokens in `tailwind.config.js`:
  - `safety.danger` (#D32F2F) — critical/danger states
  - `safety.warning` (#F57C00) — warning states
  - `safety.caution` (#FBC02D) — caution states
  - `safety.success` (#388E3C) — success/safe states
  - `safety.info` (#1976D2) — informational/required
  - `ui.base` (#F8FAFC) — page background
  - `ui.surface` (#FFFFFF) — card/modal background
  - `ui.border` (#E2E8F0) — borders
  - `ui.text.primary` (#1E293B) — main text
  - `ui.text.secondary` (#64748B) — secondary text
- Font stack: Inter → Roboto → system-ui
- Custom shadow: `shadow-soft` for cards and modals
- `@tailwindcss/forms` plugin for form elements

### Component Organization
```
components/
├── auth/ProtectedRoute.tsx    # Route guard
├── layout/                    # AppLayout, Sidebar, Topbar
├── map/                       # Leaflet map wrappers
└── ui/                        # Reusable primitives (badges, buttons, etc.)
```

---

## Naming Conventions

| Context | Convention | Example |
|---|---|---|
| TypeScript files | PascalCase for components | `IncidentesPage.tsx` |
| TypeScript files | camelCase for services/utils | `apiFetch.ts` |
| NestJS modules | kebab-case folders | `ordenes-trabajo/` |
| DB table names | snake_case plural | `ordenes_trabajo` |
| DB column names | snake_case | `municipio_id` |
| Prisma model fields | camelCase | `municipioId` |
| DTO fields | snake_case | `area_id` |
| Enum keys | SCREAMING_SNAKE_CASE | `EN_MANTENIMIENTO` |
| Enum values | lowercase snake_case | `'en_mantenimiento'` |
| API routes | kebab-case | `/ordenes-trabajo` |
| Frontend routes | kebab-case | `/tipos-activo` |
| Icon map keys | SCREAMING_SNAKE_CASE | `ELEC_LUMINARIA_APAGADA` |

---

## Testing

### Backend Unit Tests
- File pattern: `*.spec.ts` in `src/`
- Framework: Jest + ts-jest
- Use `@nestjs/testing` `Test.createTestingModule()`
- Mock `PrismaService` and `AuditoriaService`

### Backend E2E Tests
- Located in `test/` directory
- Config: `test/jest-e2e.json`
- Uses `supertest` for HTTP assertions
- File: `auth-incidents.e2e-spec.ts` covers auth + incident flow

### Frontend Unit Tests
- Framework: Vitest + @testing-library/react
- Config: `vitest.config.ts`

### Frontend E2E Tests
- Framework: Playwright
- Tests in `e2e/` directory
- Runs against `http://localhost:5173`
- Configured for Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- CI: `retries: 2`, `workers: 1`, `forbidOnly: true`

---

## Key Architectural Rules

1. Never hard-delete records — always soft-delete via `deletedAt`
2. Always filter `deletedAt: null` in queries
3. Every mutating operation must log to `AuditoriaEvento`
4. All entities carry `municipioId` for multi-tenant isolation
5. Use `$transaction` for operations that modify multiple tables
6. DTOs use `snake_case`; Prisma models use `camelCase` — map explicitly in services
7. All API endpoints live under `/api/v1` prefix
8. Frontend token stored under key `municipio_token` in localStorage
9. Use `apiFetch` (not axios) for all frontend API calls
10. Use `useAuth()` hook to access auth state — never read localStorage directly in components
