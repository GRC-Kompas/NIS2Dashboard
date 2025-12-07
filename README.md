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

## UI Overview & Sales Demo v1.2

The application features a B2B SaaS dashboard tailored for sales demos with Dutch copy and specific risk narratives.

### Demo Scenario: "A Tale of Two MSPs"

The seed data creates two contrasting MSPs to demonstrate the value of the platform:

1.  **MSP Alpha (High Risk)**
    *   **Score:** ~40/100 (Red)
    *   **Narrative:** Struggling with basics. No MFA for admins, no incident procedure.
    *   **Demo Point:** Use this to show the "Roadmap Session" CTA and urgent "30-day" actions.

2.  **MSP Bravo (Medium Risk)**
    *   **Score:** ~70/100 (Orange/Yellow)
    *   **Narrative:** Doing okay on governance, but weak on supply chain controls.
    *   **Demo Point:** Show how they are "on the right track" but need specific help with vendors to reach "Audit Ready" state.

### Demo Flow

1.  **Login as Consultant:**
    *   **Email:** `consultant@grc-kompas.com` / `password123`
    *   **View:** Portfolio Dashboard.
    *   **Action:** Show the overview of all clients. Point out the red/orange badges. Click on **MSP Alpha**.

2.  **Drill Down (MSP Alpha):**
    *   **View:** Organisation Detail.
    *   **Action:** Explain the low scores. Scroll to the "Roadmap Phases" (30 days / 3-6 months).
    *   **CTA:** Click the "Plan een NIS2-roadmap-sessie" button to demonstrate the sales conversion path.

3.  **Login as Client (Optional):**
    *   **Email:** `admin@msp-bravo.com` / `password123`
    *   **View:** Their own dashboard (MSP Bravo).
    *   **Note:** They cannot see the Portfolio or the Consultant CTA.

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
