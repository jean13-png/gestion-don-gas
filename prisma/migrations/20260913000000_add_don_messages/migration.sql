CREATE TABLE "DonMessage" (
    "id" TEXT NOT NULL,
    "donId" TEXT NOT NULL,
    "expediteur" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DonMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DonMessage_donId_createdAt_idx"
    ON "DonMessage"("donId", "createdAt");

ALTER TABLE "DonMessage"
    ADD CONSTRAINT "DonMessage_donId_fkey"
    FOREIGN KEY ("donId") REFERENCES "Don"("id") ON DELETE CASCADE ON UPDATE CASCADE;
