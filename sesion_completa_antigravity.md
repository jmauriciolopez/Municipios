# Sesión completa para Antigravity
## Objetivo
Generar una primera versión funcional del sistema completo de **gestión de riesgos municipales / seguridad e higiene** en una corrida controlada, usando:

- **Backend:** NestJS
- **Frontend:** React + TypeScript
- **Base de datos:** PostgreSQL

## Cómo usar esta sesión
1. Pegá este prompt completo como contexto inicial.
2. Dejá que Antigravity genere la estructura base.
3. Luego ejecutá los prompts de continuación **en orden**.
4. No le pidas “todo junto otra vez” si ya generó parte del sistema. Pedile **extender**, **corregir** o **conectar**.

---

# PROMPT 1 — CONTEXTO MAESTRO

```txt
Actuá como arquitecto de software y developer senior full stack.

Estoy construyendo un SaaS para municipios, orientado a seguridad e higiene territorial, gestión de riesgos urbanos y ejecución operativa de cuadrillas municipales.

## Stack obligatorio
- Backend: NestJS
- Frontend: React + TypeScript
- Base de datos: PostgreSQL

## Contexto funcional
El sistema debe servir para:
- Registrar incidentes geolocalizados
- Evaluar riesgos urbanos
- Crear órdenes de trabajo
- Asignar cuadrillas municipales
- Gestionar activos urbanos
- Registrar inspecciones
- Subir evidencias fotográficas
- Visualizar incidentes y órdenes en mapa
- Medir tiempos de resolución y operación

## Áreas municipales ejemplo
- Poda
- Mantenimiento eléctrico y luminaria
- Higiene urbana
- Bacheo
- Espacios verdes
- Defensa civil
- Inspección general

## Entidades principales
- municipio
- area
- usuario
- rol
- cuadrilla
- cuadrilla_miembro
- activo
- tipo_activo
- ubicacion
- riesgo
- incidente
- evidencia
- inspeccion
- orden_trabajo
- orden_material
- inventario_item
- auditoria_evento

## Reglas de negocio
- Todo incidente puede o no derivar en una orden de trabajo
- Una orden de trabajo pertenece a un área responsable
- Una orden puede asignarse a una cuadrilla
- Estados de orden: detectado, asignado, en_proceso, resuelto, verificado, cancelado
- Todo incidente debe soportar geolocalización (lat, lng)
- Todo cierre de orden debe permitir evidencia antes/después
- Debe quedar trazabilidad de cambios de estado
- Los activos pueden ser luminarias, árboles, semáforos, contenedores, cámaras, etc.
- El sistema debe ser multiárea y preparado para multi-municipio

## Restricciones técnicas
- Código limpio, modular, tipado y listo para evolucionar
- No generar pseudocódigo
- No simplificar lógica importante
- Mantener separación clara entre backend, frontend y base de datos
- Incluir nombres de archivos sugeridos
- Usar buenas prácticas reales de NestJS y React
- Preparar el sistema para auth JWT aunque en esta primera versión puede quedar estructurado sin implementar login completo
- Usar fetch realesen lugar de mocks 
## Entregable esperado en esta sesión
Quiero que generes:
1. Estructura completa del proyecto
2. SQL inicial para PostgreSQL
3. Backend NestJS con módulos base
4. DTOs y endpoints REST principales
5. Frontend React con rutas, páginas y componentes base
6. App móvil para cuadrillas (estructura base)
7. Mapa real con heatmap preparado para muchos puntos
8. Sugerencias de próximos pasos

Quiero que avances por etapas y que cada etapa salga lista para copiar en archivos reales.
Empezá por la estructura general del monorepo y luego seguí con la base de datos.
```

---

# PROMPT 2 — ESTRUCTURA GENERAL DEL PROYECTO

```txt
Tomando el contexto anterior, generá la estructura inicial del proyecto con este formato:

- /backend
- /frontend
- /mobile
- /database
- /docs

Para cada carpeta:
- mostrar árbol de archivos sugerido
- explicar en una línea el propósito de cada archivo importante

Quiero una estructura pensada para producción, no demo.
Después de mostrar la estructura, avanzá directamente a /database/schema_postgres_inicial.sql.
```

---

# PROMPT 3 — SQL INICIAL PARA POSTGRES

```txt
Generá el archivo /database/schema_postgres_inicial.sql completo.

Requisitos:
- usar UUID donde tenga sentido
- incluir tablas:
  municipios
  areas
  roles
  usuarios
  usuarios_roles
  cuadrillas
  cuadrilla_miembros
  tipos_activo
  activos
  ubicaciones
  riesgos
  incidentes
  evidencias
  inspecciones
  ordenes_trabajo
  ordenes_materiales
  inventario_items
  auditoria_eventos

- incluir:
  primary keys
  foreign keys
  created_at
  updated_at
  soft delete si aplica
  índices útiles
  enums o checks donde convenga

Campos importantes:
- incidentes: tipo, descripcion, estado, prioridad, lat, lng, direccion, area_id, activo_id, riesgo_id, reportado_por, fecha_reporte
- ordenes_trabajo: codigo, incidente_id, area_id, cuadrilla_id, estado, prioridad, descripcion, fecha_asignacion, fecha_inicio, fecha_cierre
- activos: codigo, nombre, tipo_activo_id, estado, lat, lng, direccion, area_responsable_id
- evidencias: entidad_tipo, entidad_id, url, tipo, caption, tomado_por, timestamp_foto

También agregá datos semilla mínimos:
- 1 municipio demo
- áreas: poda, luminaria, higiene urbana
- roles: admin, supervisor, operador, inspector
- tipos_activo: luminaria, arbol, contenedor

Entregar SQL real, no explicación.
```

---

# PROMPT 4 — BACKEND NESTJS: BASE DEL PROYECTO

```txt
Ahora generá la base del backend NestJS.

Quiero:
- árbol de archivos de /backend/src
- app.module.ts
- módulos iniciales:
  common
  incidentes
  ordenes-trabajo
  activos
  cuadrillas
  areas
  dashboard

Usar una estructura realista:
- controllers
- services
- dto
- entities o interfaces
- enums
- types

No implementes ORM todavía si no hace falta, pero dejá el código preparado para integrarlo luego.
Usá TypeScript estricto.
Después de mostrar el árbol, generá primero:
- main.ts
- app.module.ts
- common/enums/orden-estado.enum.ts
- common/enums/prioridad.enum.ts
```

---

# PROMPT 5 — MÓDULO INCIDENTES COMPLETO

```txt
Generá el módulo completo de NestJS para Incidentes.

Archivos:
- incidentes.module.ts
- incidentes.controller.ts
- incidentes.service.ts
- dto/create-incidente.dto.ts
- dto/update-incidente.dto.ts
- dto/find-incidentes-query.dto.ts
- entities/incidente.entity.ts

Requisitos:
- usar class-validator
- create
- findAll con filtros por:
  estado
  prioridad
  area_id
  fecha_desde
  fecha_hasta
- findOne
- update
- remove lógico
- endpoint para convertir incidente en orden de trabajo
- endpoint para listar evidencias del incidente

Campos mínimos:
- id
- tipo
- descripcion
- estado
- prioridad
- lat
- lng
- direccion
- area_id
- activo_id opcional
- riesgo_id opcional
- reportado_por
- fecha_reporte

Agregar validaciones de negocio razonables.
Entregar archivo por archivo   real, no explicación.
```

---

# PROMPT 6 — MÓDULO ÓRDENES DE TRABAJO COMPLETO

```txt
Generá el módulo completo de NestJS para Órdenes de Trabajo.

Archivos:
- ordenes-trabajo.module.ts
- ordenes-trabajo.controller.ts
- ordenes-trabajo.service.ts
- dto/create-orden-trabajo.dto.ts
- dto/update-orden-trabajo.dto.ts
- dto/asignar-cuadrilla.dto.ts
- dto/cambiar-estado-orden.dto.ts
- dto/find-ordenes-query.dto.ts
- entities/orden-trabajo.entity.ts

Reglas:
- estados válidos: detectado, asignado, en_proceso, resuelto, verificado, cancelado
- no se puede pasar a resuelto si nunca pasó por en_proceso
- no se puede verificar si no está resuelto
- al asignar cuadrilla, guardar fecha_asignacion
- al pasar a en_proceso, guardar fecha_inicio
- al pasar a resuelto, guardar fecha_cierre

Endpoints:
- POST /
- GET /
- GET /:id
- PATCH /:id
- PATCH /:id/asignar-cuadrilla
- PATCH /:id/cambiar-estado
- GET /:id/evidencias

Agregar una función que calcule duración estimada y duración real si ya fue cerrada.
Entregar archivo por archivo real, no explicación.
```

---

# PROMPT 7 — ACTIVOS, ÁREAS Y CUADRILLAS

```txt
Generá tres módulos base de NestJS:

1. areas
2. activos
3. cuadrillas

## Áreas
CRUD básico para áreas municipales.

## Activos
Campos:
- id
- codigo
- nombre
- tipo_activo_id
- estado
- lat
- lng
- direccion
- area_responsable_id

Endpoints:
- CRUD
- GET /activos/cercanos?lat=&lng=&radio=
- GET /activos?tipo=&estado=&area_id=

## Cuadrillas
Campos:
- id
- nombre
- area_id
- estado
- supervisor_id

Endpoints:
- CRUD
- GET /cuadrillas/:id/ordenes
- GET /cuadrillas?area_id=&estado=
- PATCH /cuadrillas/:id/disponibilidad

Entregar el código siguiendo la misma convención de archivos.
```

---

# PROMPT 8 — DASHBOARD Y KPIs

```txt
Generá un módulo dashboard para NestJS con endpoints agregados.

Quiero endpoints como:
- GET /dashboard/resumen
- GET /dashboard/incidentes-por-estado
- GET /dashboard/ordenes-por-area
- GET /dashboard/tiempos-resolucion
- GET /dashboard/mapa-calor?fecha_desde=&fecha_hasta=&tipo=

Cada endpoint debe devolver payloads consistentes para consumo del frontend.
Definí interfaces o types para las respuestas.
```

---

# PROMPT 9 — FRONTEND REACT: ESTRUCTURA BASE

```txt
Ahora generá la estructura base del frontend React + TypeScript.

Quiero:
- árbol de /frontend/src
- react-router
- layout principal
- páginas:
  DashboardPage
  IncidentesPage
  IncidenteDetallePage
  OrdenesPage
  OrdenDetallePage
  ActivosPage
  CuadrillasPage
  MapaPage

Componentes base:
- AppLayout
- Sidebar
- Header
- StatCard
- DataTable
- FilterBar
- MapContainer
- EmptyState
- StatusBadge

No uses librerías pesadas salvo React Router.
Entregar primero el árbol y luego:
- main.tsx
- App.tsx
- router.tsx
- components/layout/AppLayout.tsx
- components/layout/Sidebar.tsx
- components/layout/Header.tsx
```

---

# PROMPT 10 — PÁGINAS DE INCIDENTES Y ÓRDENES

```txt
Generá las páginas React + TypeScript:

- IncidentesPage
- IncidenteDetallePage
- OrdenesPage
- OrdenDetallePage

Requisitos:
- componentes funcionales
- estado local simple
- datos mockeados si todavía no hay API conectada
- tablas reutilizando DataTable
- filtros reutilizando FilterBar
- botones de acción claros
- diseño administrativo limpio

IncidentesPage:
- tabla con tipo, estado, prioridad, área, fecha, dirección
- filtros por estado, prioridad, área
- botón crear incidente
- botón ver mapa

IncidenteDetallePage:
- ficha del incidente
- evidencias
- bloque de ubicación
- botón generar orden

OrdenesPage:
- tabla con código, estado, prioridad, área, cuadrilla, fechas
- filtros
- botón ver detalle

OrdenDetallePage:
- ficha de la orden
- timeline de estados
- cuadrilla asignada
- materiales
- evidencias
```
Entregar archivo por archivo real, no explicación.
---

# PROMPT 11 — MAPA REAL CON HEATMAP

```txt
Generá una implementación React + TypeScript para mapa real.

Objetivo:
- mostrar incidentes geolocalizados
- mostrar heatmap por densidad
- permitir filtrar por tipo, estado y rango de fechas
- permitir click en punto para abrir detalle
- preparado para muchos puntos

Tecnología sugerida:
- Leaflet
- react-leaflet
- leaflet.heat o alternativa equivalente

Quiero:
- estructura de archivos sugerida
- componente MapPage
- componente IncidentMap
- componente HeatmapLayer
- tipos necesarios
- datos mock
- estrategia de performance para miles de puntos

Aclarar dónde irían después las llamadas a la API real.
Entregar archivo por archivo real, no explicación.
```

---

# PROMPT 12 — APP MÓVIL PARA CUADRILLAS

```txt
Generá la estructura base de una app móvil para cuadrillas usando React Native con Expo y TypeScript.

Objetivo:
Permitir a los operarios municipales:
- iniciar sesión
- ver órdenes asignadas
- ver detalle de orden
- cambiar estado
- subir fotos antes/después
- registrar observaciones
- ver ubicación del trabajo
- operar con soporte offline básico

Pantallas:
- LoginScreen
- OrdenesAsignadasScreen
- OrdenDetalleScreen
- CapturaEvidenciaScreen
- PerfilScreen

Componentes:
- OrderCard
- StatusChip
- OfflineBanner
- PhotoUploader
- SyncButton

Requisitos:
- navegación básica
- estructura de carpetas
- mocks de datos
- servicios API desacoplados
- preparar almacenamiento local para cola offline

Entregar:
- árbol del proyecto
- App.tsx
- navegación principal
- una pantalla lista por vez
```

---

# PROMPT 13 — SERVICIOS API Y CONTRATOS COMPARTIDOS

```txt
Generá una capa de servicios API simple para frontend web y mobile.

Quiero:
- carpeta /shared con types comunes
- contratos TypeScript para:
  Incidente
  OrdenTrabajo
  Activo
  Cuadrilla
  Area
  Evidencia
- servicios:
  incidentes.api.ts
  ordenes.api.ts
  dashboard.api.ts
  activos.api.ts
  cuadrillas.api.ts

Usar fetch nativo.
Preparar baseURL configurable.
Agregar manejo simple de errores.
```

---

# PROMPT 14 — AUTENTICACIÓN PREPARADA

```txt
Sin reescribir todo el proyecto, prepará la estructura para autenticación JWT.

Backend:
- auth.module.ts
- auth.controller.ts
- auth.service.ts
- dto/login.dto.ts
- guard placeholder
- decorador para usuario actual

Frontend web:
- auth context básico
- protected routes
- login page placeholder

Mobile:
- estructura básica para guardar token y restaurar sesión

No implementes toda la seguridad todavía, pero dejá todo listo para integrarla bien.
```

---

# PROMPT 15 — REFINAMIENTO FINAL

```txt
Ahora revisá todo lo generado hasta ahora y hacé una pasada de refactor de arquitectura.

Objetivo:
- detectar inconsistencias de nombres
- unificar convenciones
- mejorar separación entre capas
- sugerir carpetas faltantes
- marcar dónde conviene luego meter Prisma o TypeORM
- marcar qué partes ya están listas para MVP
- marcar qué partes quedaron mockeadas

Quiero una respuesta final con:
1. checklist de estado del proyecto
2. qué falta para ponerlo en marcha
3. orden recomendado de implementación real
```

---

# PROMPT EXTRA — SI ANTIGRAVITY SE PIERDE O MEZCLA COSAS

```txt
No cambies el dominio del sistema.
No conviertas esto en un CRM genérico.
No lo lleves a industria privada.
Mantené el contexto municipal, territorial y operativo.

Recordatorio del dominio:
- incidentes urbanos
- riesgos municipales
- órdenes de trabajo
- cuadrillas
- activos urbanos
- mapas
- evidencias
- áreas municipales

Seguí sobre la estructura ya generada y no reinicies desde cero.
```

---

# ORDEN RECOMENDADO DE EJECUCIÓN
1. Prompt 1
2. Prompt 2
3. Prompt 3
4. Prompt 4
5. Prompt 5
6. Prompt 6
7. Prompt 7
8. Prompt 8
9. Prompt 9
10. Prompt 10
11. Prompt 11
12. Prompt 12
13. Prompt 13
14. Prompt 14
15. Prompt 15

---

# CONSEJO DE USO
Cuando ya te haya generado una parte, no le pidas “rehacé todo”.
Pedile cosas como:

- “seguí con el siguiente archivo”
- “ahora conectá esto a la API”
- “ahora reemplazá mocks por fetch real”
- “ahora pasalo a Prisma”
- “ahora agregá tests”
- “ahora generá seeders”

