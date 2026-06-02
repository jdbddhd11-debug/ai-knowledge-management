-- CreateTable
CREATE TABLE "ApiSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proxyUrl" TEXT,
    "apiKey" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "temperature" REAL NOT NULL DEFAULT 0.7,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
