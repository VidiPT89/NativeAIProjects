import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  prismaStamp?: string
}

const STAMP = 'folio-v1'

export const prisma =
  globalForPrisma.prismaStamp === STAMP && globalForPrisma.prisma
    ? globalForPrisma.prisma
    : new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaStamp = STAMP
}
