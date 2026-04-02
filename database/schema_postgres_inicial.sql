-- Archivo: /database/schema_postgres_inicial.sql
-- Esquema inicial para sistema municipal de seguridad e higiene

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- enums
CREATE TYPE orden_estado AS ENUM ('detectado', 'asignado', 'en_proceso', 'resuelto', 'verificado', 'cancelado');
CREATE TYPE incidente_estado AS ENUM ('abierto', 'en_proceso', 'resuelto', 'cerrado', 'cancelado');
CREATE TYPE prioridad AS ENUM ('baja', 'media', 'alta', 'critica');
CREATE TYPE activo_estado AS ENUM ('operativo', 'en_mantenimiento', 'fuera_servicio', 'dado_de_baja');
CREATE TYPE cuadrilla_estado AS ENUM ('disponible', 'ocupada', 'fuera_servicio');
CREATE TYPE evidencia_tipo AS ENUM ('antes', 'despues', 'inspeccion', 'intervencion');

-- tablas base
CREATE TABLE municipios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL UNIQUE,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipio_id UUID NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(municipio_id, nombre)
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipio_id UUID REFERENCES municipios(id) ON DELETE SET NULL,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    telefono VARCHAR(50),
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE usuarios_roles (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, rol_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cuadrillas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipio_id UUID REFERENCES municipios(id) ON DELETE SET NULL,
    nombre VARCHAR(140) NOT NULL,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    estado cuadrilla_estado NOT NULL DEFAULT 'disponible',
    supervisor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE cuadrilla_miembros (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cuadrilla_id UUID NOT NULL REFERENCES cuadrillas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol VARCHAR(120),
    fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_salida TIMESTAMPTZ,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE tipos_activo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(120) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE activos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipio_id UUID REFERENCES municipios(id) ON DELETE SET NULL,
    codigo VARCHAR(120) NOT NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    tipo_activo_id UUID NOT NULL REFERENCES tipos_activo(id) ON DELETE RESTRICT,
    estado activo_estado NOT NULL DEFAULT 'operativo',
    lat NUMERIC(10, 7),
    lng NUMERIC(10, 7),
    direccion VARCHAR(250),
    area_responsable_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE ubicaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidad_tipo VARCHAR(60) NOT NULL,
    entidad_id UUID NOT NULL,
    lat NUMERIC(10,7) NOT NULL,
    lng NUMERIC(10,7) NOT NULL,
    direccion VARCHAR(250),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE riesgos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(140) NOT NULL UNIQUE,
    descripcion TEXT,
    nivel INTEGER NOT NULL CHECK (nivel BETWEEN 1 AND 5),
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE incidentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipio_id UUID REFERENCES municipios(id) ON DELETE SET NULL,
    tipo VARCHAR(140) NOT NULL,
    descripcion TEXT NOT NULL,
    estado incidente_estado NOT NULL DEFAULT 'abierto',
    prioridad prioridad NOT NULL DEFAULT 'media',
    lat NUMERIC(10,7) NOT NULL,
    lng NUMERIC(10,7) NOT NULL,
    direccion VARCHAR(250),
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    activo_id UUID REFERENCES activos(id) ON DELETE SET NULL,
    riesgo_id UUID REFERENCES riesgos(id) ON DELETE SET NULL,
    reportado_por UUID REFERENCES usuarios(id) ON DELETE SET SET NULL,
    fecha_reporte TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_resolucion TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE evidencias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    municipio_id UUID REFERENCES municipios(id) ON DELETE SET NULL,
    entidad_tipo VARCHAR(80) NOT NULL,
    entidad_id UUID NOT NULL,
    url TEXT NOT NULL,
    tipo evidencia_tipo NOT NULL,
    caption TEXT,
    tomado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    timestamp_foto TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE inspecciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incidente_id UUID REFERENCES incidentes(id) ON DELETE CASCADE,
    activo_id UUID REFERENCES activos(id) ON DELETE SET NULL,
    inspector_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    resultado VARCHAR(255),
    observaciones TEXT,
    fecha_inspeccion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(80) NOT NULL UNIQUE,
    municipio_id UUID REFERENCES municipios(id) ON DELETE SET NULL,
    incidente_id UUID REFERENCES incidentes(id) ON DELETE SET NULL,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    cuadrilla_id UUID REFERENCES cuadrillas(id) ON DELETE SET NULL,
    estado orden_estado NOT NULL DEFAULT 'detectado',
    prioridad prioridad NOT NULL DEFAULT 'media',
    descripcion TEXT,
    fecha_asignacion TIMESTAMPTZ,
    fecha_inicio TIMESTAMPTZ,
    fecha_cierre TIMESTAMPTZ,
    creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    actualizado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE ordenes_materiales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    item VARCHAR(200) NOT NULL,
    cantidad NUMERIC(10,2) NOT NULL CHECK (cantidad > 0),
    unidad VARCHAR(40) NOT NULL,
    estado VARCHAR(120),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventario_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(120) NOT NULL UNIQUE,
    nombre VARCHAR(180) NOT NULL,
    descripcion TEXT,
    cantidad NUMERIC(12,2) NOT NULL DEFAULT 0,
    area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
    creado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    actualizado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE auditoria_eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidad_tipo VARCHAR(100) NOT NULL,
    entidad_id UUID NOT NULL,
    accion VARCHAR(120) NOT NULL,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    datos JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_incidentes_area_estado_prioridad ON incidentes(area_id, estado, prioridad);
CREATE INDEX idx_incidentes_geo ON incidentes USING GIST (ll_to_earth(lat, lng));
CREATE INDEX idx_ordenes_area_estado ON ordenes_trabajo(area_id, estado);
CREATE INDEX idx_activos_tipo_estado ON activos(tipo_activo_id, estado);
CREATE INDEX idx_cuadrillas_area_estado ON cuadrillas(area_id, estado);

-- Datos semilla
INSERT INTO municipios (nombre, codigo) VALUES ('Municipio Demo', 'MUNICIPIO_DEMO') ON CONFLICT DO NOTHING;

INSERT INTO areas (municipio_id, nombre, descripcion)
SELECT id, 'Poda', 'Área de poda de árboles' FROM municipios WHERE codigo = 'MUNICIPIO_DEMO' ON CONFLICT DO NOTHING;
INSERT INTO areas (municipio_id, nombre, descripcion)
SELECT id, 'Luminaria', 'Área de mantenimiento de luminarias' FROM municipios WHERE codigo = 'MUNICIPIO_DEMO' ON CONFLICT DO NOTHING;
INSERT INTO areas (municipio_id, nombre, descripcion)
SELECT id, 'Higiene Urbana', 'Área de higiene urbana y limpieza' FROM municipios WHERE codigo = 'MUNICIPIO_DEMO' ON CONFLICT DO NOTHING;

INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador total'),
('supervisor', 'Supervisor de cuadrilla'),
('operador', 'Operario de campo'),
('inspector', 'Inspector técnico')
ON CONFLICT DO NOTHING;

INSERT INTO tipos_activo (nombre, descripcion) VALUES
('Luminaria', 'Activos tipo luminaria urbana'),
('Arbol', 'Activos tipo árbol o vegetación'),
('Contenedor', 'Activos de contenedores de basura')
ON CONFLICT DO NOTHING;
