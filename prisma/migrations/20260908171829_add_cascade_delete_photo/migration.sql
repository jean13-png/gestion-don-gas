-- DropForeignKey
ALTER TABLE "Photo" DROP CONSTRAINT "Photo_donId_fkey";

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_donId_fkey" FOREIGN KEY ("donId") REFERENCES "Don"("id") ON DELETE CASCADE ON UPDATE CASCADE;
