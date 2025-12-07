-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nis2_segment" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "organisation_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quickscan_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organisation_id" TEXT NOT NULL,
    "submitted_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_answers" TEXT NOT NULL,
    "source" TEXT DEFAULT 'manual',
    CONSTRAINT "quickscan_results_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "risk_scores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organisation_id" TEXT NOT NULL,
    "calculated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overall_score" INTEGER,
    "governance_score" INTEGER,
    "risk_management_score" INTEGER,
    "incident_score" INTEGER,
    "suppliers_score" INTEGER,
    "method_version" TEXT DEFAULT 'v1.0',
    CONSTRAINT "risk_scores_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "improvement_actions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organisation_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "priority" TEXT,
    "status" TEXT DEFAULT 'open',
    "due_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "improvement_actions_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organisation_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "discovered_at" DATETIME NOT NULL,
    "initial_actions" TEXT,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "incidents_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organisation_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "contact_email" TEXT,
    "risk_level" TEXT,
    "status" TEXT DEFAULT 'Geen vragenlijst',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "suppliers_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organisation_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
