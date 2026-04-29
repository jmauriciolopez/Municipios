# Tareas - Backlog de Código Muerto

## Meta
- **Total símbolos muertos**: ~250
- **Archivos afectados**: Múltiples módulos del backend

---

## Tareas de Limpieza de Código Muerto

### HIGH PRIORITY - Módulos con más código muerto

- [ ] **backend/src/activos/** - 13 símbolos muertos (controller + service)
  - [x] Analizar si el módulo está obsoleto
  - [ ] Eliminar métodos no utilizados o habilitar endpoints
  
- [ ] **backend/src/areas/** - 11 símbolos muertos
  - [ ] Evaluar uso del módulo
  - [ ] Limpiar código muerto

- [ ] **backend/src/auditoria/** - 11 símbolos muertos
  - [ ] Verificar si auditoría está activa
  - [ ] Limpiar código muerto

- [ ] **backend/src/auth/** - 13 símbolos muertos (includes guards + decorators)
  - [ ] Verificar si autenticación funciona correctamente
  - [ ] Limpiar código muerto

### HIGH PRIORITY - Módulos críticos

- [ ] **backend/src/categorias/** - 17 símbolos muertos
  - [ ] Revisar si se usa desde el frontend
  - [ ] Limpiar

- [ ] **backend/src/cuadrillas/** - 21 símbolos muertos
  - [ ] Evaluar funcionalidad
  - [ ] Limpiar

- [ ] **backend/src/dashboard/** - 10 símbolos muertos
  - [ ] Verificar endpoints del dashboard
  - [ ] Limpiar

- [ ] **backend/src/evidencias/** - 8 símbolos muertos
  - [ ] Revisar uso del módulo
  - [ ] Limpiar

### MEDIUM PRIORITY - Módulos adicionales

- [ ] **backend/src/incidentes/** - 21 símbolos muertos
- [ ] **backend/src/inspecciones/** - 13 símbolos muertos
- [ ] **backend/src/inventario/** - símbolo único
- [ ] **backend/src/notificaciones/** - símbolos muertos
- [ ] **backend/src/ordenes/** - símbolos muertos
- [ ] **backend/src/reportes/** - símbolos muertos
- [ ] **backend/src/usuarios/** - símbolos muertos
- [ ] **backend/prisma/seed.ts** - función main()
- [ ] **backend/src/app.controller.ts** - getHealth()

---

## Notas

- Todos los símbolos detectados tienen `confidence: 1.0`
- Señales comunes: `unreachable_file`, `no_callers`, `not_barrel_exported`
- Posibles causas: módulos no registrados en router principal, o bien obsoletos