# GRC Kompas – NIS2 Compliance Dashboard (MVP)

This repository contains the code and documentation for the NIS2 compliance dashboard for MSPs and IT service providers, developed by GRC Kompas.

## Documentation

See `/docs` for detailed design and specification documents:
- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [DATA_MODEL.md](docs/DATA_MODEL.md)
- [RISK_SCORING.md](docs/RISK_SCORING.md)
- [API_SPEC.md](docs/API_SPEC.md)
- [DEPLOYMENT_CLOUD_RUN.md](docs/DEPLOYMENT_CLOUD_RUN.md)
- [SECURITY_LOGGING_CHECKLIST.md](docs/SECURITY_LOGGING_CHECKLIST.md)
- [SECURITY_STATUS.md](SECURITY_STATUS.md)

## UI Overview

The application features a B2B SaaS dashboard layout tailored for two roles:

### Roles & Navigation
*   **Consultants (GRC Kompas):**
    *   **Default View:** Portfolio Dashboard (/dashboard/portfolio).
    *   **Sidebar:** Portfolio, Actions (All), Logout.
    *   **Capabilities:** View all organisations, drill down into any client detail, see "Consultant View" indicators and Call-to-Action for roadmap sessions.
*   **Clients (MSPs):**
    *   **Default View:** Organisation Detail (/dashboard/org/[id]).
    *   **Sidebar:** My Organisation, Actions (My Org), Logout.
    *   **Capabilities:** View only their own scores and actions. Access to other data is restricted by RBAC.

### Key Pages
*   **Portfolio:** Table of all managed MSPs with Risk Levels (High/Medium/Low) and scores.
*   **Organisation Detail:**
    *   **Score Card:** Overall NIS2 maturity score.
    *   **Category Grid:** Governance, Risk Mgmt, Incident, Supply Chain scores.
    *   **Improvement Actions:** Prioritized list of tasks with status management.
    *   **Charts:** Visual breakdown of compliance categories.

## Local Development

### Prerequisites

- Node.js 18+
- npm
- Docker (optional, for running local DB if not using a cloud instance)

### Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file in the root directory (copy from `.env.example` if available) and set the following variables:
    ```env
    DATABASE_URL="file:./dev.db"  # Use SQLite for local
    # For Postgres: DATABASE_URL="postgresql://user:password@localhost:5432/nis2db"
    NEXTAUTH_SECRET="your-secret-key"
    ```

3.  **Database Setup (SQLite):**
    ```bash
    npx prisma migrate dev --name init
    npx ts-node prisma/seed.ts
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at [http://localhost:3000](http://localhost:3000).

5.  **Run Tests:**
    ```bash
    npm test
    ```

### Demo Users (Local Seed)

The seed script creates the following users for local development:

*   **Consultant:**
    *   Email: `consultant@grc-kompas.com`
    *   Password: `password123`
    *   Access: Full Portfolio

*   **Client (MSP Alpha):**
    *   Email: `admin@msp-alpha.com`
    *   Password: `password123`
    *   Access: Only MSP Alpha details

*   **Client (Beta Services):**
    *   Email: `admin@beta-services.com`
    *   Password: `password123`
    *   Access: Only Beta Services details

## Cloud Run & Production

Refer to [DEPLOYMENT_CLOUD_RUN.md](docs/DEPLOYMENT_CLOUD_RUN.md) for detailed deployment instructions.

### Building & Running Docker Locally

To verify the production build locally:

1.  **Build the image:**
    ```bash
    docker build -t nis2-dashboard .
    ```

2.  **Run the container:**
    ```bash
    docker run -p 3000:3000 -e PORT=3000 -e DATABASE_URL="file:./dev.db" -e NEXTAUTH_SECRET="secret" nis2-dashboard
    ```
    *Note: For `DATABASE_URL` with SQLite inside Docker, you might need to mount the volume containing `dev.db` or use a Postgres instance.*

### Switching to PostgreSQL

The application is designed to run on PostgreSQL in production (Cloud SQL).

1.  **Update Prisma Schema:**
    Open `prisma/schema.prisma` and change:
    ```prisma
    datasource db {
      provider = "postgresql" // changed from "sqlite"
      url      = env("DATABASE_URL")
    }
    ```

2.  **Migrations:**
    Run migrations against your Postgres database:
    ```bash
    DATABASE_URL="postgresql://user:pass@host:5432/db" npx prisma migrate deploy
    ```

### Cloud Run Deploy

```bash
gcloud run deploy grc-kompas-app \
  --source . \
  --region europe-west4 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets "DATABASE_URL=projects/my-project/secrets/DATABASE_URL/versions/1" \
  --set-secrets "NEXTAUTH_SECRET=projects/my-project/secrets/NEXTAUTH_SECRET/versions/1"
```
