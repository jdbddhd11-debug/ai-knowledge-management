-- CreateTable
CREATE TABLE "KnowledgeSpace" (
    "knowledgeId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("knowledgeId", "spaceId"),
    CONSTRAINT "KnowledgeSpace_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "KnowledgeItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KnowledgeSpace_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Migrate existing data: copy spaceId relationships to KnowledgeSpace table
INSERT INTO "KnowledgeSpace" ("knowledgeId", "spaceId", "createdAt")
SELECT "id", "spaceId", CURRENT_TIMESTAMP
FROM "KnowledgeItem"
WHERE "spaceId" IS NOT NULL;

-- Add title column to KnowledgeItem
ALTER TABLE "KnowledgeItem" ADD COLUMN "title" TEXT;

-- Drop the old spaceId column and its index
DROP INDEX IF EXISTS "KnowledgeItem_spaceId_idx";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KnowledgeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_KnowledgeItem" ("id", "type", "content", "createdAt", "updatedAt", "title") SELECT "id", "type", "content", "createdAt", "updatedAt", "title" FROM "KnowledgeItem";
DROP TABLE "KnowledgeItem";
ALTER TABLE "new_KnowledgeItem" RENAME TO "KnowledgeItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
