ALTER TABLE "incidentes"
  ADD COLUMN "categoria_id" UUID REFERENCES "categorias"("id") ON DELETE SET NULL;
