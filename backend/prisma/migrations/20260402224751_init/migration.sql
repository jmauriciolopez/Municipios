-- CreateEnum
CREATE TYPE "OrdenEstado" AS ENUM ('detectado', 'asignado', 'en_proceso', 'resuelto', 'verificado', 'cancelado');

-- CreateEnum
CREATE TYPE "IncidenteEstado" AS ENUM ('abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado');

-- CreateEnum
CREATE TYPE "Prioridad" AS ENUM ('baja', 'media', 'alta', 'critica');

-- CreateEnum
CREATE TYPE "ActivoEstado" AS ENUM ('operativo', 'en_mantenimiento', 'fuera_servicio', 'dado_de_baja');

-- CreateEnum
CREATE TYPE "CuadrillaEstado" AS ENUM ('disponible', 'ocupada', 'fuera_servicio');

-- CreateEnum
CREATE TYPE "EvidenciaTipo" AS ENUM ('antes', 'despues', 'inspeccion', 'intervencion');

-- CreateEnum
CREATE TYPE "AuditoriaTipo" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');

-- CreateTable
CREATE TABLE "municipios" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "municipios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" UUID NOT NULL,
    "municipio_id" UUID NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(80) NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "municipio_id" UUID,
    "nombre" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "password_hash" VARCHAR(255),
    "telefono" VARCHAR(50),
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_roles" (
    "usuario_id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_roles_pkey" PRIMARY KEY ("usuario_id","rol_id")
);

-- CreateTable
CREATE TABLE "cuadrillas" (
    "id" UUID NOT NULL,
    "municipio_id" UUID,
    "nombre" VARCHAR(140) NOT NULL,
    "area_id" UUID,
    "estado" "CuadrillaEstado" NOT NULL DEFAULT 'disponible',
    "supervisor_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "cuadrillas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuadrilla_miembros" (
    "id" UUID NOT NULL,
    "cuadrilla_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "rol" VARCHAR(120),
    "fecha_ingreso" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_salida" TIMESTAMPTZ,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cuadrilla_miembros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_activo" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "tipos_activo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activos" (
    "id" UUID NOT NULL,
    "municipio_id" UUID,
    "codigo" VARCHAR(120) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "tipo_activo_id" UUID NOT NULL,
    "estado" "ActivoEstado" NOT NULL DEFAULT 'operativo',
    "lat" DECIMAL(10,7),
    "lng" DECIMAL(10,7),
    "direccion" VARCHAR(250),
    "area_responsable_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "activos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones" (
    "id" UUID NOT NULL,
    "entidad_tipo" VARCHAR(60) NOT NULL,
    "entidad_id" UUID NOT NULL,
    "lat" DECIMAL(10,7) NOT NULL,
    "lng" DECIMAL(10,7) NOT NULL,
    "direccion" VARCHAR(250),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ubicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riesgos" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(140) NOT NULL,
    "descripcion" TEXT,
    "nivel" INTEGER NOT NULL,
    "area_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riesgos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidentes" (
    "id" UUID NOT NULL,
    "municipio_id" UUID,
    "tipo" VARCHAR(140) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "IncidenteEstado" NOT NULL DEFAULT 'abierto',
    "prioridad" "Prioridad" NOT NULL DEFAULT 'media',
    "lat" DECIMAL(10,7) NOT NULL,
    "lng" DECIMAL(10,7) NOT NULL,
    "direccion" VARCHAR(250),
    "area_id" UUID,
    "activo_id" UUID,
    "riesgo_id" UUID,
    "reportado_por" UUID,
    "fecha_reporte" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_resolucion" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "incidentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" UUID NOT NULL,
    "municipio_id" UUID,
    "entidad_tipo" VARCHAR(80) NOT NULL,
    "entidad_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" "EvidenciaTipo" NOT NULL,
    "caption" TEXT,
    "tomado_por" UUID,
    "timestamp_foto" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspecciones" (
    "id" UUID NOT NULL,
    "incidente_id" UUID NOT NULL,
    "activo_id" UUID,
    "inspector_id" UUID,
    "area_id" UUID,
    "resultado" VARCHAR(255),
    "observaciones" TEXT,
    "fecha_inspeccion" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "inspecciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_trabajo" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(80) NOT NULL,
    "municipio_id" UUID,
    "incidente_id" UUID,
    "area_id" UUID,
    "cuadrilla_id" UUID,
    "estado" "OrdenEstado" NOT NULL DEFAULT 'detectado',
    "prioridad" "Prioridad" NOT NULL DEFAULT 'media',
    "descripcion" TEXT,
    "fecha_asignacion" TIMESTAMPTZ,
    "fecha_inicio" TIMESTAMPTZ,
    "fecha_cierre" TIMESTAMPTZ,
    "creado_por" UUID,
    "actualizado_por" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "ordenes_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_materiales" (
    "id" UUID NOT NULL,
    "orden_id" UUID NOT NULL,
    "item" VARCHAR(200) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "unidad" VARCHAR(40) NOT NULL,
    "estado" VARCHAR(120),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordenes_materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_items" (
    "id" UUID NOT NULL,
    "codigo" VARCHAR(120) NOT NULL,
    "nombre" VARCHAR(180) NOT NULL,
    "descripcion" TEXT,
    "cantidad" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "area_id" UUID,
    "creado_por" UUID,
    "actualizado_por" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "inventario_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_eventos" (
    "id" UUID NOT NULL,
    "entidad_tipo" VARCHAR(100) NOT NULL,
    "entidad_id" UUID NOT NULL,
    "accion" VARCHAR(120) NOT NULL,
    "usuario_id" UUID,
    "datos" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_eventos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "municipios_nombre_key" ON "municipios"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "municipios_codigo_key" ON "municipios"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "areas_municipio_id_nombre_key" ON "areas"("municipio_id", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_activo_nombre_key" ON "tipos_activo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "activos_codigo_key" ON "activos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "riesgos_nombre_key" ON "riesgos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_codigo_key" ON "ordenes_trabajo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_incidente_id_key" ON "ordenes_trabajo"("incidente_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_items_codigo_key" ON "inventario_items"("codigo");

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuadrillas" ADD CONSTRAINT "cuadrillas_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuadrillas" ADD CONSTRAINT "cuadrillas_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuadrillas" ADD CONSTRAINT "cuadrillas_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuadrilla_miembros" ADD CONSTRAINT "cuadrilla_miembros_cuadrilla_id_fkey" FOREIGN KEY ("cuadrilla_id") REFERENCES "cuadrillas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuadrilla_miembros" ADD CONSTRAINT "cuadrilla_miembros_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activos" ADD CONSTRAINT "activos_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activos" ADD CONSTRAINT "activos_tipo_activo_id_fkey" FOREIGN KEY ("tipo_activo_id") REFERENCES "tipos_activo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activos" ADD CONSTRAINT "activos_area_responsable_id_fkey" FOREIGN KEY ("area_responsable_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riesgos" ADD CONSTRAINT "riesgos_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidentes" ADD CONSTRAINT "incidentes_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidentes" ADD CONSTRAINT "incidentes_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidentes" ADD CONSTRAINT "incidentes_activo_id_fkey" FOREIGN KEY ("activo_id") REFERENCES "activos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidentes" ADD CONSTRAINT "incidentes_riesgo_id_fkey" FOREIGN KEY ("riesgo_id") REFERENCES "riesgos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidentes" ADD CONSTRAINT "incidentes_reportado_por_fkey" FOREIGN KEY ("reportado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_tomado_por_fkey" FOREIGN KEY ("tomado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_incidente_id_fkey" FOREIGN KEY ("incidente_id") REFERENCES "incidentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_activo_id_fkey" FOREIGN KEY ("activo_id") REFERENCES "activos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspecciones" ADD CONSTRAINT "inspecciones_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "municipios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_incidente_id_fkey" FOREIGN KEY ("incidente_id") REFERENCES "incidentes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_cuadrilla_id_fkey" FOREIGN KEY ("cuadrilla_id") REFERENCES "cuadrillas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_actualizado_por_fkey" FOREIGN KEY ("actualizado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_materiales" ADD CONSTRAINT "ordenes_materiales_orden_id_fkey" FOREIGN KEY ("orden_id") REFERENCES "ordenes_trabajo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_items" ADD CONSTRAINT "inventario_items_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_items" ADD CONSTRAINT "inventario_items_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_items" ADD CONSTRAINT "inventario_items_actualizado_por_fkey" FOREIGN KEY ("actualizado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_eventos" ADD CONSTRAINT "auditoria_eventos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
