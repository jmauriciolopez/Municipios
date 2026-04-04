ALTER TABLE "riesgos"
  ADD COLUMN "codigo"                    VARCHAR(80)  UNIQUE,
  ADD COLUMN "categoria_id"              UUID         REFERENCES "categorias"("id") ON DELETE SET NULL,
  ADD COLUMN "activo_id"                 UUID         REFERENCES "activos"("id") ON DELETE SET NULL,
  ADD COLUMN "severidad_base"            INTEGER      NOT NULL DEFAULT 3 CHECK (severidad_base BETWEEN 1 AND 5),
  ADD COLUMN "probabilidad_base"         INTEGER      NOT NULL DEFAULT 3 CHECK (probabilidad_base BETWEEN 1 AND 5),
  ADD COLUMN "requiere_accion_inmediata" BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN "es_preventivo"             BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN "sla_sugerido_horas"        INTEGER,
  ADD COLUMN "icono"                     TEXT,
  ADD COLUMN "color"                     TEXT,
  ADD COLUMN "activo"                    BOOLEAN      NOT NULL DEFAULT true;

-- nivel = severidad_base * probabilidad_base (calculado, se puede actualizar con trigger o en app)
-- índices
CREATE INDEX "riesgos_categoria_id_idx" ON "riesgos"("categoria_id");
CREATE INDEX "riesgos_area_id_idx"      ON "riesgos"("area_id");
CREATE INDEX "riesgos_codigo_idx"       ON "riesgos"("codigo");
