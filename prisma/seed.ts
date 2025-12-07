import { PrismaClient } from '@prisma/client'
import { seedDemoData } from '../src/lib/seed-logic'

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
})

async function main() {
    await seedDemoData(prisma)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
