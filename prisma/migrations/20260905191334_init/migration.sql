-- CreateEnum
CREATE TYPE "NatureDon" AS ENUM ('MATERIEL_INFORMATIQUE', 'EQUIPEMENT_PEDAGOGIQUE', 'DON_FINANCIER', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutDon" AS ENUM ('SOUMIS', 'EN_VERIFICATION', 'INSPECTE', 'VALIDE', 'FICHE_GENEREE');

-- CreateTable
CREATE TABLE "Donateur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "organisme" TEXT,
    "email" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Don" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "nature" "NatureDon" NOT NULL,
    "description" TEXT NOT NULL,
    "localisation" TEXT NOT NULL,
    "statut" "StatutDon" NOT NULL DEFAULT 'SOUMIS',
    "donateurId" TEXT NOT NULL,
    "observations" TEXT,
    "ficheUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "Don_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "donId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Don_reference_key" ON "Don"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Don" ADD CONSTRAINT "Don_donateurId_fkey" FOREIGN KEY ("donateurId") REFERENCES "Donateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_donId_fkey" FOREIGN KEY ("donId") REFERENCES "Don"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
