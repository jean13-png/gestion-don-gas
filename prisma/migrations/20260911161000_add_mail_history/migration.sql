CREATE TABLE "Parametre" (
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    CONSTRAINT "Parametre_pkey" PRIMARY KEY ("cle")
);

CREATE TABLE "Historique" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "donId" TEXT,
    "destinataire" TEXT,
    "sujet" TEXT,
    "contenuHtml" TEXT,
    "statut" TEXT NOT NULL,
    "erreur" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Historique_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Historique_createdAt_idx" ON "Historique"("createdAt");
CREATE INDEX "Historique_type_statut_idx" ON "Historique"("type", "statut");
