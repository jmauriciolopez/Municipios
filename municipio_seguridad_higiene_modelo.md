# Sistema municipal de Seguridad e Higiene

## 1. Objetivo del producto

Aplicación municipal para detectar, priorizar, asignar, ejecutar y auditar riesgos territoriales vinculados con seguridad e higiene urbana.

Está pensada para que distintas áreas del municipio trabajen sobre una misma base operativa:

- Poda
- Mantenimiento eléctrico y luminaria
- Higiene urbana
- Obras públicas
- Inspección general
- Tránsito
- Defensa civil
- Espacios verdes
- Bromatología y control sanitario

El sistema transforma:

**Riesgo → Incidente → Orden de trabajo → Ejecución → Cierre → Verificación**

---

## 2. Stack definido

### Backend
- **NestJS**
- API REST
- Autenticación con JWT
- Roles y permisos por área
- Jobs programados para recordatorios, SLA y vencimientos

### Frontend
- **React JS**
- Panel web administrativo
- Módulos por área
- Tableros, mapas, bandejas operativas y formularios

### Base de datos
- **PostgreSQL**
- Extensión geoespacial recomendada: **PostGIS**

### Extras recomendados
- Almacenamiento de imágenes y evidencias: S3 compatible
- Mapas: Mapbox o Google Maps
- Notificaciones: email, WhatsApp, push o SMS
- App móvil futura para cuadrillas: React Native o PWA

---

## 3. Modelo conceptual del negocio

### Objetos principales
1. Municipio
2. Área municipal
3. Usuario
4. Rol
5. Zona / barrio / sector
6. Ubicación geográfica
7. Tipo de riesgo
8. Riesgo detectado
9. Incidente
10. Inspección
11. Orden de trabajo
12. Cuadrilla
13. Activo municipal
14. Material / insumo
15. Ejecución / parte de trabajo
16. Evidencia
17. Ciudadano / denunciante
18. SLA / prioridad
19. Estado
20. Historial / auditoría

---

# 4. Modelo de datos completo

## 4.1. Municipio

Representa al cliente principal del sistema.

**Campos sugeridos**
- id
- nombre
- provincia
- país
- cantidad_habitantes
- categoría_municipio
- email_contacto
- teléfono_contacto
- estado
- fecha_alta
- fecha_baja

---

## 4.2. Área municipal

Sectores internos responsables de ejecutar o supervisar tareas.

**Ejemplos**
- Poda
- Luminaria
- Higiene urbana
- Obras públicas
- Tránsito
- Defensa civil

**Campos**
- id
- municipio_id
- nombre
- código
- descripción
- color_ui
- activo
- sla_default_horas
- requiere_cuadrilla
- fecha_creación

**Relaciones**
- un municipio tiene muchas áreas
- un área tiene muchos usuarios
- un área recibe muchos incidentes
- un área genera muchas órdenes de trabajo

---

## 4.3. Rol

Define permisos funcionales.

**Ejemplos**
- Administrador general
- Supervisor de área
- Inspector
- Operador de mesa de entrada
- Miembro de cuadrilla
- Auditor
- Consulta ejecutiva

**Campos**
- id
- nombre
- descripción
- scope
- activo

---

## 4.4. Usuario

Empleado o agente municipal que usa el sistema.

**Campos**
- id
- municipio_id
- área_id
- rol_id
- nombre
- apellido
- dni
- email
- teléfono
- password_hash
- legajo
- cargo
- activo
- último_acceso_at
- fecha_creación

**Relaciones**
- pertenece a un municipio
- puede pertenecer a un área
- tiene un rol
- puede crear inspecciones
- puede asignar órdenes
- puede cerrar tareas

---

## 4.5. Zona / barrio / sector

Sirve para clasificación territorial y operación.

**Campos**
- id
- municipio_id
- nombre
- tipo_zona (barrio, delegación, circuito, sector, corredor)
- código
- polígono_geojson
- activo

**Uso**
- segmentar reportes
- agrupar órdenes por zona
- medir KPI por territorio

---

## 4.6. Ubicación

Entidad reusable para cualquier objeto georreferenciado.

**Campos**
- id
- municipio_id
- calle
- altura
- entre_calles
- referencia
- barrio_id
- localidad
- código_postal
- latitud
- longitud
- geom
- precisión_geo

**Relaciones**
- una ubicación puede asociarse a incidentes, riesgos, activos y órdenes

---

## 4.7. Tipo de riesgo

Catálogo maestro de riesgos municipales.

**Ejemplos**
- Árbol con riesgo de caída
- Rama sobre tendido eléctrico
- Luminaria apagada
- Poste inclinado
- Vereda rota
- Basural a cielo abierto
- Zanja sin vallado
- Semáforo fuera de servicio
- Juego infantil roto
- Cable expuesto

**Campos**
- id
- código
- nombre
- descripción
- categoría
- subcategoría
- área_responsable_default_id
- impacto_default
- probabilidad_default
- criticidad_default
- requiere_inspección
- requiere_orden_trabajo
- activo

---

## 4.8. Matriz de criticidad

Permite parametrizar puntajes y reglas.

**Campos**
- id
- municipio_id
- nombre
- probabilidad_valor_1_desc
- probabilidad_valor_2_desc
- probabilidad_valor_3_desc
- probabilidad_valor_4_desc
- probabilidad_valor_5_desc
- impacto_valor_1_desc
- impacto_valor_2_desc
- impacto_valor_3_desc
- impacto_valor_4_desc
- impacto_valor_5_desc
- regla_cálculo
- activo

---

## 4.9. Riesgo detectado

Es el hallazgo inicial. Puede venir de ciudadano, inspector o sistema.

**Campos**
- id
- municipio_id
- tipo_riesgo_id
- ubicación_id
- área_responsable_id
- matriz_id
- origen_tipo (ciudadano, inspector, sistema, call center, carga manual)
- origen_referencia
- descripción
- probabilidad
- impacto
- criticidad
- nivel_riesgo
- estado
- detectado_at
- vencimiento_at
- requiere_intervención
- duplicado_de_id
- creado_por_usuario_id

**Estados posibles**
- nuevo
- validación_pendiente
- aprobado
- rechazado
- convertido_a_incidente
- cerrado

---

## 4.10. Incidente

Representa el caso operativo que se seguirá hasta su resolución.

**Campos**
- id
- municipio_id
- riesgo_id
- código
- título
- descripción
- área_responsable_id
- ubicación_id
- prioridad
- severidad
- estado
- canal_ingreso
- reportado_por_tipo
- reportado_por_ciudadano_id
- reportado_por_usuario_id
- fecha_reporte
- fecha_compromiso
- fecha_cierre
- requiere_corte_calle
- requiere_apoyo_otra_área
- sla_id
- asignado_a_usuario_id
- observaciones_internas

**Estados**
- recibido
- clasificado
- asignado
- en_proceso
- en_espera
- resuelto
- verificado
- cerrado
- cancelado

---

## 4.11. Inspección

Sirve para auditar o validar una condición en territorio.

**Campos**
- id
- municipio_id
- incidente_id
- riesgo_id
- orden_trabajo_id
- inspector_usuario_id
- tipo_inspección (inicial, técnica, seguimiento, cierre, preventiva)
- fecha_programada
- fecha_realizada
- resultado
- checklist_json
- observaciones
- recomendación
- requiere_orden_trabajo
- próxima_inspección_at

**Uso**
- validación previa
- control de ejecución
- auditoría final

---

## 4.12. SLA / regla de atención

Define tiempos esperados por prioridad o tipo de caso.

**Campos**
- id
- municipio_id
- nombre
- área_id
- tipo_riesgo_id
- prioridad
- tiempo_primera_respuesta_horas
- tiempo_resolución_horas
- tiempo_verificación_horas
- activo

---

## 4.13. Orden de trabajo

Es la pieza central operativa para cuadrillas.

**Campos**
- id
- municipio_id
- incidente_id
- área_id
- cuadrilla_id
- activo_id
- código
- tipo_trabajo
- título
- descripción
- prioridad
- estado
- fecha_creación
- fecha_programada
- fecha_inicio_real
- fecha_fin_real
- estimación_horas
- requiere_materiales
- requiere_epp
- requiere_corte_tránsito
- requiere_elevador
- creado_por_usuario_id
- asignado_por_usuario_id
- responsable_ejecución_usuario_id
- motivo_cancelación

**Estados**
- borrador
- pendiente_asignación
- asignada
- programada
- en_camino
- en_ejecución
- pausada
- completada
- verificada
- cancelada

---

## 4.14. Cuadrilla

Equipo operativo territorial.

**Campos**
- id
- municipio_id
- área_id
- nombre
- código
- tipo_cuadrilla
- base_operativa
- turno
- capacidad_máxima
- activa

**Relaciones**
- tiene muchos integrantes
- recibe muchas órdenes

---

## 4.15. Integrante de cuadrilla

Tabla intermedia entre usuario y cuadrilla.

**Campos**
- id
- cuadrilla_id
- usuario_id
- rol_en_cuadrilla (chofer, técnico, podador, capataz, ayudante)
- fecha_desde
- fecha_hasta
- activo

---

## 4.16. Activo municipal

Bien físico que puede tener fallas o requerir mantenimiento.

**Ejemplos**
- Columna de alumbrado
- Luminaria LED
- Semáforo
- Plaza
- Juego infantil
- Árbol inventariado
- Camión cesta
- Tablero eléctrico

**Campos**
- id
- municipio_id
- área_id
- tipo_activo_id
- código_patrimonial
- nombre
- descripción
- ubicación_id
- estado
- marca
- modelo
- número_serie
- fecha_instalación
- fecha_garantía_fin
- vida_útil_estimada_meses
- criticidad_operativa
- activo

---

## 4.17. Tipo de activo

Catálogo para clasificar activos.

**Campos**
- id
- municipio_id
- nombre
- categoría
- requiere_mantenimiento
- frecuencia_mantenimiento_días
- activo

---

## 4.18. Mantenimiento preventivo

Plan de mantenimiento programado de activos.

**Campos**
- id
- municipio_id
- activo_id
- área_id
- frecuencia_días
- último_mantenimiento_at
- próximo_mantenimiento_at
- checklist_json
- activo

---

## 4.19. Parte de trabajo / ejecución

Registro detallado de la ejecución real.

**Campos**
- id
- orden_trabajo_id
- usuario_id
- cuadrilla_id
- inicio_at
- fin_at
- duración_minutos
- resultado
- tareas_realizadas
- novedad
- pendiente_remanente
- requiere_revisita
- clima

---

## 4.20. Material / insumo

Catálogo de stock operativo.

**Ejemplos**
- Lámpara LED
- Fotocélula
- Cable
- Fusible
- Conector
- Bolsa de residuos
- Pintura vial
- Cinta de peligro
- Aceite de motosierra

**Campos**
- id
- municipio_id
- código
- nombre
- categoría
- unidad_medida
- stock_actual
- stock_mínimo
- costo_unitario
- activo

---

## 4.21. Consumo de material

Asocia materiales usados en una orden.

**Campos**
- id
- orden_trabajo_id
- material_id
- cantidad
- costo_unitario
- costo_total
- registrado_por_usuario_id
- registrado_at

---

## 4.22. Vehículo / recurso operativo

Recursos para ejecutar tareas.

**Campos**
- id
- municipio_id
- área_id
- tipo_recurso
- nombre
- patente
- interno
- estado
- capacidad
- observaciones
- activo

**Ejemplos**
- Camión cesta
- Hidroelevador
- Camioneta
- Motosierra
- Generador

---

## 4.23. Evidencia

Fotos, videos, documentos, audios.

**Campos**
- id
- municipio_id
- entidad_tipo
- entidad_id
- tipo_archivo
- url
- miniatura_url
- nombre_archivo
- tamaño_bytes
- comentario
- capturado_por_usuario_id
- capturado_at
- latitud
- longitud

**Entidad_tipo**
- riesgo
- incidente
- inspección
- orden_trabajo
- activo
- ciudadano

---

## 4.24. Ciudadano / denunciante

Para trazabilidad del reporte.

**Campos**
- id
- municipio_id
- nombre
- apellido
- dni_opcional
- teléfono
- email
- canal_preferido
- anonimizado
- observaciones

---

## 4.25. Reporte ciudadano

Separar el reporte del incidente puede ser útil para auditoría.

**Campos**
- id
- municipio_id
- ciudadano_id
- tipo_riesgo_id
- ubicación_id
- descripción
- prioridad_percibida
- estado
- fecha_reporte
- incidente_generado_id
- validado_por_usuario_id
- validado_at

---

## 4.26. Checklist plantilla

Estructuras reutilizables por tipo de inspección o tarea.

**Campos**
- id
- municipio_id
- nombre
- tipo_uso (inspección, cierre, mantenimiento, seguridad)
- área_id
- json_schema
- activo

---

## 4.27. Comentario / bitácora

Seguimiento conversacional interno.

**Campos**
- id
- entidad_tipo
- entidad_id
- usuario_id
- comentario
- privado
- creado_at

---

## 4.28. Historial de estados

Auditoría completa del flujo.

**Campos**
- id
- entidad_tipo
- entidad_id
- estado_anterior
- estado_nuevo
- cambiado_por_usuario_id
- motivo
- fecha_cambio

---

## 4.29. Auditoría general

Log técnico y legal.

**Campos**
- id
- municipio_id
- usuario_id
- acción
- entidad_tipo
- entidad_id
- payload_anterior_json
- payload_nuevo_json
- ip
- user_agent
- fecha

---

## 4.30. Notificación

Sistema de avisos internos.

**Campos**
- id
- municipio_id
- usuario_id
- tipo
- título
- mensaje
- entidad_tipo
- entidad_id
- leído
- enviado_at
- leído_at

---

# 5. Relaciones principales del sistema

## Flujo base
- Un **tipo de riesgo** define una categoría y un área responsable sugerida.
- Un **riesgo detectado** nace en una **ubicación**.
- Ese riesgo puede convertirse en un **incidente**.
- El incidente puede requerir una o varias **inspecciones**.
- El incidente genera una o varias **órdenes de trabajo**.
- La orden se asigna a una **cuadrilla** y opcionalmente a un **activo**.
- Durante la ejecución se cargan **partes de trabajo**, **evidencias** y **consumo de materiales**.
- Luego se realiza verificación y cierre.

## Relación por activos
- Un activo puede generar múltiples incidentes.
- Un activo puede tener un plan de mantenimiento preventivo.

## Relación por territorio
- Una zona contiene muchas ubicaciones.
- Cada orden, incidente o riesgo puede ser analizado por barrio, delegación o circuito.

---

# 6. Módulos funcionales del producto

## 6.1. Mesa de entrada de incidentes
- Carga manual de reclamos
- Validación de reportes ciudadanos
- Clasificación inicial
- Detección de duplicados

## 6.2. Gestión de riesgos
- Registro del hallazgo
- Probabilidad, impacto y criticidad
- Priorización automática
- Vencimientos por SLA

## 6.3. Inspecciones
- Agenda de inspecciones
- Checklist técnico
- Resultado de visita
- Evidencia fotográfica

## 6.4. Órdenes de trabajo
- Generación desde incidente
- Asignación por supervisor
- Seguimiento en tiempo real
- Cierre y verificación

## 6.5. Cuadrillas y recursos
- Composición de cuadrillas
- Disponibilidad
- Turnos
- Vehículos y herramientas

## 6.6. Activos municipales
- Inventario territorial
- Historial de fallas
- Estado operativo
- Mantenimiento preventivo

## 6.7. Stock e insumos
- Materiales usados por orden
- Reposición mínima
- Costo por intervención

## 6.8. Tableros y métricas
- Incidentes abiertos por área
- Tiempo medio de resolución
- Mapa de calor de riesgos
- Cumplimiento de SLA
- Costos por zona

## 6.9. Ciudadano
- Recepción de reportes
- Seguimiento del estado
- Trazabilidad de reclamos

---

# 7. Mocks de pantallas para programar

A continuación te dejo mocks funcionales en texto. Están pensados como wireframes para convertir después en React.

---

## 7.1. Login

```text
+---------------------------------------------------+
| LOGO MUNICIPIO / SISTEMA                          |
|---------------------------------------------------|
| Email                                             |
| [_______________________________]                 |
| Contraseña                                        |
| [_______________________________]                 |
| [ Ingresar ]                                      |
| ¿Olvidaste tu contraseña?                         |
+---------------------------------------------------+
```

---

## 7.2. Dashboard general ejecutivo

```text
+--------------------------------------------------------------------------------+
| Topbar: logo | buscador | alertas | usuario                                    |
+--------------------------------------------------------------------------------+
| KPIs                                                                        |
| [Incidentes abiertos] [Vencidos SLA] [Órdenes en ejecución] [Riesgos críticos] |
+--------------------------------------------------------------------------------+
| Mapa de calor territorial                                                    |
| [                                 MAPA                                      ] |
+--------------------------------------------------------------------------------+
| Gráfico por área            | Gráfico por prioridad                          |
| [ barras ]                  | [ torta / barras ]                             |
+--------------------------------------------------------------------------------+
| Últimos incidentes críticos                                                   |
| Código | Área | Tipo | Barrio | Prioridad | Estado | Fecha                  |
+--------------------------------------------------------------------------------+
```

---

## 7.3. Bandeja de incidentes

```text
+------------------------------------------------------------------------------------------------+
| INCIDENTES                                                                                     |
| Filtros: [Área] [Prioridad] [Estado] [Barrio] [Fecha] [Buscar...] [Nuevo incidente]          |
+------------------------------------------------------------------------------------------------+
| Código | Tipo de riesgo | Área | Ubicación | Prioridad | Estado | Asignado | Fecha | Acciones |
| INC-01 | Luminaria      | Lum. | Belgrano  | Alta      | Abierto| Juan     | 31/03 | Ver      |
| INC-02 | Árbol peligro  | Poda | Centro    | Crítica   | Asign. | Cuad. 2  | 31/03 | Ver      |
+------------------------------------------------------------------------------------------------+
```

---

## 7.4. Detalle de incidente

```text
+--------------------------------------------------------------------------------+
| INC-000245 - Árbol con riesgo de caída                                         |
| Estado: En proceso | Prioridad: Crítica | Área: Poda                           |
+--------------------------------------------------------------------------------+
| Ubicación: Av. Costanera 1234 | Barrio: Centro | Ver en mapa                   |
| Reportado por: Ciudadano / Inspector / Sistema                                 |
| Fecha: 31/03/2026 09:40                                                        |
+--------------------------------------------------------------------------------+
| Descripción                                                                     |
| [ texto largo ]                                                                 |
+--------------------------------------------------------------------------------+
| Evidencias                                                                      |
| [foto 1] [foto 2] [adjuntar]                                                   |
+--------------------------------------------------------------------------------+
| Timeline                                                                        |
| - recibido                                                                      |
| - clasificado                                                                   |
| - asignado                                                                      |
| - en proceso                                                                    |
+--------------------------------------------------------------------------------+
| Acciones                                                                        |
| [Crear orden] [Asignar] [Reprogramar] [Cerrar] [Agregar comentario]            |
+--------------------------------------------------------------------------------+
```

---

## 7.5. Pantalla de inspección

```text
+--------------------------------------------------------------------------------+
| NUEVA INSPECCIÓN                                                                |
+--------------------------------------------------------------------------------+
| Tipo: [Inicial v]   Inspector: [usuario]   Fecha programada: [__/__/____]      |
| Incidente vinculado: [buscar]                                                    |
| Ubicación: [autocompletar + mapa]                                                |
+--------------------------------------------------------------------------------+
| Checklist                                                                       |
| [ ] Riesgo confirmado                                                           |
| [ ] Requiere corte de calle                                                     |
| [ ] Requiere elevador                                                           |
| [ ] Hay cables comprometidos                                                    |
| [ ] Se requiere apoyo de otra área                                              |
+--------------------------------------------------------------------------------+
| Observaciones                                                                   |
| [ campo largo ]                                                                 |
+--------------------------------------------------------------------------------+
| Evidencias [subir fotos]                                                        |
| [Guardar] [Guardar y crear orden]                                               |
+--------------------------------------------------------------------------------+
```

---

## 7.6. Bandeja de órdenes de trabajo

```text
+------------------------------------------------------------------------------------------------+
| ÓRDENES DE TRABAJO                                                                               |
| Filtros: [Área] [Cuadrilla] [Estado] [Fecha] [Prioridad] [Buscar]                              |
+------------------------------------------------------------------------------------------------+
| Código | Tipo trabajo | Área | Cuadrilla | Zona | Prioridad | Programada | Estado | Acciones  |
| OT-101 | Reparación   | Lum. | Cuad. A   | Sur  | Alta      | 01/04      | Asig.  | Ver       |
| OT-102 | Poda         | Poda | Cuad. B   | Ctro | Crítica   | 01/04      | Prog.  | Ver       |
+------------------------------------------------------------------------------------------------+
```

---

## 7.7. Detalle de orden de trabajo

```text
+--------------------------------------------------------------------------------+
| OT-000101 - Cambio de luminaria                                                |
| Estado: En ejecución | Prioridad: Alta | Área: Luminaria                       |
+--------------------------------------------------------------------------------+
| Incidente origen: INC-000245                                                   |
| Ubicación: Calle 9 y Mitre                                                     |
| Cuadrilla: LUM-02                                                              |
| Responsable: Pedro Gómez                                                       |
| Fecha programada: 01/04/2026 08:00                                             |
+--------------------------------------------------------------------------------+
| Tareas                                                                          |
| - Revisar alimentación                                                         |
| - Reemplazar artefacto                                                         |
| - Verificar encendido                                                          |
+--------------------------------------------------------------------------------+
| Materiales previstos                                                            |
| [ Luminaria LED x1 ] [ Fotocélula x1 ]                                         |
+--------------------------------------------------------------------------------+
| Evidencias                                                                      |
| [antes] [después] [adjuntar]                                                   |
+--------------------------------------------------------------------------------+
| Acciones                                                                        |
| [Iniciar] [Pausar] [Completar] [Registrar material] [Registrar novedad]        |
+--------------------------------------------------------------------------------+
```

---

## 7.8. Tablero de cuadrillas

```text
+--------------------------------------------------------------------------------+
| CUADRILLAS                                                                      |
+--------------------------------------------------------------------------------+
| [Cuadrilla] [Área] [Turno] [Estado] [Ubicación actual] [Órdenes activas]       |
| PODA-1     Poda   Mañana Disponible Centro             2                        |
| LUM-2      Lum.   Tarde   En calle   Zona Sur          4                        |
+--------------------------------------------------------------------------------+
| Panel lateral: detalle de cuadrilla                                             |
| - integrantes                                                                   |
| - vehículo                                                                      |
| - herramientas                                                                   |
| - agenda del día                                                                |
+--------------------------------------------------------------------------------+
```

---

## 7.9. Mapa operativo

```text
+--------------------------------------------------------------------------------+
| MAPA OPERATIVO                                                                  |
| Capas: [Riesgos] [Incidentes] [Órdenes] [Activos] [Cuadrillas]                 |
| Filtros: [Área] [Prioridad] [Estado] [Barrio]                                   |
+--------------------------------------------------------------------------------+
|                                                                                |
|                           [ MAPA GRANDE ]                                       |
|                                                                                |
+--------------------------------------------------------------------------------+
| Panel derecho                                                                   |
| - detalle del punto seleccionado                                                |
| - evidencias                                                                    |
| - incidentes cercanos                                                           |
| - acciones rápidas                                                              |
+--------------------------------------------------------------------------------+
```

---

## 7.10. Gestión de activos

```text
+------------------------------------------------------------------------------------------------+
| ACTIVOS                                                                                         |
| [Buscar] [Tipo] [Área] [Estado] [Barrio] [Nuevo activo]                                        |
+------------------------------------------------------------------------------------------------+
| Código | Tipo activo | Nombre | Área | Ubicación | Estado | Próx. mantenimiento | Acciones    |
+------------------------------------------------------------------------------------------------+
```

Pantalla de detalle:

```text
+--------------------------------------------------------------------------------+
| ACTIVO: POSTE-00045                                                            |
| Tipo: Columna de alumbrado | Estado: Operativo                                 |
+--------------------------------------------------------------------------------+
| Ficha técnica                                                                   |
| Marca | Modelo | Serie | Fecha instalación                                     |
+--------------------------------------------------------------------------------+
| Ubicación + mapa                                                                |
+--------------------------------------------------------------------------------+
| Historial de incidentes                                                         |
| Historial de mantenimiento                                                      |
| Evidencias                                                                      |
+--------------------------------------------------------------------------------+
```

---

## 7.11. Stock e insumos

```text
+--------------------------------------------------------------------------------+
| MATERIALES                                                                      |
| [Buscar] [Categoría] [Stock bajo] [Nuevo material]                             |
+--------------------------------------------------------------------------------+
| Código | Nombre | Categoría | Unidad | Stock actual | Stock mínimo | Acciones  |
+--------------------------------------------------------------------------------+
```

---

## 7.12. Reporte ciudadano simplificado

```text
+------------------------------------------------------------+
| REPORTAR PROBLEMA                                          |
+------------------------------------------------------------+
| Tipo de problema [v]                                       |
| Descripción                                                |
| [____________________________________________]             |
| Dirección                                                  |
| [____________________________________________]             |
| Ubicar en mapa                                             |
| [ MAPA ]                                                   |
| Foto                                                       |
| [ adjuntar ]                                               |
| Nombre                                                     |
| [____________________]                                     |
| Teléfono                                                   |
| [____________________]                                     |
| [Enviar reporte]                                           |
+------------------------------------------------------------+
```

---

## 7.13. Panel por área: Poda

```text
+--------------------------------------------------------------------------------+
| PODA                                                                            |
+--------------------------------------------------------------------------------+
| KPIs: [Árboles en riesgo] [Pendientes] [Resueltos mes] [Promedio resolución]   |
+--------------------------------------------------------------------------------+
| Lista priorizada                                                                |
| Código | Tipo | Zona | Riesgo | Prioridad | Cuadrilla | Estado                 |
+--------------------------------------------------------------------------------+
| Agenda de cuadrillas                                                            |
+--------------------------------------------------------------------------------+
| Mapa con árboles críticos                                                       |
+--------------------------------------------------------------------------------+
```

---

## 7.14. Panel por área: Luminaria

```text
+--------------------------------------------------------------------------------+
| LUMINARIA                                                                       |
+--------------------------------------------------------------------------------+
| KPIs: [Apagadas] [Intermitentes] [Vencidas SLA] [Reparadas mes]                |
+--------------------------------------------------------------------------------+
| Lista de postes / incidentes                                                    |
| Código | Barrio | Tipo falla | Prioridad | Cuadrilla | Estado                  |
+--------------------------------------------------------------------------------+
| Mapa nocturno / mapa de fallas                                                  |
+--------------------------------------------------------------------------------+
| Materiales más usados                                                           |
+--------------------------------------------------------------------------------+
```

---

# 8. Roadmap de MVP

## Fase 1
- Login
- Usuarios y roles
- Áreas municipales
- Carga de incidentes
- Clasificación de riesgos
- Órdenes de trabajo
- Evidencias
- Dashboard básico

## Fase 2
- Mapa operativo
- Cuadrillas
- Activos
- Checklists de inspección
- SLA y vencimientos
- Reporte ciudadano

## Fase 3
- Stock e insumos
- Mantenimiento preventivo
- App móvil / PWA
- Ruteo por zona
- Integraciones con WhatsApp / GIS / sensores

---

# 9. Sugerencia de módulos NestJS

- auth
- users
- roles
- municipalities
- areas
- zones
- locations
- risk-types
- risks
- incidents
- inspections
- sla
- work-orders
- crews
- assets
- asset-types
- maintenance-plans
- materials
- material-consumption
- evidences
- citizen-reports
- notifications
- audit
- dashboards

---

# 10. Estructura sugerida de frontend React

## Vistas principales
- /login
- /dashboard
- /incidentes
- /incidentes/:id
- /inspecciones
- /ordenes
- /ordenes/:id
- /cuadrillas
- /mapa
- /activos
- /materiales
- /reportes
- /configuracion

## Componentes reutilizables
- DataTable
- FilterBar
- StatusBadge
- PriorityBadge
- MapPicker
- Timeline
- EvidenceGallery
- ChecklistForm
- KPIBox
- AreaSelector
- WorkOrderCard

---

# 11. Recomendaciones de diseño funcional

- Mantener estados simples y visibles
- Toda tarea debe tener ubicación
- Toda resolución debe poder auditarse con evidencia
- Toda área debe poder ver su bandeja y su mapa
- Debe existir trazabilidad completa por usuario y por fecha
- Evitar flujos demasiado burocráticos en el MVP

---

# 12. Primer corte recomendado para salir a vender

La primera versión comercial puede enfocarse en:

1. **Poda**
2. **Luminaria**
3. **Reclamos ciudadanos**
4. **Órdenes de trabajo**
5. **Dashboard ejecutivo**

Ese recorte ya permite mostrar valor concreto:

- menor tiempo de respuesta
- visibilidad territorial
- trazabilidad
- evidencia de ejecución
- priorización operativa

