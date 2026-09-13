DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'StatutDon'
      AND e.enumlabel = 'PROGRAMMEE'
  ) THEN
    ALTER TYPE "StatutDon" ADD VALUE 'PROGRAMMEE';
  END IF;
END $$;

ALTER TABLE "Don"
  ADD COLUMN IF NOT EXISTS "dateProgrammation" TIMESTAMP(3);
