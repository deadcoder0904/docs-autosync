-- CreateTable
CREATE TABLE "docs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modified_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT false
);
