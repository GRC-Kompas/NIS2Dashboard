import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'client@beta.nl' } })
  if (!user) {
    console.log('User not found')
    // Let's create it if it doesn't exist for verification
    const hash = await bcrypt.hash('password123', 10)
    await prisma.user.create({
        data: {
            email: 'client@beta.nl',
            password_hash: hash,
            role: 'client',
            organisation: {
                create: {
                   name: 'Beta Services',
                   nis2_segment: 'Important'
                }
            }
        }
    })
    console.log('User created')
  } else {
    console.log('User found')
    const match = await bcrypt.compare('password123', user.password_hash)
    console.log('Password match:', match)
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
