-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KnowledgeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "spaceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KnowledgeItem_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_KnowledgeItem" ("content", "createdAt", "id", "type", "updatedAt") SELECT "content", "createdAt", "id", "type", "updatedAt" FROM "KnowledgeItem";
DROP TABLE "KnowledgeItem";
ALTER TABLE "new_KnowledgeItem" RENAME TO "KnowledgeItem";
CREATE INDEX "KnowledgeItem_spaceId_idx" ON "KnowledgeItem"("spaceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
