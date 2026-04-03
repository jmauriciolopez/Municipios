-- Drop the full unique index on email
DROP INDEX IF EXISTS "usuarios_email_key";

-- Recreate as partial: only enforce uniqueness among non-deleted rows
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email") WHERE "deleted_at" IS NULL;
