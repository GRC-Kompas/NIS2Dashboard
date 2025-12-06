-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_quickscan_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organisation_id" TEXT NOT NULL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_answers" TEXT NOT NULL,
    "source" TEXT DEFAULT 'manual',
    CONSTRAINT "quickscan_results_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_quickscan_results" ("id", "organisation_id", "raw_answers", "source", "submitted_at") SELECT "id", "organisation_id", "raw_answers", "source", "submitted_at" FROM "quickscan_results";
DROP TABLE "quickscan_results";
ALTER TABLE "new_quickscan_results" RENAME TO "quickscan_results";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
