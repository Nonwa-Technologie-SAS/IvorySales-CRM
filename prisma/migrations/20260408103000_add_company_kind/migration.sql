-- Add CompanyKind enum + Company.kind column
DO $$
BEGIN
  CREATE TYPE "CompanyKind" AS ENUM ('GROUP', 'CLIENT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Company"
  ADD COLUMN IF NOT EXISTS "kind" "CompanyKind" NOT NULL DEFAULT 'CLIENT';

