# **Security & Logging Checklist**

## **1\. Security Controls**

### **Access Control (RBAC) & Multi-Tenancy**

* \[ \] **Middleware Enforcement:** Ensure middleware checks the user role (consultant vs client) on every protected route.  
* \[ \] **Row-Level Isolation:** Verify that **every** database query for a client user includes WHERE organisation\_id \= session.user.organisation\_id.  
* \[ \] **UUIDs:** Use UUIDs for all primary keys to prevent resource enumeration attacks (e.g., guessing id=5).

### **Input & Data**

* \[ \] **Validation:** Use **Zod** schemas to strictly validate all incoming JSON bodies, especially the raw\_answers in Quickscan submissions.  
* \[ \] **Sanitization:** Ensure no HTML/JS is rendered from user input in the "Improvement Actions" fields (prevent XSS).

### **Configuration**

* \[ \] **Cookies:** Set session cookies to Secure, HttpOnly, and SameSite=Lax.  
* \[ \] **Headers:** Configure security headers (HSTS, X-Content-Type-Options, X-Frame-Options) via next.config.js or middleware.  
* \[ \] **Least Privilege:** The database user used by the app should **not** be a superuser. It should only have SELECT, INSERT, UPDATE, DELETE on specific tables.

### **Secrets**

* \[ \] **Secret Manager:** Ensure DATABASE\_URL and NEXTAUTH\_SECRET are only accessible via Google Secret Manager and not visible in Cloud Run environment variable UI (use secrets mounting).

## **2\. Logging & Audit**

### **Structured Logging**

* \[ \] Use a library like pino to output logs as structured **JSON**.  
* \[ \] Cloud Run automatically captures stdout/stderr and parses JSON fields into Cloud Logging for easy querying.

### **Audit Trail**

Log specific "Write" events to create an audit trail.

* **Who:** user\_id, email, role  
* **What:** action (e.g., QUICKSCAN\_SUBMIT, SCORE\_RECALC, ACTION\_UPDATE)  
* **Where:** organisation\_id  
* **When:** timestamp

**Example Log Entry:**

{  
  "level": "info",  
  "event": "audit",  
  "action": "UPDATE\_RISK\_SCORE",  
  "user\_id": "uuid-123",  
  "organisation\_id": "uuid-456",  
  "message": "User recalculated risk scores for MSP Alpha"  
}

### **Alerting**

Set up Google Cloud Monitoring alerts for:

* \[ \] **High Error Rate:** \>1% of requests returning 5xx status.  
* \[ \] **Container Crashing:** Cloud Run container startup failures.  
* \[ \] **Database Latency:** Query times exceeding 2 seconds.