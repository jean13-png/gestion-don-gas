-- Add originalNature column to Don to preserve donor-submitted type
ALTER TABLE "Don"
  ADD COLUMN "originalNature" "NatureDon";
