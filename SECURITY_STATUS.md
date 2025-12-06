# Security & Logging Status

This document summarizes the current security and logging implementation status for the NIS2 Compliance Dashboard MVP.

## Security Controls

### Access Control (RBAC) & Multi-Tenancy

*   [x] **Middleware Enforcement:** Dashboard routes are protected by middleware checking for a valid session.
*   [x] **Row-Level Isolation:**
    *   API routes explicitly check `session.organisationId` against the requested resource ID for Client users.
    *   Consultant users are permitted to access all resources.
    *   Integration tests (`src/lib/rbac.test.ts`) verify this isolation.
*   [x] **UUIDs:** All primary keys use UUIDs to prevent resource enumeration.

### Input & Data

*   [x] **Validation:** Zod is used to validate input for Login, Quickscan submission, and Action creation/updates.
*   [x] **Sanitization:** React handles basic output encoding to prevent XSS. String inputs are validated via Zod.

### Configuration

*   [x] **Cookies:** Session cookies are set with `HttpOnly`, `SameSite=Lax`, and `Secure` (in production).
*   [x] **Least Privilege:** Application connects via standard user (requires DB setup adjustment in prod).
*   [x] **Secrets:** Secrets are loaded via environment variables; Cloud Run configured to use Secret Manager.

## Logging & Audit

### Structured Logging

*   [ ] **JSON Logger:** Currently using `console.log`. For production, a library like `pino` should be integrated to output structured JSON for Cloud Logging.

### Audit Trail

*   [x] **Basic Audit Logging:** Critical actions (e.g., updating action status) log an audit event to stdout.
    *   Fields logged: `user_id`, `organisation_id`, `action`, `timestamp`.
*   [ ] **Comprehensive Audit:** Expand audit logging to all write operations (Quickscan submission, Score recalculation).

### Alerting

*   [ ] **Monitoring:** Google Cloud Monitoring alerts need to be configured in the infrastructure layer (Terraform or Console).
