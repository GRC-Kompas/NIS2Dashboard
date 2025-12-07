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

## Sales Demo Flow

This version includes specific features for sales demonstrations.

### Setup
1. Ensure `.env` has `NEXT_PUBLIC_DEMO_MODE="true"` and `NEXT_PUBLIC_CALENDLY_URL`.
2. Reset database: `npm run seed` (or use the "Reset Demo" button in the UI if running).

### Demo Scenario
1.  **Executive Dashboard (Start):**
    *   **User:** Consultant (`consultant@grc-kompas.com` / `password123`)
    *   **Pitch:** "One glance overview of your entire portfolio's NIS2 readiness."
    *   **Visuals:** Traffic lights, aggregate score trend.

2.  **Portfolio View:**
    *   **Action:** Navigate to *Portfolio*.
    *   **Pitch:** "Identify high-risk clients instantly."
    *   **Demo Point:** Show **MSP Alpha** (High Risk) vs **MSP Bravo** (Medium Risk).

3.  **Deep Dive (MSP Alpha):**
    *   **Action:** Click on **MSP Alpha**.
    *   **Pitch:** "Detailed breakdown per NIS2 domain."
    *   **Feature:** Show *Roadmap Phases* (30 days / 6 months).
    *   **Feature:** **Incident Wizard**: Click "Meld Incident" to show the wizard flow.
    *   **Feature:** **Suppliers**: Click "Leveranciers" to show supply chain management.
    *   **Feature:** **Board Report**: Show the Board Report view.

4.  **Closing:**
    *   **Action:** Click "Plan NIS2-roadmap-sessie".
    *   **Pitch:** "Direct conversion from analysis to action."
    *   **Audit:** Show *Audit Log* to demonstrate compliance tracking.

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
    Create a `.env` file (copy from `.env.example`).
    ```env
    DATABASE_URL="file:./dev.db"
    NEXTAUTH_SECRET="your-secret-key"
    NEXT_PUBLIC_CALENDLY_URL="https://calendly.com/grc-kompas/roadmap-session"
    NEXT_PUBLIC_DEMO_MODE="true"
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

## Cloud Run & Production

Refer to [DEPLOYMENT_CLOUD_RUN.md](docs/DEPLOYMENT_CLOUD_RUN.md) for detailed deployment instructions.

### Switching to PostgreSQL

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
