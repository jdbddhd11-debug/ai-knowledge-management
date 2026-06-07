-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proxyUrl" TEXT,
    "apiKey" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ApiSettings" ("apiKey", "createdAt", "id", "model", "proxyUrl", "temperature", "updatedAt") SELECT "apiKey", "createdAt", "id", "model", "proxyUrl", "temperature", "updatedAt" FROM "ApiSettings";
DROP TABLE "ApiSettings";
ALTER TABLE "new_ApiSettings" RENAME TO "ApiSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
