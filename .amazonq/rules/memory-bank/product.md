# Product Overview — Sistema Municipal de Seguridad e Higiene

## Purpose

A full-stack municipal management platform for detecting, prioritizing, assigning, executing, and auditing territorial risks related to urban safety and hygiene. It enables multiple municipal departments to operate on a shared operational base.

## Core Workflow

**Riesgo → Incidente → Orden de Trabajo → Ejecución → Cierre → Verificación**

## Target Users

- Municipal administrators and supervisors
- Area inspectors (Poda, Luminaria, Higiene Urbana, Obras Públicas, Tránsito, Defensa Civil, Espacios Verdes, Bromatología)
- Field crews (cuadrillas) via mobile app
- Executive stakeholders (dashboard/reporting)

## Key Features

### Incident Management
- Manual intake and citizen report validation
- Risk classification with probability/impact/criticality matrix
- Duplicate detection and SLA tracking
- Full lifecycle: recibido → clasificado → asignado → en_proceso → resuelto → verificado → cerrado

### Work Orders
- Generated from incidents, assigned to cuadrillas
- Status tracking: detectado → asignado → en_proceso → resuelto → verificado → cancelado
- Material consumption tracking per order

### Field Operations
- Cuadrilla (crew) management with member roles
- Mobile app (React Native/Expo) for field workers
- Offline-capable evidence capture with photo upload
- GPS-based location tracking

### Asset Management
- Municipal asset inventory (poles, lights, playgrounds, trees, vehicles)
- Maintenance history and preventive maintenance scheduling
- Asset-linked incident tracking

### Inspections
- Scheduled and ad-hoc inspections linked to incidents or assets
- Checklist-based results with photo evidence

### Geospatial Mapping
- Interactive map with Leaflet/react-leaflet
- Heat map of risk concentration by zone
- Layer toggles: Riesgos, Incidentes, Órdenes, Activos, Cuadrillas

### Dashboard & Analytics
- KPIs: open incidents, SLA breaches, active orders, critical risks
- Charts by area and priority
- Territory-based filtering

### Audit & Traceability
- Full audit log (AuditoriaEvento) for all CREATE/UPDATE/DELETE/LOGIN/LOGOUT actions
- State history per entity
- User attribution on all operations

## MVP Commercial Focus (Phase 1)
1. Poda (tree trimming)
2. Luminaria (street lighting)
3. Citizen reports
4. Work orders
5. Executive dashboard
