import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function seedDemoData(prisma: PrismaClient) {
    const passwordHash = await bcrypt.hash('password123', 10)

    // Clear existing data
    await prisma.auditLog.deleteMany({})
    await prisma.incident.deleteMany({})
    await prisma.supplier.deleteMany({})
    await prisma.improvementAction.deleteMany({})
    await prisma.riskScore.deleteMany({})
    await prisma.quickscanResult.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.organisation.deleteMany({})

    // 1. Create Organisations
    // MSP Alpha: High Risk (Score ~40)
    const org1 = await prisma.organisation.create({
      data: {
        name: 'MSP Alpha',
        nis2_segment: 'Essential',
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
    const consultant = await prisma.user.create({
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
        email: 'admin@msp-bravo.com',
        password_hash: passwordHash,
        role: 'client',
        organisation_id: org2.id,
      },
    })

    // 3. Quickscan Results & Risk Scores

    // Org 1: MSP Alpha (High Risk)
    await prisma.quickscanResult.create({
      data: {
        organisation_id: org1.id,
        raw_answers: JSON.stringify({ q1: 'No', q2: 'No' }),
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

    // MSP Alpha
    await prisma.improvementAction.create({
      data: {
        organisation_id: org1.id,
        title: 'Implement Multi-Factor Authentication (MFA) on all admin accounts',
        category: 'governance',
        priority: 'high',
        status: 'open',
        due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
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

    // MSP Bravo
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

    // 5. Incidents
    await prisma.incident.create({
        data: {
            organisation_id: org1.id,
            type: 'Ransomware poging',
            impact: 'Geïsoleerd werkstation',
            discovered_at: new Date(),
            initial_actions: 'Werkstation losgekoppeld, logs veiliggesteld',
            contact_name: 'Jan de Vries',
            contact_email: 'jan@msp-alpha.com'
        }
    })

    // 6. Suppliers
    await prisma.supplier.create({
        data: {
            organisation_id: org2.id,
            name: 'CloudHosting BV',
            type: 'Cloud Provider',
            risk_level: 'High',
            status: 'Vragenlijst verstuurd',
            contact_email: 'support@cloudhosting.nl'
        }
    })

    await prisma.supplier.create({
        data: {
            organisation_id: org2.id,
            name: 'KantoorSchoonmaak',
            type: 'Facilitair',
            risk_level: 'Low',
            status: 'Geen vragenlijst',
        }
    })

    // 7. Audit Logs
    await prisma.auditLog.create({
        data: {
            organisation_id: org1.id,
            user_id: consultant.id,
            action: 'DEMO_RESET',
            details: JSON.stringify({ reason: 'Initial Seed' })
        }
    })

    console.log('Seed completed with Sales Demo v1.2 data')
}
