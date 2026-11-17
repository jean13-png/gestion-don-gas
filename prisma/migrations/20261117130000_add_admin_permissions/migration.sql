-- Comptes administrateurs : autorisations et activation.
-- Chaque compte dispose d'autorisations granulaires ; un compte desactive
-- ne peut plus se connecter ni agir meme avec une session ouverte.

ALTER TABLE "Admin" ADD COLUMN "actif" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Admin" ADD COLUMN "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Les comptes existants (administration actuelle) gardent tous les droits.
UPDATE "Admin"
SET "permissions" = ARRAY[
  'dons.creer',
  'dons.modifier',
  'dons.statuts',
  'dons.supprimer',
  'dons.attestations',
  'dons.export',
  'contenu.gerer',
  'comptes.gerer'
]::TEXT[];
