# **Deployment Guide: Google Cloud Run**

## **1\. Container Strategy**

We use a multi-stage **Dockerfile** optimized for Next.js **Standalone** mode. This reduces image size and improves startup time.

### **Dockerfile**

\# 1\. Install dependencies only when needed  
FROM node:18-alpine AS deps  
WORKDIR /app  
COPY package.json package-lock.json ./   
RUN npm ci

\# 2\. Rebuild the source code only when needed  
FROM node:18-alpine AS builder  
WORKDIR /app  
COPY \--from=deps /app/node\_modules ./node\_modules  
COPY . .  
\# Set env var to tell Next.js to output standalone build  
ENV NEXT\_PRIVATE\_STANDALONE true  
RUN npm run build

\# 3\. Production image, copy all the files and run next  
FROM node:18-alpine AS runner  
WORKDIR /app  
ENV NODE\_ENV production  
ENV PORT 3000

\# Create non-root user for security  
RUN addgroup \--system \--gid 1001 nodejs  
RUN adduser \--system \--uid 1001 nextjs

COPY \--from=builder /app/public ./public  
\# Automatically leverages output traces to reduce image size  
COPY \--from=builder \--chown=nextjs:nodejs /app/.next/standalone ./  
COPY \--from=builder \--chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs  
EXPOSE 3000

CMD \["node", "server.js"\]

## **2\. Environment Variables**

The application requires the following environment variables at runtime:

* NODE\_ENV: Set to production.  
* PORT: Standard is 3000 (Cloud Run sets this automatically to 8080 usually, but we expose 3000).  
* DATABASE\_URL: Connection string for PostgreSQL.  
* NEXTAUTH\_SECRET: Random string for session encryption.  
* NEXTAUTH\_URL: The public URL of the deployed service.

## **3\. Deployment Command**

We deploy using gcloud CLI. This command configures the Cloud SQL Auth Proxy automatically.

### **Prerequisites**

* **Service Account:** Create a dedicated SA (e.g., grc-app-sa) with roles:  
  * Cloud SQL Client  
  * Secret Manager Secret Accessor  
* **Secrets:** Store the DB connection string in Secret Manager (e.g., projects/my-project/secrets/DATABASE\_URL).

### **Deploy Script**

gcloud run deploy grc-kompas-app \\  
  \--source . \\  
  \--region europe-west4 \\  
  \--allow-unauthenticated \\  
  \--set-env-vars NODE\_ENV=production \\  
  \--set-secrets "DATABASE\_URL=projects/my-project/secrets/DATABASE\_URL/versions/1" \\  
  \--set-secrets "NEXTAUTH\_SECRET=projects/my-project/secrets/NEXTAUTH\_SECRET/versions/1" \\  
  \--add-cloudsql-instances "my-project:europe-west4:my-db-instance" \\  
  \--service-account "grc-app-sa@my-project.iam.gserviceaccount.com"

## **4\. Best Practices**

### **Cloud SQL Connection**

* **Unix Sockets:** The \--add-cloudsql-instances flag mounts the Cloud SQL instance as a Unix socket at /cloudsql/INSTANCE\_CONNECTION\_NAME.  
* Connection String: Your DATABASE\_URL should look like:  
  postgresql://USER:PASSWORD@localhost/DB\_NAME?host=/cloudsql/PROJECT\_ID:REGION:INSTANCE\_ID  
  Note: localhost is used because the socket mimics a local connection.

### **Secret Management**

* **Never** hardcode passwords in the Dockerfile or Git.  
* Always use \--set-secrets to inject sensitive values as environment variables at runtime.