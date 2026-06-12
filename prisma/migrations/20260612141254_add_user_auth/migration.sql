/*
  Warnings:

  - You are about to drop the column `createdAt` on the `KnowledgeSpace` table. All the data in the column will be lost.
  - Added the required column `userId` to the `KnowledgeItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AIConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proxyUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "AIConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KnowledgeItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "KnowledgeItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_KnowledgeItem" ("content", "createdAt", "id", "title", "type", "updatedAt") SELECT "content", "createdAt", "id", "title", "type", "updatedAt" FROM "KnowledgeItem";
DROP TABLE "KnowledgeItem";
ALTER TABLE "new_KnowledgeItem" RENAME TO "KnowledgeItem";
CREATE TABLE "new_KnowledgeSpace" (
    "knowledgeId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,

    PRIMARY KEY ("knowledgeId", "spaceId"),
    CONSTRAINT "KnowledgeSpace_knowledgeId_fkey" FOREIGN KEY ("knowledgeId") REFERENCES "KnowledgeItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KnowledgeSpace_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_KnowledgeSpace" ("knowledgeId", "spaceId") SELECT "knowledgeId", "spaceId" FROM "KnowledgeSpace";
DROP TABLE "KnowledgeSpace";
ALTER TABLE "new_KnowledgeSpace" RENAME TO "KnowledgeSpace";
CREATE TABLE "new_Space" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "spaceType" TEXT NOT NULL DEFAULT 'topic',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Space_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Space" ("createdAt", "description", "id", "name", "spaceType", "updatedAt") SELECT "createdAt", "description", "id", "name", "spaceType", "updatedAt" FROM "Space";
DROP TABLE "Space";
ALTER TABLE "new_Space" RENAME TO "Space";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
