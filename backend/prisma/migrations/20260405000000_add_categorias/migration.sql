CREATE TABLE "categorias" (
  "id"          UUID        NOT NULL DEFAULT gen_random_uuid(),
  "codigo"      VARCHAR(60) NOT NULL,
  "nombre"      VARCHAR(120) NOT NULL,
  "descripcion" TEXT,
  "nivel"       INTEGER     NOT NULL DEFAULT 1,
  "padre_id"    UUID,
  "activo"      BOOLEAN     NOT NULL DEFAULT true,
  "created_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT "categorias_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "categorias_codigo_key" UNIQUE ("codigo"),
  CONSTRAINT "categorias_padre_id_fkey" FOREIGN KEY ("padre_id")
    REFERENCES "categorias"("id") ON DELETE SET NULL
);
