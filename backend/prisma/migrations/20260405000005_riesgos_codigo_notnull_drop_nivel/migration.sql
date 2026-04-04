-- codigo NOT NULL (rellenar vacíos primero por si hay datos)
UPDATE "riesgos" SET "codigo" = 'RIESGO_' || UPPER(REPLACE(SUBSTRING("nombre", 1, 40), ' ', '_')) WHERE "codigo" IS NULL;
ALTER TABLE "riesgos" ALTER COLUMN "codigo" SET NOT NULL;

-- Eliminar nivel (campo calculado en app: severidad_base * probabilidad_base)
ALTER TABLE "riesgos" DROP COLUMN "nivel";
