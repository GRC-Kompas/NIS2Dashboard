import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Prisma 7 changed how configuration is loaded, but explicit definition should work if types match.
// If datasourceUrl is not in types, we might need to cast or use the older `datasources` property if available,
// or simply rely on env vars which seemed to fail.

// Let's try the `datasources` option which was standard in v5/v6
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
})

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // Clear existing data
  await prisma.improvementAction.deleteMany({})
  await prisma.riskScore.deleteMany({})
  await prisma.quickscanResult.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.organisation.deleteMany({})

  // 1. Create Organisations
  // MSP Alpha: High Risk (Score ~45)
  const org1 = await prisma.organisation.create({
    data: {
      name: 'MSP Alpha',
      nis2_segment: 'Essential', // e.g. Managed Service Provider (Large)
    },
  })

  // MSP Bravo: Medium/Low Risk (Score ~70)
  const org2 = await prisma.organisation.create({
    data: {
      name: 'MSP Bravo',
      nis2_segment: 'Important',
    },
  })

  // 2. Create Users
  // Consultant
  await prisma.user.create({
    data: {
      email: 'consultant@grc-kompas.com',
      password_hash: passwordHash,
      role: 'consultant',
      organisation_id: null,
    },
  })

  // Client 1 (Alpha)
  await prisma.user.create({
    data: {
      email: 'admin@msp-alpha.com',
      password_hash: passwordHash,
      role: 'client',
      organisation_id: org1.id,
    },
  })

  // Client 2 (Bravo)
  await prisma.user.create({
    data: {
      email: 'admin@msp-bravo.com', // changed from beta-services for consistency with instructions
      password_hash: passwordHash,
      role: 'client',
      organisation_id: org2.id,
    },
  })

  // 3. Quickscan Results & Risk Scores

  // Org 1: MSP Alpha (High Risk)
  // Scores: Gov 40, Risk 30, Inc 50, Sup 40 -> Avg ~40
  await prisma.quickscanResult.create({
    data: {
      organisation_id: org1.id,
      raw_answers: JSON.stringify({ q1: 'No', q2: 'No' }), // Placeholder
      source: 'manual',
    },
  })

  await prisma.riskScore.create({
    data: {
      organisation_id: org1.id,
      overall_score: 40,
      governance_score: 40,
      risk_management_score: 30,
      incident_score: 50,
      suppliers_score: 40,
    },
  })

  // Org 2: MSP Bravo (Medium Risk)
  // Scores: Gov 80, Risk 70, Inc 70, Sup 60 -> Avg 70
  await prisma.quickscanResult.create({
    data: {
      organisation_id: org2.id,
      raw_answers: JSON.stringify({ q1: 'Yes', q2: 'No' }),
      source: 'manual',
    },
  })

  await prisma.riskScore.create({
    data: {
      organisation_id: org2.id,
      overall_score: 70,
      governance_score: 80,
      risk_management_score: 70,
      incident_score: 70,
      suppliers_score: 60,
    },
  })

  // 4. Improvement Actions

  // MSP Alpha Actions (Urgent)
  await prisma.improvementAction.create({
    data: {
      organisation_id: org1.id,
      title: 'Implement Multi-Factor Authentication (MFA) on all admin accounts',
      category: 'governance',
      priority: 'high',
      status: 'open',
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 days
    },
  })

  await prisma.improvementAction.create({
    data: {
      organisation_id: org1.id,
      title: 'Establish Incident Response Procedure',
      category: 'incident',
      priority: 'high',
      status: 'open',
    },
  })

  await prisma.improvementAction.create({
    data: {
      organisation_id: org1.id,
      title: 'Formalize Supplier Security Requirements',
      category: 'suppliers',
      priority: 'medium',
      status: 'in_progress',
    },
  })

  // MSP Bravo Actions (Maintenance/Process)
  await prisma.improvementAction.create({
    data: {
      organisation_id: org2.id,
      title: 'Review and update Vendor Risk Assessment',
      category: 'suppliers',
      priority: 'medium',
      status: 'open',
    },
  })

  await prisma.improvementAction.create({
    data: {
      organisation_id: org2.id,
      title: 'Conduct annual staff security awareness training',
      category: 'governance',
      priority: 'low',
      status: 'open',
    },
  })

  console.log('Seed completed')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
