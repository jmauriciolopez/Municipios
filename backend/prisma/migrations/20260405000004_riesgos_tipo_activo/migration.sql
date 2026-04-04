-- Quitar FK y columna activo_id
ALTER TABLE "riesgos" DROP CONSTRAINT IF EXISTS "riesgos_activo_id_fkey";
ALTER TABLE "riesgos" DROP COLUMN IF EXISTS "activo_id";

-- Agregar tipo_activo_id
ALTER TABLE "riesgos"
  ADD COLUMN "tipo_activo_id" UUID REFERENCES "tipos_activo"("id") ON DELETE SET NULL;

CREATE INDEX "riesgos_tipo_activo_id_idx" ON "riesgos"("tipo_activo_id");
