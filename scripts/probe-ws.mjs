import ws from 'ws'
import { PrismaNeon } from '@prisma/adapter-neon'
globalThis.WebSocket = ws
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
console.log('adapter constructed')
import('@prisma/client').then(async ({ PrismaClient }) => {
  console.log('prisma import ok')
}).catch(e => console.error('import fail', e?.message))
