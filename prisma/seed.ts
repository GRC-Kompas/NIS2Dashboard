import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10)

  // 1. Create Organisations
  const org1 = await prisma.organisation.create({
    data: {
      name: 'MSP Alpha',
      nis2_segment: 'Essential',
    },
  })

  const org2 = await prisma.organisation.create({
    data: {
      name: 'Beta Services',
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

  // Client 1
  await prisma.user.create({
    data: {
      email: 'admin@msp-alpha.com',
      password_hash: passwordHash,
      role: 'client',
      organisation_id: org1.id,
    },
  })

  // Client 2
  await prisma.user.create({
    data: {
      email: 'admin@beta-services.com',
      password_hash: passwordHash,
      role: 'client',
      organisation_id: org2.id,
    },
  })

  // 3. Quickscan Results & Risk Scores
  // Org 1
  await prisma.quickscanResult.create({
    data: {
      organisation_id: org1.id,
      raw_answers: JSON.stringify({ q1: 'Yes', q2: 'No' }), // Stringified JSON
      source: 'manual',
    },
  })

  await prisma.riskScore.create({
    data: {
      organisation_id: org1.id,
      overall_score: 85,
      governance_score: 90,
      risk_management_score: 80,
      incident_score: 85,
      suppliers_score: 70,
    },
  })

  // Org 2
  await prisma.quickscanResult.create({
    data: {
      organisation_id: org2.id,
      raw_answers: JSON.stringify({ q1: 'No', q2: 'No' }),
      source: 'manual',
    },
  })

  await prisma.riskScore.create({
    data: {
      organisation_id: org2.id,
      overall_score: 40,
      governance_score: 50,
      risk_management_score: 30,
      incident_score: 40,
      suppliers_score: 40,
    },
  })

  // 4. Improvement Actions
  await prisma.improvementAction.create({
    data: {
      organisation_id: org1.id,
      title: 'Enable MFA',
      category: 'governance',
      priority: 'high',
      status: 'open',
    },
  })

  await prisma.improvementAction.create({
    data: {
      organisation_id: org1.id,
      title: 'Update Incident Plan',
      category: 'incident',
      priority: 'medium',
      status: 'in_progress',
    },
  })

    await prisma.improvementAction.create({
    data: {
      organisation_id: org2.id,
      title: 'Vendor Assessment',
      category: 'suppliers',
      priority: 'high',
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
