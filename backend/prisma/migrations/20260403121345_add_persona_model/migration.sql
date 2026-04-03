/*
  Warnings:

  - You are about to drop the column `usuario_id` on the `cuadrilla_miembros` table. All the data in the column will be lost.
  - Added the required column `persona_id` to the `cuadrilla_miembros` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cuadrilla_miembros" DROP CONSTRAINT "cuadrilla_miembros_usuario_id_fkey";

-- AlterTable
ALTER TABLE "cuadrilla_miembros" DROP COLUMN "usuario_id",
ADD COLUMN     "persona_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "personas" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "dni" VARCHAR(20),
    "telefono" VARCHAR(50),
    "email" VARCHAR(160),
    "usuario_id" UUID,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personas_dni_key" ON "personas"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "personas_usuario_id_key" ON "personas"("usuario_id");

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuadrilla_miembros" ADD CONSTRAINT "cuadrilla_miembros_persona_id_fkey" FOREIGN KEY ("persona_id") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
