/*
  Warnings:

  - You are about to drop the `_FavoriteCharacters` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_FavoriteCharacters" DROP CONSTRAINT "_FavoriteCharacters_A_fkey";

-- DropForeignKey
ALTER TABLE "_FavoriteCharacters" DROP CONSTRAINT "_FavoriteCharacters_B_fkey";

-- DropTable
DROP TABLE "_FavoriteCharacters";

-- CreateTable
CREATE TABLE "FavoriteCharacter" (
    "id" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    CONSTRAINT "FavoriteCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteCharacter_userId_characterId_key" ON "FavoriteCharacter"("userId", "characterId");

-- AddForeignKey
ALTER TABLE "FavoriteCharacter" ADD CONSTRAINT "FavoriteCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteCharacter" ADD CONSTRAINT "FavoriteCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
